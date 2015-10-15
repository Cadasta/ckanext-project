from ckan.plugins import toolkit as tk
from ckan.plugins import toolkit
from ckan.model import PACKAGE_NAME_MAX_LENGTH, PACKAGE_NAME_MIN_LENGTH

import logging
import uuid
from slugify import slugify


log = logging.getLogger(__name__)

_ = tk._
Invalid = tk.Invalid


convert_to_extras = toolkit.get_validator('convert_to_extras')
convert_from_extras = toolkit.get_validator('convert_from_extras')


def convert_package_name_or_id_to_id_for_type(package_name_or_id, context, package_type='dataset'):
    '''
    Return the id for the given package name or id. Only works with packages
    of type package_type.

    Also validates that a package with the given name or id exists.

    :returns: the id of the package with the given name or id
    :rtype: string
    :raises: ckan.lib.navl.dictization_functions.Invalid if there is no
        package with the given name or id

    '''
    session = context['session']
    model = context['model']
    result = session.query(model.Package) \
        .filter_by(id=package_name_or_id, type=package_type).first()
    if not result:
        result = session.query(model.Package) \
            .filter_by(name=package_name_or_id, type=package_type).first()
    if not result:
        raise Invalid('%s: %s' % (_('Not found'), _('Dataset')))
    return result.id


def convert_package_name_or_id_to_id_for_type_dataset(package_name_or_id, context):
    return convert_package_name_or_id_to_id_for_type(package_name_or_id, context, package_type='dataset')


def convert_package_name_or_id_to_id_for_type_project(package_name_or_id, context):
    return convert_package_name_or_id_to_id_for_type(package_name_or_id, context, package_type='project')


def slugify_title_to_name(key, data, errors, context):
    if not data[key]:
        data[key] = slugify(data['title', ])
    else:
        data[key] = slugify(data[key])


def project_name_validator(key, data, errors, context):
    model = context['model']
    session = context['session']
    package = context.get('package')

    query = session.query(model.Package.name).filter_by(name=data[key])
    if package:
        package_id = package.id
    else:
        package_id = data.get(key[:-1] + ('id',))
    if package_id and package_id is not tk.missing:
        query = query.filter(model.Package.id != package_id)
    result = query.first()

    if result:
        errors['title',].append(_('That dataset name is already in use.'))

    value = data[key]
    if len(value) < PACKAGE_NAME_MIN_LENGTH:
        errors['title',].append(
            _('Name "%s" length is less than minimum %s') % (value, PACKAGE_NAME_MIN_LENGTH)
        )
    if len(value) > PACKAGE_NAME_MAX_LENGTH:
        errors['title',].append(
            _('Name "%s" length is more than maximum %s') % (value, PACKAGE_NAME_MAX_LENGTH)
        )


def if_empty_generate_uuid(value):
    """
    Generate a uuid for early so that it may be
    copied into the name field.
    """
    if not value or value is tk.missing:
        return str(uuid.uuid4())
    return value


def create_cadasta_project(key, data, errors, context):
    '''This validator makes a call to the external cadasta api.

    This calls cadasta_create_project and makes an external call and saves
    the returned project id into an extra cadasta_project_id
    '''
    # if there are validation errors, do not make a call to cadasta api
    for error in errors.values():
        if error:
            return

    organization = toolkit.get_action('organization_show')(
        context,
        {'id': data['owner_org', ]}
    )

    data_dict = {
        'ckan_id': data['id', ],
        'ckan_title': data['title', ],
        'cadasta_organization_id': organization.get('cadasta_id', '')
    }
    context = {
        'model': context['model'],
        'session': context['session'],
        'user': context['user'],
    }

    try:
        result = toolkit.get_action('cadasta_create_project')(context,
                                                              data_dict)
        data['cadasta_id', ] = result['cadasta_project_id']
        convert_to_extras(('cadasta_id',), data, errors, context)

    except KeyError, e:
        log.error('Error calling cadasta api action: {0}').format(e.message)
    except toolkit.ValidationError, e:
        e.error_summary['cadasta_api'] = 'Error contacting cadasta api'
        raise e
