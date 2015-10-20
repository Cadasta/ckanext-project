# Adding Cadasta API actions
## Adding GET actions
Add and entry to the `get_api_map` in `api.py` in the form

```
get_api_map = {
  ...
  '<ckan action name>': CadastaEndpoint('<cadasta endpoint>'),
  ...
}
```
This will create a new ckan action in the ckan api called `<ckan action name>`.
The `<cadasta endpoint>` should take the form of a python format string e.g

```
/project/{project_id}/parcel/{parcel_id}
```
When the ckan action `<ckan action name>` is called, it will take `project_id` and
`parcel_id` as parameters from the data_dict and fill them into the format string, if they
are not present, a `ValidationError` will be raised. Any other parameters passed in the
ckan data_dict will be passed as GET query parameters.

##Adding POST actions
Similar to GET actions, but if the endpoint has post parameters that must be an int/bool/etc,
then you can provide `argument_types` to `CadastaEndpoint` that convert the string to
the required type. If the conversion fails, the default value is sent.
```
    'cadasta_create_project': CadastaEndpoint(
            '/projects', {'cadasta_organization_id': int}),
```
Any additional items in the ckan data_dict will be sent as POST parameters
##Adding POST upload actions
If an endpoint accepts file uploads, then the `argument_type` should be set as `convert_field_storage` and `upload_fields`  should also be passed to `CadastaEndpoint`
```
    'cadasta_upload_resource': CadastaEndpoint(
        '/resources/{project_id}/{resource_type}/{resource_type_id}',
        argument_types={'filedata': convert_field_storage},
        upload_fields=['filedata']
    )
```
Any data_dict parameters with field in upload_fields will be sent as file uploads, any remaining parameters are sent as POST parameters

##Updating Tests
Any action added to the `get_api_map`, `post_api_map` or `post_files_api_map` are added to the tests in `test_api.py`, a file called `<ckan action name>.json` should be added to `tests/actions/json` subdirectory. These tests make sure the generated ckan action makes the correct GET/POST calls and tests the upload parameters are sent.

