import fetch from 'isomorphic-fetch'

export const REQUEST_RESOURCE = 'REQUEST_RESOURCE'
export const RECEIVE_RESOURCE = 'RECEIVE_RESOURCE'
export const GET_COLLATION_SOURCES = 'GET_COLLATION_SOURCES'
export const GET_VARIANTS = 'GET_VARIANTS'

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

function getCollationSources() {
  return {
    type: GET_COLLATION_SOURCES,
  }
}

export function getVariants(app, source, dataType) {
  return {
    type: GET_VARIANTS,
    app,
    source,
    dataType
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

export function getCollation(url) {
  return dispatch => {
    dispatch(getResource(url, 'collation'))
      .then(() => dispatch(getCollationSources()))
  }
}
