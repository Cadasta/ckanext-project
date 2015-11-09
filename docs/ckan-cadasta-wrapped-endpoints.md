# CKAN to Cadasta API Wrappers

## Overview
The Angular views in this application retrieve data from the [cadasta-api](https://github.com/Cadasta/cadasta-api).
To handle authorization around API CRUD endpoints all calls are proxied through CKAN so the user's role can be validated.

What follows below is a brief description of the CKAN endpoints and where the authentication functions are located.
If you are interested to see a breakdown of API calls per view per and per user permission, then refer to the `/docs/CadastaRelatedViewsEndpointsandPermissions.docx.pdf`. For a high-level description
about where these pieces are and how to update them refer to the [endpoint README](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/README.md)

## Endpoints Description 
The following endpoints are the RPC action names in `http://{ckan_hostname}/api/3/action/{action_name}`

### GET(s)

<a name="user_role_show"></a>
#### user_role_show

Get a bundle of information about the user and their organization membership to be used in show/hide logic

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/get.py#L8-L40)
* Does Not Wrap Cadasta
* No Auth Required


<a name="cadasta_get_project_overview"></a>
#### cadasta_get_project_overview

Get activity, resources, project extent and parcel geometries for a single project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L57)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-Project_Overview)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L13-L17)

<a name="cadasta_get_all_projects"></a>
#### cadasta_get_all_projects

Get all projects (from the project table)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L60)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjects)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L20-L24)

<a name="cadasta_get_project_resources"></a>
#### cadasta_get_project_resources

Get records from the resources table with a specific project id

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L62)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjects)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L26-L30)

<a name="cadasta_get_project_activities"></a>
#### cadasta_get_project_activities

Get a project's activity records

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L64)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjectActivity)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L32-L36)

<a name="cadasta_get_project_mapdata"></a>
#### cadasta_get_project_mapdata

Get project extent geometry, and all project parcel geometries

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L66)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-ProjectMapData)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L38-L42)

<a name="cadasta_get_project_parcel_list"></a>
#### cadasta_get_project_parcel_list

Get records from the show_parcels_list database view with a specific project id

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L68)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-project_parcel_list)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/parcel.py#L14-L18)

<a name="cadasta_get_project_parcel"></a>
#### cadasta_get_project_parcel

Get a project specific parcel (from the parcels table)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L70)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjectParcel)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/parcel.py#L20-L24)

<a name="cadasta_get_project_parcel_details"></a>
#### cadasta_get_project_parcel_details

Get all details for a project parcel: parcel attributes, parcel history (most recent 10), relationships (most recent 10)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L72)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjectParcelDetails)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/parcel.py#L26-L30)

<a name="cadasta_get_project_parcel_relationship_history"></a>
#### cadasta_get_project_parcel_relationship_history

Get a project parcel's relationship history (from the show_relationship_history view)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L74)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProjectParcelRelationshipHistory)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/parcel.py#L32-L36)

<a name="cadasta_get_project_parcel_resources"></a>
#### cadasta_get_project_parcel_resources

Get all parcel resources (from the resource_parcel table)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L76)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Parcels-GetParcelResources)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/parcel.py#L39-L43)

<a name="cadasta_get_project_details"></a>
#### cadasta_get_project_details

Get project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L78-L83)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProject)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L44-L48)

<a name="cadasta_get_project"></a>
#### cadasta_get_project

Get project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L84-L90)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-GetProject)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L50-L54)

### PATCH AND POST

<a name="cadasta_create_project"></a>
#### cadasta_create_project

Create a project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L94-L99)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-PostProjects)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L60-L66)

<a name="cadasta_create_organization"></a>
#### cadasta_create_organization

Create an organization

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L94-L99)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Organizations-PostOrganization)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/organization.py#L3-L7)

<a name="cadasta_create_project_parcel"></a>
#### cadasta_create_project_parcel

Create a parcel for this project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L102-L109)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-CreateParcel)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/parcel.py#L76-L80)

<a name="cadasta_update_organization"></a>
#### cadasta_update_organization

Update an organization

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L113)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Organizations-UpdateOrganization)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/organization.py#L10-L14)

<a name="cadasta_update_project"></a>
#### cadasta_update_project

Update a project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L115-L120)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-UpdateProject)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L69-L75)

<a name="cadasta_update_project_parcel"></a>
#### cadasta_update_project_parcel

Update a project parcel

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L122-L127)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Projects-UpdateParcel)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/parcel.py#L81-L86)

<a name="cadasta_upload_project_resources"></a>
#### cadasta_upload_project_resources

Upload parcel, party, or relationship project resource

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/action/api.py#L136-L140)
* Wraps [Cadasta Endpoint](http://54.69.121.180:3000/docs/#api-Resources-UploadResource)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/dev/ckanext/cadastaroles/logic/auth/project.py#L127-L133)