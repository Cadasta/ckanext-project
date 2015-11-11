#ckanext-project: extends CKAN for Cadasta

This CKAN extension modifies and extends the core CKAN code-base to provide the additional permissions, API, features and user interface required by the Cadasta application.

###Solution Diagram
![image](https://github.com/Cadasta/ckanext-project/blob/master/solution-diagram.png)

## Plugins
This extension includes three plugins:   

**cadastaroles:** extended permissions/roles and the "pass-through" api

**organization:** create/edit/delete organization workflow

**project:** create/edit/delete project workflow

It also includes static resources for the Angular.js applications used for the more complicated project and organization dashboards.

####CKAN Source Installation
You'll first need an out-of-the-box CKAN application installed.  See CKAN [docs](http://docs.ckan.org/en/latest/maintaining/installing/install-from-source.html) and or [ckan-chef instructions](https://github.com/Cadasta/ckanext-project/blob/master/docs/ckan-chef-installation.md).
####Extenstion Installation
[Instructions](./docs/extension-installation.md) for adding this extension to an out-of-the-box CKAN application.
####Angular Application Build
[Instructions](./docs/cadasta-angular-readme.md) for developing and deploying the Angular.js code served by this CKAN extension.
####Cadasta API and Database
This extension leverages an additional API and database to store Cadasta specific data (parcels, relationships, survey responses, geometries).  See the [Cadasta API](https://github.com/Cadasta/cadasta-api/blob/master/README.md) repository for installation instructions.
####CKAN API Wrappers For Cadasta
[Documentation](./docs/ckan-cadasta-wrapped-endpoints.md) showing which CKAN endpoints wrap which [Cadasta API endpoints](https://github.com/Cadasta/cadasta-api/blob/master/README.md)
####CKAN Debugging
[Instructions](./docs/ckan-debugging-guide.md) on setting up PyCharm debugging with the CKAN Development environment.
