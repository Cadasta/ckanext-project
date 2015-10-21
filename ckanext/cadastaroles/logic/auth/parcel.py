from ckan.plugins import toolkit


def cadasta_show_parcel(context, data_dict):
    return {'success': True}


def cadasta_get_parcels_list(context, data_dict):
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }


def cadasta_get_project_parcel(context, data_dict):
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }


def cadasta_get_project_parcel_detail(context, data_dict):
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }


def cadasta_get_project_parcel_history(context, data_dict):
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }


def cadasta_get_project_parcel_relationship_history(context, data_dict):
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }
