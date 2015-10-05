from ckan.plugins import toolkit


@toolkit.side_effect_free
@toolkit.auth_allow_anonymous_access
def extra_autocomplete(context, data_dict):
    extra = toolkit.get_or_bust(data_dict, 'extra')
    extra_name = 'extras_{0}'.format(extra)
    search_term = data_dict.get('search_term', '*')

    query = '{extra}:{search_term}'.format(extra=extra_name,
                                           search_term=search_term)

    pkg_search = toolkit.get_action('package_search')(context, {'q': query})
    return [d.get(extra, '') for d in pkg_search.get('results', [])]
