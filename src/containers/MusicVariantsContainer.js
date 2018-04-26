import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { unsetPopoutPosition } from '../actions'
import MusicVariants from '../components/MusicVariants'

const mapStateToProps = (state, ownProps) => {
  return {variants: state.musicVariants, vrv: ownProps.vrv, popoutPosition: state.ui.musicPopoutPosition}
}

const mapDispatchToProps = (dispatch) => {
  return {
    unsetPopoutPosition: () => {
      dispatch(unsetPopoutPosition())
    }
  }
}

const MusicVariantsContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(MusicVariants))

export default MusicVariantsContainer
