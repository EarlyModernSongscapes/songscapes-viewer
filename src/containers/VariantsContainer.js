import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { unsetPopoutPosition } from '../actions'
import Variants from '../components/Variants'

const mapStateToProps = (state) => {
  return {variants: state.variants, popoutPosition: state.ui.popoutPosition}
}

const mapDispatchToProps = (dispatch) => {
  return {
    unsetPopoutPosition: () => {
      dispatch(unsetPopoutPosition())
    }
  }
}

const VariantsContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(Variants))

export default VariantsContainer
