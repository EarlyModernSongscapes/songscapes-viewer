import { REQUEST_RESOURCE, RECEIVE_RESOURCE, GET_COLLATION_SOURCES } from '../actions'
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

// function variants(state = {}, action) {
//   switch (action.type) {
//     case GET_VARIANTS:
//       if (action.dataType === 'tei') {
//         for (const rdg of Array.from(action.app.getElementsByTagName('rdg'))) {
//           const sourceAndId = rdg.children[0].getAttribute('target').split('#')
//           fetch(sourceAndId[0])
//             .then(response => response.text())
//             .then(text => {
//               const source = parser.parseFromString(text, 'text/xml')
//             })
//         }
//       }
//     default:
//       return state
//   }
// }

const emsViewer = combineReducers({
  resources,
  router: routerReducer
})

export default emsViewer
