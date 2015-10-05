from nose import tools as nosetools

import ckan.model as model
import ckan.tests.factories as factories
import ckan.tests.helpers as helpers

from ckanext.project.logic.validators import project_name_validator


class TestProjectNameValidator(helpers.FunctionalTestBase):
    def test_existing_name(self):
        factories.Dataset(id='my-id', title='project', name='project')
        context = {'package_id': 'my-id',
                   'model': model,
                   'session': model.Session}
        errors = {}
        errors['name', ] = []
        errors['title', ] = []
        project_name_validator(
            key=('name',),
            data={
                ('name',): 'project',
                ('title',): 'project',
            },
            errors=errors,
            context=context
        )
        nosetools.assert_equals(errors['title', ],
                                [u'That dataset name is already in use.'])
