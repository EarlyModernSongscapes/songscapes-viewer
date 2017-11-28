import { connect } from 'react-redux'
import { getResource } from '../actions'
import { withRouter } from 'react-router'
import ViewerBody from '../components/ViewerBody'

const mapStateToProps = (state, ownProps) => {
  const returnProps = {}
  if (ownProps.match.params.filename) {
    returnProps.filename = ownProps.match.params.filename
  }
  if (state.resources.tei) {
    if (!state.resources.tei.isFetching) {
      returnProps.tei = state.resources.tei.data
    }
  }
  return returnProps
}

const mapDispatchToProps = (dispatch) => {
  dispatch
  return {
    getResource: (url, type) => {
      dispatch(getResource(url, type))
    }
  }
}

const App = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewerBody))

export default App
