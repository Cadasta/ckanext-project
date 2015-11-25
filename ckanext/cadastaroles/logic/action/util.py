from ckan.plugins import toolkit

import urlparse

from pylons import config
import requests
import logging
log = logging.getLogger(__name__)
import json


def transform_and_raise_api_errors(result):
    '''
    every Cadasta api result is expecting a hash returned
    where an 'error' key indicates an error
    where a 'message' key is present

    :param result:
    :return:
    '''

    if isinstance(result,dict) is False:
        return

    if result.get('error',False) is False:
        return # no errors

    error_dict = result.get('error',{})
    if isinstance(error_dict,dict) is False:
        log.error('[ CADASTA API ERROR ]: api response has a key "error" which is not a hash\n {}'.format(error_dict))
        return

    #
    # pass through things we might need for angular
    #
    error_dict['message'] = result.get('message','')
    error_dict['type'] = result.get('type','')

    #
    # https://github.com/Cadasta/ckanext-project/issues/68
    #
    if 'violates unique constraint "project_ona_api_key_key"' in error_dict['message']:
        error_dict = { 'message': ['Ona API Token already in use']}

    #
    # this api error transformation has to accommodate
    # ckan server-side view error rendering
    # as well as the angular view error rendering
    # unfortunately, the ckan view rendering expects a certain structure
    # https://github.com/ckan/ckan/blob/master/ckan/logic/__init__.py#L75-L107
    # so we need to wrap values inside lists or tuples
    #
    for key, value in error_dict.items():
        error_dict[key] = [value,]

    raise toolkit.ValidationError(
        error_dict
    )

def call_api(endpoint, function, **kwargs):
    try:
        api_url = config['ckanext.cadasta.api_url']
    except KeyError:
        raise toolkit.ValidationError(
            toolkit._('ckanext.cadasta.api_url has not been set')
        )
    try:

        log.debug("[ REQUEST ]:\nfunction={0}\nurl={1}\nparams={2}".format(
            function.__name__,
            urlparse.urljoin(api_url, endpoint),
            json.dumps(kwargs,indent=4) if hasattr(kwargs,'files') else kwargs
        ))

        # Work-around for requests v2.3.0 (used in base CKAN install).
        if 'json' in kwargs:
            kwargs['data'] = json.dumps(kwargs['json'])
            del kwargs['json']
            if 'headers' in kwargs:
                kwargs['headers']['Content-Type'] = 'application/json'
            else:
                kwargs['headers'] = {'Content-Type': 'application/json'}

        r = function(urlparse.urljoin(api_url, endpoint), **kwargs)
        result = r.json()

        log.debug("[ RESPONSE ]:\nstatus={0}\nerror={1}\nfull_result={2}".format(
            r.status_code,
            result.get('error',{}) if hasattr(result, 'get') else {}, # for some reason cadasta-api returns lists instead of a hash with error responses
            json.dumps(result,indent=4)
        ))

        transform_and_raise_api_errors(result)
        return result
    except requests.exceptions.RequestException, e:
        error = 'error connection cadasta api: {0}'.format(e.message)
        raise toolkit.ValidationError([error])
    except ValueError, e:
        raise toolkit.ValidationError(error_dict={
            'message': 'The response from the cadasta api was not valid JSON',
            'response': r.text,
            'exception': e.message
        })


def cadasta_get_api(endpoint, params, _=None, **kwargs):
    return call_api(endpoint, requests.get, params=params, **kwargs)


def cadasta_post_api(endpoint, data, _=None, **kwargs):
    return call_api(endpoint, requests.post, json=data, **kwargs)

def cadasta_patch_api(endpoint, data, _=None, **kwargs):
    return call_api(endpoint, requests.patch, json=data, **kwargs)

def cadasta_post_files_api(endpoint, data, upload_field, **kwargs):
    requests_data = data.copy()
    files = {}
    for field_name in upload_field:
        field = requests_data.pop(field_name,None)
        if field:
            # the tuple indicates ( filename, file binary )
            files[field_name] = ( field.get('filename',''), field.get('file',None) )
    return call_api(endpoint, requests.post, data=requests_data, files=files,
                    **kwargs)
