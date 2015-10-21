from ckan.plugins import toolkit

import urlparse

from pylons import config
import requests


def call_api(endpoint, function, **kwargs):
    try:
        api_url = config['ckanext.cadasta.api_url']
    except KeyError:
        raise toolkit.ValidationError(
            toolkit._('ckanext.cadasta.api_url has not been set')
        )
    try:
        r = function(urlparse.urljoin(api_url, endpoint), **kwargs)
        # r = function(urlparse.urljoin(api_url, '/post'), **kwargs)
        result = r.json()
        error_dict = result.get('error')
        if error_dict:
            message = result.get('message', '')
            error_dict['message'] = message
            raise toolkit.ValidationError(
                error_dict,
                'Error returned from Cadasta API: {0}'.format(message)
            )
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
    return call_api(endpoint, requests.post, data=data, **kwargs)


def cadasta_post_files_api(endpoint, data, upload_field, **kwargs):
    requests_data = data.copy()
    files = {}
    for field_name in upload_field:
        field = requests_data.pop(field_name, None)
        if field:
            files[field_name] = field

    return call_api(endpoint, requests.post, data=requests_data, files=files,
                    **kwargs)
