import ckan.lib.helpers as h
from ckan.plugins import toolkit as tk
import logging
log = logging.getLogger(__name__)
import json

def facet_remove_field(key, value=None, replace=None):
    '''
    A custom remove field function to be used by the project search page to
    render the remove link for the tag pills.
    '''
    return h.remove_url_param(key, value=value, replace=replace,
                              controller='ckanext.project.controller:projectController',
                              action='search')


def get_site_statistics():
    '''
    Custom stats helper, so we can get the correct number of packages, and a
    count of projects.
    '''

    stats = {}
    stats['project_count'] = tk.get_action('package_search')(
        {}, {"rows": 1, 'fq': 'dataset_type:project'})['count']
    stats['dataset_count'] = tk.get_action('package_search')(
        {}, {"rows": 1, 'fq': '!dataset_type:project'})['count']
    stats['group_count'] = len(tk.get_action('group_list')({}, {}))
    stats['organization_count'] = len(
        tk.get_action('organization_list')({}, {}))

    return stats

def organization_get_project_count_helper(organization):
    '''
    :return:
    '''
    search_facets = tk.get_action('package_search')(
         {}, {"rows": 0, "facet.field":["organization"]})
    log.debug("[ SEARCH FACETS ]: %s", json.dumps(search_facets, indent=4))

    for org in search_facets['search_facets']['organization']['items']:
        if org['name'] == organization['name']:
            return {'package_count': org['count'] }
