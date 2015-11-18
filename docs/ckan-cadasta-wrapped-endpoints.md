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

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_get_all_projects"></a>
#### cadasta_get_all_projects

Get all projects (from the project table)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_get_project_resources"></a>
#### cadasta_get_project_resources

Get records from the resources table with a specific project id

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_get_project_activities"></a>
#### cadasta_get_project_activities

Get a project's activity records

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_get_project_mapdata"></a>
#### cadasta_get_project_mapdata

Get project extent geometry, and all project parcel geometries

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_get_project_parcel_list"></a>
#### cadasta_get_project_parcel_list

Get records from the show_parcels_list database view with a specific project id

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/parcel.py)

<a name="cadasta_get_project_parcel"></a>
#### cadasta_get_project_parcel

Get a project specific parcel (from the parcels table)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/parcel.py)

<a name="cadasta_get_project_parcel_details"></a>
#### cadasta_get_project_parcel_details

Get all details for a project parcel: parcel attributes, parcel history (most recent 10), relationships (most recent 10)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/parcel.py)

<a name="cadasta_get_project_parcel_relationship_history"></a>
#### cadasta_get_project_parcel_relationship_history

Get a project parcel's relationship history (from the show_relationship_history view)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/parcel.py)

<a name="cadasta_get_project_parcel_resources"></a>
#### cadasta_get_project_parcel_resources

Get all parcel resources (from the resource_parcel table)

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/parcel.py)

<a name="cadasta_get_project_details"></a>
#### cadasta_get_project_details

Get project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_get_project"></a>
#### cadasta_get_project

Get project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_get_project_parties"></a>
#### cadasta_get_project_parties

Get a project's parties

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/party.py)

<a name="cadasta_get_project_party_details"></a>
#### cadasta_get_project_party_details

Get the details for a project party

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/party.py)

<a name="cadasta_get_project_party_resources"></a>
#### cadasta_get_project_party_resources

Get the resources for a project party

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/party.py)

<a name="cadasta_get_project_relationship_details"></a>
#### cadasta_get_project_relationship_details

Get the details for a project relationship

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/relationship.py)

<a name="cadasta_get_project_relationship_list"></a>
#### cadasta_get_project_relationship_list

Get all the relationships for a project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/relationship.py)

<a name="cadasta_get_project_relationship_resources"></a>
#### cadasta_get_project_relationship_resources

Get the resources for a project relationship

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/relationship.py)

<a name="cadasta_get_project_fielddata_responses"></a>
#### cadasta_get_project_fielddata_responses

Get the fielddata responses for a project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/field_data.py)

<a name="cadasta_get_project_fielddata"></a>
#### cadasta_get_project_fielddata

Get all the fielddata for a project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/field_data.py)


### PATCH AND POST

<a name="cadasta_create_project"></a>
#### cadasta_create_project

Create a project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_create_organization"></a>
#### cadasta_create_organization

Create an organization

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/organization.py)

<a name="cadasta_create_project_parcel"></a>
#### cadasta_create_project_parcel

Create a parcel for this project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/parcel.py)

<a name="cadasta_update_organization"></a>
#### cadasta_update_organization

Update an organization

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/organization.py)

<a name="cadasta_update_project"></a>
#### cadasta_update_project

Update a project

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_update_project_parcel"></a>
#### cadasta_update_project_parcel

Update a project parcel

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/parcel.py)

<a name="cadasta_update_project_party"></a>
#### cadasta_update_project_party

Update a project's party information

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/party.py)

<a name="cadasta_update_project_relationship"></a>
#### cadasta_update_project_relationship

Update a project's relationship information

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/relationship.py)

<a name="cadasta_update_project_fielddata_respondents"></a>
#### cadasta_update_project_fielddata_respondents

Update a project's fielddata respondent's validated data

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/field_data.py)


<a name="cadasta_upload_project_resources"></a>
#### cadasta_upload_project_resources

Upload parcel, party, or relationship project resource

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/project.py)

<a name="cadasta_upload_ona_form"></a>
#### cadasta_upload_ona_form

Upload .xls file to for ona mobile user

* [Endpoint](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/action/api.py)
* Wraps [Cadasta Endpoint](http://github.com/Cadasta/cadasta-api/tree/master/app/routes)
* [Auth Function](https://github.com/Cadasta/ckanext-project/blob/master/ckanext/cadastaroles/logic/auth/field_data.py)