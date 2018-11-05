import { REQUEST_RESOURCE, RECEIVE_RESOURCE, GET_COLLATION_SOURCES,
  SET_VARIANTS, SET_MUSIC_VARIANTS,
  SET_MUSIC_POPOUT_POSITION, SET_POPOUT_POSITION, UNSET_POPOUT_POSITION } from '../actions'
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
  const teiWits = colDoc.getElementsByTagName('witness')
  const tei = Array.from(teiWits).map(teiWit => {
    return {
      source: teiWit.getAttribute('xml:id'),
      url: teiWit.children[0].getAttribute('target')
    }
  })
  const meiWits = colDoc.getElementsByTagName('mei:source')
  const mei = Array.from(meiWits).map(meiWit => {
    return {
      source: meiWit.getAttribute('xml:id').split('M-')[1],
      url: meiWit.getAttribute('target')
    }
  })
  const sources = {tei, mei}
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

function musicVariants(state = [], action) {
  switch (action.type) {
    case SET_MUSIC_VARIANTS:
      const contextedVariants = []
      for (const variant of action.variants) {
        const values = Array.from(variant.values)
        variant.values = []
        for (const value of values) {
          if (value.isOmitted) {
            variant.values.push(value)
            continue
          }
          value.mei = `<?xml version="1.0" encoding="UTF-8"?>
          <mei xmlns="http://www.music-encoding.org/ns/mei">
              <meiHead>
                  <fileDesc>
                      <titleStmt>
                          <title></title>
                      </titleStmt>
                      <pubStmt></pubStmt>
                  </fileDesc>
              </meiHead>
              <music>
                  <body>
                      <mdiv>
                          <score>
                              ${value.scoreDef}
                              ${value.eventData}
                          </score>
                      </mdiv>
                  </body>
              </music>
          </mei>
          `
          variant.values.push(value)
        }
        contextedVariants.push(variant)
      }
      return contextedVariants
    default:
      return state
  }
}

function ui(state = {}, action) {
  switch (action.type) {
    case SET_MUSIC_POPOUT_POSITION:
      return Object.assign({}, state,
        {musicPopoutPosition: action.rect})
    case SET_POPOUT_POSITION:
      return Object.assign({}, state,
        {popoutPosition: action.rect})
    case UNSET_POPOUT_POSITION:
      return Object.assign({}, state,
        {musicPopoutPosition: undefined,
          popoutPosition: undefined})
    default:
      return state
  }
}

const emsViewer = combineReducers({
  resources,
  variants,
  musicVariants,
  ui,
  router: routerReducer
})

export default emsViewer
