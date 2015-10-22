from ckan.plugins import toolkit
from ckan.tests import helpers, factories
from ckan.lib import search
from ckan import model
from ckanext.cadastaroles.tests.helpers import CadastaRolesTestBase

from nose.tools import assert_equal, assert_raises


class TestCadastaUserRoleShow(CadastaRolesTestBase):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    def test_user_role_show(self):
        user = factories.User()
        organization = factories.Organization(id='1',
                                              users=[{'name': user['name'],
                                                      'capacity': 'surveyor'}])
        dataset = factories.Dataset(owner_org=organization['id'],
                                    name='test')

        context = {
            'model': model,
            'session': model.Session,
            'user': user['name']
        }
        result = helpers.call_action(
            'user_role_show',
            context=context,
            user_id=user['id'],
        )

        assert_equal('surveyor', result[0]['role'])
        assert_equal(organization['id'], result[0]['organization']['id'])
        assert_equal(dataset['id'],
                     result[0]['organization']['packages'][0]['id'])

    def test_user_role_show_by_name(self):
        user = factories.User()
        organization = factories.Organization(id='1',
                                              users=[{'name': user['name'],
                                                      'capacity': 'surveyor'}])
        dataset = factories.Dataset(owner_org=organization['id'],
                                    name='test')

        context = {
            'model': model,
            'session': model.Session,
            'user': user['name']
        }
        result = helpers.call_action(
            'user_role_show',
            context=context,
            user_id=user['name'],
        )

        assert_equal('surveyor', result[0]['role'])
        assert_equal(organization['id'], result[0]['organization']['id'])
        assert_equal(dataset['id'],
                     result[0]['organization']['packages'][0]['id'])

    def test_no_member_found(self):
        user = factories.User()
        organization = factories.Organization(id='1')

        context = {
            'model': model,
            'session': model.Session,
            'user': user['name']
        }
        result = helpers.call_action(
            'user_role_show',
            context=context,
            user_id=user['id'],
            organization_id=organization['id'],
        )
        assert_equal(result, [])

    def test_user_role_by_org(self):
        user = factories.User()
        organization = factories.Organization(id='1',
                                              users=[{'name': user['name'],
                                                      'capacity': 'surveyor'}])
        organization_2 = factories.Organization(id='2',
                                                users=[{'name': user['name'],
                                                        'capacity': 'surveyor'}]
                                                )
        dataset = factories.Dataset(owner_org=organization['id'],
                                    name='test')

        context = {
            'model': model,
            'session': model.Session,
            'user': user['name']
        }
        result = helpers.call_action(
            'user_role_show',
            context=context,
            user_id=user['name'],
            organization_id='1',
        )

        assert_equal('surveyor', result[0]['role'])
        assert_equal(organization['id'], result[0]['organization']['id'])
        assert_equal(dataset['id'],
                     result[0]['organization']['packages'][0]['id'])

        assert_equal(1, len(result))
