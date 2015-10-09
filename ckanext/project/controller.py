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

from ckanext.project.plugin.project import DATASET_TYPE_NAME

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
    def _save_new(self, context, package_type=None):
        data_dict = clean_dict(dict_fns.unflatten(
                tuplize_dict(parse_params(request.POST))))

        data_dict['type'] = 'project'
        context['message'] = data_dict.get('log_message', '')

        try:
            pkg_dict = get_action('package_create')(context, data_dict)

        except ValidationError as e:
            errors = e.error_dict
            error_summary = e.error_summary
            data_dict['state'] = 'none'
            return self.new(data_dict, errors, error_summary)

        redirect(h.url_for('project_read', id=pkg_dict['name']))

    def _save_edit(self, name_or_id, context, package_type=None):
        data_dict = clean_dict(dict_fns.unflatten(
            tuplize_dict(parse_params(request.POST))))

        data_dict['id'] = name_or_id
        try:
            pkg = get_action('package_update')(context, data_dict)
        except ValidationError as e:
            errors = e.error_dict
            error_summary = e.error_summary
            return self.edit(name_or_id, data_dict, errors, error_summary)

        c.pkg_dict = pkg

        redirect(h.url_for('project_edit', id=pkg['name']))
