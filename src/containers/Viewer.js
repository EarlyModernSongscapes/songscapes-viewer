import { connect } from 'react-redux'
import { getResource, getCollation, getVariants, getMusicVariants,
  setMusicPopoutPosition, setPopoutPosition } from '../actions'
import { withRouter } from 'react-router'
import ViewerBody from '../components/ViewerBody'

const mapStateToProps = (state, ownProps) => {
  const returnProps = {}
  if (ownProps.match.params.song) {
    returnProps.song = ownProps.match.params.song
  } else if (ownProps.song) {
    returnProps.song = ownProps.song
  }
  if (ownProps.match.params.source) {
    returnProps.source = ownProps.match.params.source
  } else if (ownProps.source) {
    returnProps.source = ownProps.source
  }
  if (state.resources.tei) {
    if (!state.resources.tei.isFetching) {
      returnProps.tei = state.resources.tei.data
    }
  }
  if (state.resources.mei) {
    if (!state.resources.mei.isFetching) {
      returnProps.mei = state.resources.mei.data
    }
  }
  if (state.resources.collation) {
    if (!state.resources.collation.isFetching) {
      returnProps.collation = state.resources.collation.data
    }
    if (state.resources.collation.sources) {
      returnProps.sources = state.resources.collation.sources
    }
  }
  return returnProps
}

const mapDispatchToProps = (dispatch) => {
  return {
    getResource: (url, type) => {
      dispatch(getResource(url, type))
    },
    getCollation: (url) => {
      dispatch(getCollation(url))
    },
    getVariants: (app, source) => {
      dispatch(getVariants(app, source))
    },
    getMusicVariants: (app, source) => {
      dispatch(getMusicVariants(app, source))
    },
    setPopoutPosition: (rect) => {
      dispatch(setPopoutPosition(rect))
    },
    setMusicPopoutPosition: (rect) => {
      dispatch(setMusicPopoutPosition(rect))
    }
  }
}

const App = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewerBody))

export default App
