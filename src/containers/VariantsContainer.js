import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { getVariants, unsetPopoutPosition } from '../actions'
import Variants from '../components/Variants'

const mapStateToProps = (state, ownProps) => {
  return {variants: state.variants, vrv: ownProps.vrv, popoutPosition: state.ui.popoutPosition}
}

const mapDispatchToProps = (dispatch) => {
  return {
    getVariants: (app, source, dataType) => {
      dispatch(getVariants(app, source, dataType))
    },
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
