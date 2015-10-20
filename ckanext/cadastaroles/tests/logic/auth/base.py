from ckan.tests import helpers, factories
from ckan import model
from ckan.logic import schema
from ckan.plugins import toolkit

from nose.tools import assert_raises, assert_true


class TestProjectBase(helpers.FunctionalTestBase):
    def setup(self):
        super(TestProjectBase, self).setup()
        self.user = factories.User()
        context = {
            'model': model,
            'session': model.Session,
            'user': self.user['name'],
        }
        org_create_context = context.copy()
        org_create_context['schema'] = schema.default_group_schema()
        self.organization = helpers.call_action(
            'organization_create',
            context=context,
            id='1',
            name='organization'
        )
        project_context = context.copy()
        project_context['schema'] = schema.default_create_package_schema()
        self.project = helpers.call_action(
            'package_create',
            context=project_context,
            type='project',
            id='1',
            name='test',
            title='Test',
            owner_org=self.organization['name'],
        )

    def get_user_context(self, role=None):
        '''Get a context as a logged in user

        role=None indicates a logged in user not part of an organization'''
        if role:
            user = factories.User(name=role)
            helpers.call_action('organization_member_create',
                                username=user['name'],
                                id=self.organization['id'], role=role)
        else:
            user = factories.User(name='logged_in')
        return {
            'model': model,
            'session': model.Session,
            'user': user['name']
        }

    def assert_authorization_passes(self, auth_function_name, user_roles,
                                    project_id, project_id_parameter,
                                    **kwargs):
        kwargs[project_id_parameter] = project_id
        for user_role in user_roles:
            assert_true(helpers.call_auth(
                auth_function_name,
                context=self.get_user_context(user_role),
                **kwargs)
            )

    def assert_authorization_fails(self, auth_function_name, user_roles,
                                   project_id, project_id_parameter, **kwargs):
        kwargs[project_id_parameter] = project_id
        for user_role in user_roles:
            assert_raises(
                toolkit.NotAuthorized,
                helpers.call_auth,
                auth_function_name,
                context=self.get_user_context(user_role),
                **kwargs
            )
