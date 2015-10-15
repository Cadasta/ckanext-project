from nose import tools as nosetools
import responses

import ckan.model as model
import ckan.tests.factories as factories
import ckan.tests.helpers as helpers

from ckanext.project.logic.validators import (
    project_name_validator,
    slugify_title_to_name,
    organization_name_validator,
)


class TestProjectNameValidator(helpers.FunctionalTestBase):
    @responses.activate
    def test_existing_name(self):
        responses.add(responses.POST, 'http://cadasta.api/organizations',
                      body='{"cadasta_organization_id": 1}',
                      content_type="application/json")
        responses.add(responses.POST, 'http://cadasta.api/projects',
                      body='{"cadasta_project_id": 1}',
                      content_type="application/json")
        factories.Organization(id='my-id', title='organization',
                               name='organization')
        factories.Dataset(id='my-id', title='project',
                          name='project', owner_org='organization')
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


class TestOrganizationNameValidator(helpers.FunctionalTestBase):
    @responses.activate
    def test_existing_name(self):
        responses.add(responses.POST, 'http://cadasta.api/organizations',
                      body='{"cadasta_organization_id": 1}',
                      content_type="application/json")
        factories.Organization(id='my-id', title='organization',
                               name='organization')
        context = {
                   'model': model,
                   'session': model.Session}
        errors = {}
        errors['name', ] = []
        errors['title', ] = []
        organization_name_validator(
            key=('name',),
            data={
                ('name',): 'organization',
                ('title',): 'organization',
            },
            errors=errors,
            context=context
        )
        nosetools.assert_equals(errors['title', ],
                                [u'Organization name already exists.'])


class TestSlugifyValidator(object):
    def test_empty_name_slugifys(self):
        context = {
            'model': model,
            'session': model.Session
        }
        data = {
            ('name',): '',
            ('title',): 'A long project title',
        }
        slugify_title_to_name(
            key=('name',),
            data=data,
            errors={},
            context=context
        )
        nosetools.assert_equals(data['name', ], u'a-long-project-title')
        nosetools.assert_equals(data['title', ], u'A long project title')

    def test_empty_name_keeps_existing(self):
        context = {
            'model': model,
            'session': model.Session
        }
        data = {
            ('name',): 'existing-name',
            ('title',): 'A long project title',
        }
        slugify_title_to_name(
            key=('name',),
            data=data,
            errors={},
            context=context
        )
        nosetools.assert_equals(data['name', ], u'existing-name')
        nosetools.assert_equals(data['title', ], u'A long project title')

    def test_empty_name_keeps_existing_but_slugifys(self):
        context = {
            'model': model,
            'session': model.Session
        }
        data = {
            ('name',): 'existing name',
            ('title',): 'A long project title',
        }
        slugify_title_to_name(
            key=('name',),
            data=data,
            errors={},
            context=context
        )
        nosetools.assert_equals(data['name', ], u'existing-name')
        nosetools.assert_equals(data['title', ], u'A long project title')
