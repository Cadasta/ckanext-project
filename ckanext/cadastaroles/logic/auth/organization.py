

def cadasta_create_organization(context, data_dict):
    return {
        'success': False,
        'msg': 'Only system administrators can create organizations',
    }


def cadasta_update_organization(context, data_dict):
    return {
        'success': False,
        'msg': 'Only system administrators can update organizations',
    }


def cadasta_delete_organization(context, data_dict):
    return {
        'success': False,
        'msg': 'Only system administrators can delete organizations',
    }


organization_create = cadasta_create_organization
organization_update = cadasta_update_organization
organization_delete = cadasta_delete_organization
