# CKAN to Cadasta API Wrappers

### Overview
The Angular views in this application retrieve data from the [cadasta-api](https://github.com/Cadasta/cadasta-api).
To handle authorization around certain API CRUD endpoints all calls are proxied through CKAN so the user's role is validated.

What follows below is a brief description the CKAN endpoints and where the authentication are located.
If you are interested to see a breakdown of API calls per view per and per user permission, then refer to the 
[cadasta-view-endpoints-and-permissions document](https://github.com/Cadasta/ckanext-project/). For a high-level description
about where these pieces are and how to update them refer to the [endpoint README](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/README.md)

### Endpoints Description

#### cadasta_get_project_overview

Get activity, resources, project extent and parcel geometries for a single project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L57)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-Project_Overview)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L13-L17)

#### cadasta_get_all_projects

Get all projects (from the project table)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L60)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjects)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L20-L24)

#### cadasta_get_project_resources

Get records from the resources table with a specific project id

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L62)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjects)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L26-L30)

#### cadasta_get_project_activities

Get a project's activity records

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L64)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjectActivity)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L32-L36)

#### cadasta_get_project_mapdata

Get project extent geometry, and all project parcel geometries

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L66)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-ProjectMapData)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L38-L42)

#### cadasta_get_project_parcel_list

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L68)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-ProjectMapData)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L38-L42)

#### cadasta_get_project_parcel

#### cadasta_get_project_parcel_details

#### cadasta_get_project_parcel_relationship_history

#### cadasta_get_project_parcel_resources

#### cadasta_get_project_details

#### cadasta_get_project
