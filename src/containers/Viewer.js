import { connect } from 'react-redux'
import { getResource, getCollation, getVariants, getMusicVariants,
  setMusicPopoutPosition, setPopoutPosition } from '../actions'
import { withRouter } from 'react-router'
import ViewerBody from '../components/ViewerBody'

const mapStateToProps = (state, ownProps) => {
  const returnProps = {}
  let urlsource = ownProps.urlsource
  if (urlsource) {
    // Attempt to ignore other fragments for overlays like in Drupal and Wordpress
    if (urlsource.includes('=') || urlsource.includes('/')) {
      urlsource = false
    }
  }
  if (ownProps.match.params.song) {
    returnProps.song = ownProps.match.params.song
  } else if (ownProps.song) {
    returnProps.song = ownProps.song
  }
  if (urlsource) {
    returnProps.source = urlsource
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
      // if a source hasn't been set yet, pick first (give TEI preference)
      if (!urlsource && !ownProps.source) {
        returnProps.source = state.resources.collation.sources.tei[0].source
      }
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
