from urllib import urlencode
import logging

from pylons import config

from ckan.plugins import toolkit as tk
import ckan.model as model
import ckan.lib.base as base
import ckan.lib.helpers as h
import ckan.lib.navl.dictization_functions as dict_fns
import ckan.logic as logic
import ckan.plugins as p
from ckan.common import OrderedDict, g
from ckan.controllers.package import PackageController, url_with_params, _encode_params

from ckanext.project.model import projectPackageAssociation
from ckanext.project.plugin import DATASET_TYPE_NAME

_ = tk._
c = tk.c
request = tk.request
render = tk.render
abort = tk.abort
redirect = base.redirect
NotFound = tk.ObjectNotFound
ValidationError = tk.ValidationError
check_access = tk.check_access
get_action = tk.get_action
tuplize_dict = logic.tuplize_dict
clean_dict = logic.clean_dict
parse_params = logic.parse_params
NotAuthorized = tk.NotAuthorized


log = logging.getLogger(__name__)


class projectController(PackageController):

    def new(self, data=None, errors=None, error_summary=None):

        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'auth_user_obj': c.userobj,
                   'save': 'save' in request.params}

        # Check access here, then continue with PackageController.new()
        # PackageController.new will also check access for package_create.
        # This is okay for now, while only sysadmins can create projects, but
        # may not work if we allow other users to create projects, who don't
        # have access to create dataset package types. Same for edit below.
        try:
            check_access('ckanext_project_create', context)
        except NotAuthorized:
            abort(401, _('Unauthorized to create a package'))

        return super(projectController, self).new(data=data, errors=errors,
                                                   error_summary=error_summary)

    def edit(self, id, data=None, errors=None, error_summary=None):
        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'auth_user_obj': c.userobj,
                   'save': 'save' in request.params,
                   'moderated': config.get('moderated'),
                   'pending': True}

        try:
            check_access('ckanext_project_update', context)
        except NotAuthorized:
            abort(401, _('User %r not authorized to edit %s') % (c.user, id))

        return super(projectController, self).edit(id, data=data, errors=errors,
                                                    error_summary=error_summary)

    def _guess_package_type(self, expecting_name=False):
        """project packages are always DATASET_TYPE_NAME."""

        return DATASET_TYPE_NAME

    def _save_new(self, context, package_type=None):
        '''
        The project is created then redirects to the manage_dataset page to
        associated packages with the new project.
        '''

        data_dict = clean_dict(dict_fns.unflatten(
                tuplize_dict(parse_params(request.POST))))

        data_dict['type'] = package_type
        context['message'] = data_dict.get('log_message', '')

        try:
            pkg_dict = get_action('ckanext_project_create')(context, data_dict)
        except ValidationError as e:
            errors = e.error_dict
            error_summary = e.error_summary
            data_dict['state'] = 'none'
            return self.new(data_dict, errors, error_summary)

        # redirect to manage datasets
        url = h.url_for(controller='ckanext.project.controller:projectController',
                        action='manage_datasets',
                        id=pkg_dict['name'])
        redirect(url)

    def _save_edit(self, name_or_id, context, package_type=None):
        '''
        Edit a project's details, then redirect to the project read page.
        '''

        data_dict = clean_dict(dict_fns.unflatten(
            tuplize_dict(parse_params(request.POST))))

        data_dict['id'] = name_or_id
        try:
            pkg = get_action('ckanext_project_update')(context, data_dict)
        except ValidationError as e:
            errors = e.error_dict
            error_summary = e.error_summary
            return self.edit(name_or_id, data_dict, errors, error_summary)

        c.pkg_dict = pkg

        # redirect to project details page
        url = h.url_for(controller='ckanext.project.controller:projectController',
                        action='read', id=pkg['name'])
        redirect(url)

    def read(self, id, format='html'):
        '''
        Detail view for a single project, listing its associated datasets.
        '''

        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'for_view': True,
                   'auth_user_obj': c.userobj}
        data_dict = {'id': id}

        # check if project exists
        try:
            c.pkg_dict = get_action('package_show')(context, data_dict)
        except NotFound:
            abort(404, _('project not found'))
        except NotAuthorized:
            abort(401, _('Unauthorized to read project %s') % id)

        # get project packages
        c.project_pkgs = get_action('ckanext_project_package_list')(context, {'project_id': c.pkg_dict['id']})

        package_type = DATASET_TYPE_NAME
        return render(self._read_template(package_type),
                      extra_vars={'dataset_type': package_type})

    def delete(self, id):
        if 'cancel' in request.params:
            tk.redirect_to(controller='ckanext.project.controller:projectController',
                          action='edit', id=id)

        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'auth_user_obj': c.userobj}

        try:
            check_access('ckanext_project_delete', context, {'id': id})
        except NotAuthorized:
            abort(401, _('Unauthorized to delete project %s') % '')

        try:
            if request.method == 'POST':
                get_action('ckanext_project_delete')(context, {'id': id})
                h.flash_notice(_('project has been deleted.'))
                tk.redirect_to(controller='ckanext.project.controller:projectController',
                              action='search')
            c.pkg_dict = get_action('package_show')(context, {'id': id})
        except NotAuthorized:
            abort(401, _('Unauthorized to delete project %s') % '')
        except NotFound:
            abort(404, _('project not found'))
        return render('project/confirm_delete.html',
                      extra_vars={'dataset_type': DATASET_TYPE_NAME})

    def dataset_project_list(self, id):
        '''
        Display a list of projects a dataset is associated with, with an
        option to add to project from a list.
        '''
        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'for_view': True,
                   'auth_user_obj': c.userobj}
        data_dict = {'id': id}

        try:
            check_access('package_show', context, data_dict)
        except NotFound:
            abort(404, _('Dataset not found'))
        except NotAuthorized:
            abort(401, _('Not authorized to see this page'))

        try:
            c.pkg_dict = get_action('package_show')(context, data_dict)
            c.project_list = get_action('ckanext_package_project_list')(context, {'package_id': c.pkg_dict['id']})
        except NotFound:
            abort(404, _('Dataset not found'))
        except logic.NotAuthorized:
            abort(401, _('Unauthorized to read package %s') % id)

        if request.method == 'POST':
            # Are we adding the dataset to a project?
            new_project = request.POST.get('project_added')
            if new_project:
                data_dict = {"project_id": new_project,
                             "package_id": c.pkg_dict['id']}
                try:
                    get_action('ckanext_project_package_association_create')(context, data_dict)
                except NotFound:
                    abort(404, _('project not found'))
                else:
                    h.flash_success(_("The dataset has been added to the project."))

            # Are we removing a dataset from a project?
            project_to_remove = request.POST.get('remove_project_id')
            if project_to_remove:
                data_dict = {"project_id": project_to_remove,
                             "package_id": c.pkg_dict['id']}
                try:
                    get_action('ckanext_project_package_association_delete')(context, data_dict)
                except NotFound:
                    abort(404, _('project not found'))
                else:
                    h.flash_success(_("The dataset has been removed from the project."))
            redirect(h.url_for(controller='ckanext.project.controller:projectController',
                               action='dataset_project_list', id=c.pkg_dict['name']))

        pkg_project_ids = [project['id'] for project in c.project_list]
        site_projects = get_action('ckanext_project_list')(context, {})

        c.project_dropdown = [[project['id'], project['title']]
                               for project in site_projects
                               if project['id'] not in pkg_project_ids]

        return render("package/dataset_project_list.html")

    def manage_datasets(self, id):
        '''
        List datasets associated with the given project id.
        '''

        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author}
        data_dict = {'id': id}

        try:
            check_access('ckanext_project_update', context)
        except NotAuthorized:
            abort(401, _('User %r not authorized to edit %s') % (c.user, id))

        # check if project exists
        try:
            c.pkg_dict = get_action('package_show')(context, data_dict)
        except NotFound:
            abort(404, _('project not found'))
        except NotAuthorized:
            abort(401, _('Unauthorized to read project %s') % id)

        # Are we removing a project/dataset association?
        if request.method == 'POST' and 'bulk_action.project_remove' in request.params:
            # Find the datasets to perform the action on, they are prefixed by
            # dataset_ in the form data
            dataset_ids = []
            for param in request.params:
                if param.startswith('dataset_'):
                    dataset_ids.append(param[8:])
            if dataset_ids:
                for dataset_id in dataset_ids:
                    get_action('ckanext_project_package_association_delete')(context, {'project_id': c.pkg_dict['id'],
                                                                                        'package_id': dataset_id})
                h.flash_success(_("The dataset{plur} been removed from the project.".format(plur=" has" if len(dataset_ids) == 1 else "s have")))
                url = h.url_for(controller='ckanext.project.controller:projectController',
                                action='manage_datasets',
                                id=id)
                redirect(url)

        # Are we creating a project/dataset association?
        elif request.method == 'POST' and 'bulk_action.project_add' in request.params:
            # Find the datasets to perform the action on, they are prefixed by
            # dataset_ in the form data
            dataset_ids = []
            for param in request.params:
                if param.startswith('dataset_'):
                    dataset_ids.append(param[8:])
            if dataset_ids:
                successful_adds = []
                for dataset_id in dataset_ids:
                    try:
                        get_action('ckanext_project_package_association_create')(context, {'project_id': c.pkg_dict['id'],
                                                                                            'package_id': dataset_id})
                    except ValidationError as e:
                        h.flash_notice(e.error_summary)
                    else:
                        successful_adds.append(dataset_id)
                if successful_adds:
                    h.flash_success(_("The dataset{plur} been added to the project.".format(plur=" has" if len(successful_adds) == 1 else "s have")))
                url = h.url_for(controller='ckanext.project.controller:projectController',
                                action='manage_datasets',
                                id=id)
                redirect(url)

        self._add_dataset_search(c.pkg_dict['id'], c.pkg_dict['name'])

        # get project packages
        c.project_pkgs = get_action('ckanext_project_package_list')(context, {'project_id': c.pkg_dict['id']})

        return render('project/manage_datasets.html')

    def _search_url(self, params, name):
        url = h.url_for(controller='ckanext.project.controller:projectController', action='manage_datasets', id=name)
        return url_with_params(url, params)

    def _add_dataset_search(self, project_id, project_name):
        '''
        Search logic for discovering datasets to add to a project.
        '''

        from ckan.lib.search import SearchError

        package_type = 'dataset'

        # unicode format (decoded from utf8)
        q = c.q = request.params.get('q', u'')
        c.query_error = False
        page = self._get_page_number(request.params)

        limit = g.datasets_per_page

        # most search operations should reset the page counter:
        params_nopage = [(k, v) for k, v in request.params.items()
                         if k != 'page']

        def drill_down_url(alternative_url=None, **by):
            return h.add_url_param(alternative_url=alternative_url,
                                   controller='package', action='search',
                                   new_params=by)

        c.drill_down_url = drill_down_url

        def remove_field(key, value=None, replace=None):
            return h.remove_url_param(key, value=value, replace=replace,
                                      controller='package', action='search')

        c.remove_field = remove_field

        sort_by = request.params.get('sort', None)
        params_nosort = [(k, v) for k, v in params_nopage if k != 'sort']

        def _sort_by(fields):
            """
            Sort by the given list of fields.

            Each entry in the list is a 2-tuple: (fieldname, sort_order)

            eg - [('metadata_modified', 'desc'), ('name', 'asc')]

            If fields is empty, then the default ordering is used.
            """
            params = params_nosort[:]

            if fields:
                sort_string = ', '.join('%s %s' % f for f in fields)
                params.append(('sort', sort_string))
            return self._search_url(params, project_name)

        c.sort_by = _sort_by
        if sort_by is None:
            c.sort_by_fields = []
        else:
            c.sort_by_fields = [field.split()[0]
                                for field in sort_by.split(',')]

        def pager_url(q=None, page=None):
            params = list(params_nopage)
            params.append(('page', page))
            return self._search_url(params, project_name)

        c.search_url_params = urlencode(_encode_params(params_nopage))

        try:
            c.fields = []
            # c.fields_grouped will contain a dict of params containing
            # a list of values eg {'tags':['tag1', 'tag2']}
            c.fields_grouped = {}
            search_extras = {}
            fq = ''
            for (param, value) in request.params.items():
                if param not in ['q', 'page', 'sort'] \
                        and len(value) and not param.startswith('_'):
                    if not param.startswith('ext_'):
                        c.fields.append((param, value))
                        fq += ' %s:"%s"' % (param, value)
                        if param not in c.fields_grouped:
                            c.fields_grouped[param] = [value]
                        else:
                            c.fields_grouped[param].append(value)
                    else:
                        search_extras[param] = value

            context = {'model': model, 'session': model.Session,
                       'user': c.user or c.author, 'for_view': True,
                       'auth_user_obj': c.userobj}

            if package_type and package_type != 'dataset':
                # Only show datasets of this particular type
                fq += ' +dataset_type:{type}'.format(type=package_type)
            else:
                # Unless changed via config options, don't show non standard
                # dataset types on the default search page
                if not tk.asbool(config.get('ckan.search.show_all_types', 'False')):
                    fq += ' +dataset_type:dataset'

            # Only search for packages that aren't already associated with the
            # project
            associated_package_ids = projectPackageAssociation.get_package_ids_for_project(project_id)
            # flatten resulting list to space separated string
            if associated_package_ids:
                associated_package_ids_str = ' OR '.join([id[0] for id in associated_package_ids])
                fq += ' !id:({0})'.format(associated_package_ids_str)

            facets = OrderedDict()

            default_facet_titles = {
                    'organization': _('Organizations'),
                    'groups': _('Groups'),
                    'tags': _('Tags'),
                    'res_format': _('Formats'),
                    'license_id': _('Licenses'),
                    }

            for facet in g.facets:
                if facet in default_facet_titles:
                    facets[facet] = default_facet_titles[facet]
                else:
                    facets[facet] = facet

            # Facet titles
            for plugin in p.PluginImplementations(p.IFacets):
                facets = plugin.dataset_facets(facets, package_type)

            c.facet_titles = facets

            data_dict = {
                'q': q,
                'fq': fq.strip(),
                'facet.field': facets.keys(),
                'rows': limit,
                'start': (page - 1) * limit,
                'sort': sort_by,
                'extras': search_extras
            }

            query = get_action('package_search')(context, data_dict)
            c.sort_by_selected = query['sort']

            c.page = h.Page(
                collection=query['results'],
                page=page,
                url=pager_url,
                item_count=query['count'],
                items_per_page=limit
            )
            c.facets = query['facets']
            c.search_facets = query['search_facets']
            c.page.items = query['results']
        except SearchError, se:
            log.error('Dataset search error: %r', se.args)
            c.query_error = True
            c.facets = {}
            c.search_facets = {}
            c.page = h.Page(collection=[])
        c.search_facets_limits = {}
        for facet in c.search_facets.keys():
            try:
                limit = int(request.params.get('_%s_limit' % facet,
                                               g.facets_default_number))
            except ValueError:
                abort(400, _('Parameter "{parameter_name}" is not '
                             'an integer').format(
                                 parameter_name='_%s_limit' % facet
                             ))
            c.search_facets_limits[facet] = limit

    def manage_project_admins(self):
        '''
        A ckan-admin page to list and add project admin users.
        '''
        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author}

        try:
            check_access('sysadmin', context, {})
        except NotAuthorized:
            abort(401, _('User not authorized to view page'))

        # We're trying to add a user to the project admins list.
        if request.method == 'POST' and request.params['username']:
            username = request.params['username']
            try:
                get_action('ckanext_project_admin_add')(data_dict={'username': username})
            except NotAuthorized:
                abort(401, _('Unauthorized to perform that action'))
            except NotFound:
                h.flash_error(_("User '{0}' not found.").format(username))
            except ValidationError as e:
                h.flash_notice(e.error_summary)
            else:
                h.flash_success(_("The user is now a project Admin"))

            return redirect(h.url_for(controller='ckanext.project.controller:projectController',
                                      action='manage_project_admins'))

        c.project_admins = get_action('ckanext_project_admin_list')()

        return render('admin/manage_project_admins.html')

    def remove_project_admin(self):
        '''
        Remove a user from the project Admin list.
        '''
        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author}

        try:
            check_access('sysadmin', context, {})
        except NotAuthorized:
            abort(401, _('User not authorized to view page'))

        if 'cancel' in request.params:
            tk.redirect_to(controller='ckanext.project.controller:projectController',
                          action='manage_project_admins')

        user_id = request.params['user']
        if request.method == 'POST' and user_id:
            user_id = request.params['user']
            try:
                get_action('ckanext_project_admin_remove')(data_dict={'username': user_id})
            except NotAuthorized:
                abort(401, _('Unauthorized to perform that action'))
            except NotFound:
                h.flash_error(_('The user is not a project Admin'))
            else:
                h.flash_success(_('The user is no longer a project Admin'))

            return redirect(h.url_for(controller='ckanext.project.controller:projectController',
                                      action='manage_project_admins'))

        c.user_dict = get_action('user_show')(data_dict={'id': user_id})
        c.user_id = user_id
        return render('admin/confirm_remove_project_admin.html')
