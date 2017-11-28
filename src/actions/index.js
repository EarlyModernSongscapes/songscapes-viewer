import fetch from 'isomorphic-fetch'

export const REQUEST_RESOURCE = 'REQUEST_RESOURCE'
export const RECEIVE_RESOURCE = 'RECEIVE_RESOURCE'

function requestResource(url, docType) {
  return {
    type: REQUEST_RESOURCE,
    url,
    docType
  }
}

function receiveResource(data, docType) {
  return {
    type: RECEIVE_RESOURCE,
    data,
    receivedAt: Date.now(),
    docType
  }
}

/** ********
 * thunks *
 ******** **/

export function getResource(url, docType) {
  return dispatch => {
    dispatch(requestResource(url, docType))
    return fetch(url)
      .then(response => response.text())
      .then(data => dispatch(receiveResource(data, docType)))
  }
}
