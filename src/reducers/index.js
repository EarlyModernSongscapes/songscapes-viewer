import { REQUEST_RESOURCE, RECEIVE_RESOURCE } from '../actions'
import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

function reduceResource(state = {
  isFetching: false
}, action) {
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

function resources(state = {}, action) {
  switch (action.type) {
    case RECEIVE_RESOURCE:
    case REQUEST_RESOURCE:
      return Object.assign({}, state,
        reduceResource(state.resources, action)
      )
    default:
      return state
  }
}

const emsViewer = combineReducers({
  resources,
  router: routerReducer
})

export default emsViewer
