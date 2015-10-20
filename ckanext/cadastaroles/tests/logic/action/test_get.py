from ckan.plugins import toolkit
from ckan.tests import helpers, factories
from ckan.lib import search
from ckan import model

from nose.tools import assert_equal, assert_is_none, assert_raises


class TestCadastaUserRoleShow(object):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    def test_user_role_show(self):
        user = factories.User()
        organization = factories.Organization(id='1',
                                              users=[{'name': user['name'],
                                                      'capacity': 'surveyor'}])

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

        assert_equal('surveyor', result['role'])
        assert_equal(organization['id'], result['organization_id'])
        assert_equal(user['id'], result['user_id'])

    def test_user_role_show_by_name(self):
        user = factories.User()
        organization = factories.Organization(id='1',
                                              users=[{'name': user['name'],
                                                      'capacity': 'surveyor'}])

        context = {
            'model': model,
            'session': model.Session,
            'user': user['name']
        }
        result = helpers.call_action(
            'user_role_show',
            context=context,
            user_id=user['name'],
            organization_id=organization['name'],
        )

        assert_equal('surveyor', result['role'])
        assert_equal(organization['id'], result['organization_id'])
        assert_equal(user['id'], result['user_id'])

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
        assert_is_none(result)

    def test_org_does_not_exist_raises_validation(self):
        user = factories.User()

        context = {
            'model': model,
            'session': model.Session,
            'user': user['name']
        }
        assert_raises(toolkit.ValidationError,
                      helpers.call_action,
                      'user_role_show',
                      context=context,
                      user_id=user['id'],
                      organization_id='no')

    def test_user_does_not_exist_raises_validation(self):
        user = factories.User()
        organization = factories.Organization(id='1')

        context = {
            'model': model,
            'session': model.Session,
            'user': user['name']
        }
        assert_raises(toolkit.ValidationError,
                      helpers.call_action,
                      'user_role_show',
                      context=context,
                      user_id='nope',
                      organization_id=organization['id'])
