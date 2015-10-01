from ckan.plugins import toolkit as tk
from ckan.model import PACKAGE_NAME_MAX_LENGTH, PACKAGE_NAME_MIN_LENGTH

_ = tk._
Invalid = tk.Invalid


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
        query = query.filter(model.Package.id <> package_id)
    result = query.first()

    if result:
        errors['title',].append(_('That dataset name is already in use.'))

    value = data[key]
    if len(value) < PACKAGE_NAME_MIN_LENGTH:
        raise Invalid(
            _('Name "%s" length is less than minimum %s') % (value, PACKAGE_NAME_MIN_LENGTH)
        )
    if len(value) > PACKAGE_NAME_MAX_LENGTH:
        raise Invalid(
            _('Name "%s" length is more than maximum %s') % (value, PACKAGE_NAME_MAX_LENGTH)
        )
