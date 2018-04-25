import { REQUEST_RESOURCE, RECEIVE_RESOURCE, GET_COLLATION_SOURCES,
  SET_VARIANTS, SET_POPOUT_POSITION, UNSET_POPOUT_POSITION } from '../actions'
import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

const parser = new window.DOMParser()

function reduceResource(state = {}, action) {
  let newState = {}
  switch (action.type) {
    case REQUEST_RESOURCE:
      newState = {}
      newState[action.docType] = { isFetching: true }
      return Object.assign({}, state, newState)
    case RECEIVE_RESOURCE:
      newState = {}
      newState[action.docType] = {
        isFetching: false,
        data: action.data,
        lastUpdated: action.receivedAt
      }
      return Object.assign({}, state, newState)
    default:
      return state
  }
}

function getCollationSources(state = {}) {
  const colDoc = parser.parseFromString(state.data, 'text/xml')
  const rdgs = colDoc.getElementsByTagName('app')[0].getElementsByTagName('rdg')
  const sources = Array.from(rdgs).reduce((srcs, rdg) => {
    srcs.push(rdg.children[0].getAttribute('target').split('#')[0])
    return srcs
  }, [])
  return Object.assign({}, state, {sources})
}

function resources(state = {}, action) {
  switch (action.type) {
    case RECEIVE_RESOURCE:
    case REQUEST_RESOURCE:
      return Object.assign({}, state,
        reduceResource(state.resources, action)
      )
    case GET_COLLATION_SOURCES:
      return Object.assign({}, state,
        {collation: getCollationSources(state.collation)}
      )
    default:
      return state
  }
}

function variants(state = [], action) {
  switch (action.type) {
    case SET_VARIANTS:
      return action.variants
    default:
      return state
  }
}

function ui(state = {}, action) {
  switch (action.type) {
    case SET_POPOUT_POSITION:
      return Object.assign({}, state,
        {popoutPosition: action.rect})
    case UNSET_POPOUT_POSITION:
      return Object.assign({}, state,
        {popoutPosition: undefined})
    default:
      return state
  }
}

const emsViewer = combineReducers({
  resources,
  variants,
  ui,
  router: routerReducer
})

export default emsViewer
