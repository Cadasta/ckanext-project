import ckan.lib.base as base
from pylons import request
from ckan.controllers.package import PackageController
render = base.render
from ckan.lib.base import c
import model
from ckan.common import OrderedDict, _, json, request, c, g, response

import ckan.logic as logic
import ckan.lib.base as base
import ckan.model as model
import ckan.lib.plugins
import ckan.lib.render
from dateutil.parser import parse

NotFound = logic.NotFound
NotAuthorized = logic.NotAuthorized
ValidationError = logic.ValidationError
check_access = logic.check_access
get_action = logic.get_action
tuplize_dict = logic.tuplize_dict
clean_dict = logic.clean_dict
parse_params = logic.parse_params
flatten_to_string_key = logic.flatten_to_string_key

lookup_package_plugin = ckan.lib.plugins.lookup_package_plugin


class Parcel_Controller(PackageController):

    def read_parcels(self, id):

        ctype, format = self._content_type_from_accept()

        response.headers['Content-Type'] = ctype

        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'for_view': True,
                   'auth_user_obj': c.userobj}
        data_dict = {'id': id, 'include_tracking': True}


        # check if package exists
        try:
            c.pkg_dict = get_action('package_show')(context, data_dict)
            c.pkg = context['package']
        except NotFound:
            abort(404, _('Dataset not found'))
        except NotAuthorized:
            abort(401, _('Unauthorized to read package %s') % id)

        package_type = c.pkg_dict['type'] or 'dataset'
        self._setup_template_variables(context, {'id': id},
                                       package_type=package_type)

        return render('project/parcels.html',
                      extra_vars={'dataset_type': package_type})


    def new_parcel(self, id):

        ctype, format = self._content_type_from_accept()

        response.headers['Content-Type'] = ctype

        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'for_view': True,
                   'auth_user_obj': c.userobj}
        data_dict = {'id': id, 'include_tracking': True}


        # check if package exists
        try:
            c.pkg_dict = get_action('package_show')(context, data_dict)
            c.pkg = context['package']
        except NotFound:
            abort(404, _('Dataset not found'))
        except NotAuthorized:
            abort(401, _('Unauthorized to read package %s') % id)

        package_type = c.pkg_dict['type'] or 'dataset'
        self._setup_template_variables(context, {'id': id},
                                       package_type=package_type)

        return render('project/edit_parcel_details.html',
                      extra_vars={'dataset_type': package_type})



    def read_parcel_details(self, id, parcel_id):

        ctype, format = self._content_type_from_accept()

        response.headers['Content-Type'] = ctype

        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'for_view': True,
                   'auth_user_obj': c.userobj}
        data_dict = {'id': id, 'include_tracking': True}


        # check if package exists
        try:
            c.pkg_dict = get_action('package_show')(context, data_dict)
            c.pkg = context['package']
        except NotFound:
            abort(404, _('Dataset not found'))
        except NotAuthorized:
            abort(401, _('Unauthorized to read package %s') % id)

        package_type = c.pkg_dict['type'] or 'dataset'
        self._setup_template_variables(context, {'id': id, 'parcel_id' : parcel_id},
                                       package_type=package_type)

        return render('project/parcel_details.html',
                          extra_vars={'dataset_type': package_type })




    def edit_parcel_details(self, id, parcel_id):


        ctype, format = self._content_type_from_accept()

        response.headers['Content-Type'] = ctype

        context = {'model': model, 'session': model.Session,
                   'user': c.user or c.author, 'for_view': True,
                   'auth_user_obj': c.userobj}
        data_dict = {'id': id, 'include_tracking': True}


        # check if package exists
        try:
            c.pkg_dict = get_action('package_show')(context, data_dict)
            c.pkg = context['package']
        except NotFound:
            abort(404, _('Dataset not found'))
        except NotAuthorized:
            abort(401, _('Unauthorized to read package %s') % id)

        package_type = c.pkg_dict['type'] or 'dataset'
        self._setup_template_variables(context, {'id': id, 'parcel_id' : parcel_id},
                                       package_type=package_type)

        return render('project/edit_parcel_details.html',
                          extra_vars={'dataset_type': package_type})



