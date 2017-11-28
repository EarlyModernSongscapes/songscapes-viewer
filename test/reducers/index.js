import expect from 'expect'
import emsViewer from '../../src/reducers'

const initialState = { resources: {}, router: { 'location': null } }

describe('Test reducers', () => {
  it('should handle initial state', () => {
    expect(
      emsViewer(undefined, {})
    ).toEqual(initialState)
  })

  it('should handle REQUEST_RESOURCE', () => {
    const state = Object.assign({}, initialState)
    const nextState = emsViewer(state, {
      type: 'REQUEST_RESOURCE',
      url: './data/tei/tei.xml',
      docType: 'tei'
    })
    expect(nextState.resources.tei).toEqual({ isFetching: true })
  })

  it('should handle RECEIVE_RESOURCE', () => {
    const text = '<TEI><teiHeader/><text><body><schemaSpec></schemaSpec></body></text></TEI>'
    const newState = Object.assign({}, initialState,
      { resources: { tei: {isFetching: true} } }
    )
    const state = emsViewer(newState, {
      type: 'RECEIVE_RESOURCE',
      data: text,
      docType: 'tei'
    })

    expect(state.resources.tei.data).toEqual(text)
  })
})
