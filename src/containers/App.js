import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import AppBody from '../components/AppBody'

const mapStateToProps = (state, ownProps) => {
  return {
    song: ownProps.song,
    source: ownProps.source,
  }
}

const mapDispatchToProps = () => {
  return {  }
}

const App = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBody))

export default App
