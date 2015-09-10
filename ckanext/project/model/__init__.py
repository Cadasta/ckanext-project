from sqlalchemy import Table
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import types

from ckan.model.domain_object import DomainObject
from ckan.model.meta import metadata, mapper, Session
from ckan import model

import logging
log = logging.getLogger(__name__)


project_package_assocation_table = None
project_admin_table = None


def setup():
    # setup project_package_assocation_table
    if project_package_assocation_table is None:
        define_project_package_association_table()
        log.debug('projectPackageAssociation table defined in memory')

    if model.package_table.exists():
        if not project_package_assocation_table.exists():
            project_package_assocation_table.create()
            log.debug('projectPackageAssociation table create')
        else:
            log.debug('projectPackageAssociation table already exists')
    else:
        log.debug('projectPackageAssociation table creation deferred')

    # setup project_admin_table
    if project_admin_table is None:
        define_project_admin_table()
        log.debug('projectAdmin table defined in memory')

    if model.user_table.exists():
        if not project_admin_table.exists():
            project_admin_table.create()
            log.debug('projectAdmin table create')
        else:
            log.debug('projectAdmin table already exists')
    else:
        log.debug('projectAdmin table creation deferred')


class projectBaseModel(DomainObject):
    @classmethod
    def filter(cls, **kwargs):
        return Session.query(cls).filter_by(**kwargs)

    @classmethod
    def exists(cls, **kwargs):
        if cls.filter(**kwargs).first():
            return True
        else:
            return False

    @classmethod
    def get(cls, **kwargs):
        instance = cls.filter(**kwargs).first()
        return instance

    @classmethod
    def create(cls, **kwargs):
        instance = cls(**kwargs)
        Session.add(instance)
        Session.commit()
        return instance.as_dict()


class projectPackageAssociation(projectBaseModel):

    @classmethod
    def get_package_ids_for_project(cls, project_id):
        '''
        Return a list of package ids associated with the passed project_id.
        '''
        project_package_association_list = Session.query(cls.package_id).filter_by(project_id=project_id).all()
        return project_package_association_list

    @classmethod
    def get_project_ids_for_package(cls, package_id):
        '''
        Return a list of project ids associated with the passed package_id.
        '''
        project_package_association_list = Session.query(cls.project_id).filter_by(package_id=package_id).all()
        return project_package_association_list


def define_project_package_association_table():
    global project_package_assocation_table

    project_package_assocation_table = Table('project_package_association', metadata,
                                              Column('package_id', types.UnicodeText,
                                                     ForeignKey('package.id',
                                                                ondelete='CASCADE',
                                                                onupdate='CASCADE'),
                                                     primary_key=True, nullable=False),
                                              Column('project_id', types.UnicodeText,
                                                     ForeignKey('package.id',
                                                                ondelete='CASCADE',
                                                                onupdate='CASCADE'),
                                                     primary_key=True, nullable=False)
                                              )

    mapper(projectPackageAssociation, project_package_assocation_table)


class projectAdmin(projectBaseModel):

    @classmethod
    def get_project_admin_ids(cls):
        '''
        Return a list of project admin user ids.
        '''
        id_list = [i for (i, ) in Session.query(cls.user_id).all()]
        return id_list

    @classmethod
    def is_user_project_admin(cls, user):
        '''
        Determine whether passed user is in the project admin list.
        '''
        return (user.id in cls.get_project_admin_ids())


def define_project_admin_table():
    global project_admin_table

    project_admin_table = Table('project_admin', metadata,
                                 Column('user_id', types.UnicodeText,
                                        ForeignKey('user.id',
                                                   ondelete='CASCADE',
                                                   onupdate='CASCADE'),
                                        primary_key=True, nullable=False))

    mapper(projectAdmin, project_admin_table)
