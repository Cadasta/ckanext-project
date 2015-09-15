.. You should enable this project on travis-ci.org and coveralls.io to make
   these badges work. The necessary Travis and Coverage config files have been
   generated for you.

.. image:: https://travis-ci.org/ckan/ckanext-project.svg?branch=master
    :target: https://travis-ci.org/ckan/ckanext-project

.. image:: https://coveralls.io/repos/ckan/ckanext-project/badge.png?branch=master
  :target: https://coveralls.io/r/ckan/ckanext-project?branch=master

=============
ckanext-project
=============

project and link to datasets in use. Datasets used in an app, website or
visualization, or featured in an article, report or blog post can be projectd
within the CKAN website. projects can include an image, description, tags and
external link. projects may contain several datasets, helping users discover
related datasets being used together. projects can be discovered by searching
and filtered by tag.

Site sysadmins can promote selected users to become 'project Admins' to help
create, populate and maintain projects.

ckanext-project is intended to be a more powerful replacement for the
'Related Item' feature.


------------
Requirements
------------

Current status: Beta

Compatible with CKAN 2.3.


------------
Installation
------------

.. Add any additional install steps to the list below.
   For example installing any non-Python dependencies or adding any required
   config settings.

To install ckanext-project:

1. Activate your CKAN virtual environment, for example::

     . /usr/lib/ckan/default/bin/activate

2. Install the ckanext-project Python package into your virtual environment::

     pip install ckanext-project

3. Add ``project`` to the ``ckan.plugins`` setting in your CKAN
   config file (by default the config file is located at
   ``/etc/ckan/default/production.ini``).

4. Restart CKAN. For example if you've deployed CKAN with Apache on Ubuntu::

     sudo service apache2 reload


------------------------
Development Installation
------------------------

To install ckanext-project for development, activate your CKAN virtualenv and
do::

    git clone https://github.com/Cadasta/ckanext-project
    cd ckanext-project
    python setup.py develop
    pip install -r dev-requirements.txt


---
API
---

All actions in the project extension are available in the CKAN Action API.

project actions::

    - create a new project (sysadmins and project admins only)
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_create -H "Authorization:{YOUR-API-KEY}" -d '{"name": "my-new-project"}'

    - delete a project (sysadmins and project admins only)
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_delete -H "Authorization:{YOUR-API-KEY}" -d '{"name": "my-new-project"}'

    - show a project
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_show -d '{"id": "my-new-project"}'

    - list projects
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_list -d ''


Dataset actions::

    - add a dataset to a project (sysadmins and project admins only)
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_package_association_create -H "Authorization:{YOUR-API-KEY}" -d '{"project_id": "my-project", "package_id": "my-package"}'

    - remove a dataset from a project (sysadmins and project admins only)
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_package_association_delete -H "Authorization:{YOUR-API-KEY}" -d '{"project_id": "my-project", "package_id": "my-package"}'

    - list datasets in a project
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_package_list -d '{"project_id": "my-project"}'

    - list projects featuring a given dataset
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_package_project_list -d '{"package_id": "my-package"}'


project admin actions::

    - add project admin (sysadmins only)
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_admin_add -H "Authorization:{YOUR-API-KEY}" -d '{"username": "bert"}'

    - remove project admin (sysadmins only)
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_admin_remove -H "Authorization:{YOUR-API-KEY}" -d '{"username": "bert"}'

    - list project admins (sysadmins only)
    curl -X POST http://127.0.0.1:5000/api/3/action/ckanext_project_admin_list -H "Authorization:{YOUR-API-KEY}" -d ''


----------------------------
Migrating from Related Items
----------------------------

If you already have Related Items in your database, you can use the ``project
migrate`` command to create projects from Related Items.

From the ``ckanext-project`` directory::

    paster project migrate -c {path to production.ini}

Note that each Related Item must have a unique title before migration can
proceed.

The Related Item property ``type`` will become a project tag. The Related Item
properties ``created``, ``owner_id``, ``view_count``, and ``featured`` have no
equivalent in projects and will not be migrated.

Related Item data is not removed from the database by this command.

-----------------
Running the Tests
-----------------

To run the tests, do::

    nosetests --ckan --nologcapture --with-pylons=test.ini

To run the tests and produce a coverage report, first make sure you have
coverage installed in your virtualenv (``pip install coverage``) then run::

    nosetests --ckan --nologcapture --with-pylons=test.ini --with-coverage --cover-package=ckanext.project --cover-inclusive --cover-erase --cover-tests


---------------------------------
Registering ckanext-project on PyPI
---------------------------------

ckanext-project should be availabe on PyPI as
https://pypi.python.org/pypi/ckanext-project. If that link doesn't work, then
you can register the project on PyPI for the first time by following these
steps:

1. Create a source distribution of the project::

     python setup.py sdist

2. Register the project::

     python setup.py register

3. Upload the source distribution to PyPI::

     python setup.py sdist upload

4. Tag the first release of the project on GitHub with the version number from
   the ``setup.py`` file. For example if the version number in ``setup.py`` is
   0.0.1 then do::

       git tag 0.0.1
       git push --tags


----------------------------------------
Releasing a New Version of ckanext-project
----------------------------------------

ckanext-project is availabe on PyPI as https://pypi.python.org/pypi/ckanext-project.
To publish a new version to PyPI follow these steps:

1. Update the version number in the ``setup.py`` file.
   See `PEP 440 <http://legacy.python.org/dev/peps/pep-0440/#public-version-identifiers>`_
   for how to choose version numbers.

2. Create a source distribution of the new version::

     python setup.py sdist

3. Upload the source distribution to PyPI::

     python setup.py sdist upload

4. Tag the new release of the project on GitHub with the version number from
   the ``setup.py`` file. For example if the version number in ``setup.py`` is
   0.0.2 then do::

       git tag 0.0.2
       git push --tags
