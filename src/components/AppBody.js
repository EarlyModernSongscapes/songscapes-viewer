import React from 'react'
import { Component } from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import Viewer from '../containers/Viewer'

class AppBody extends Component {
  render() {
    return (<div className="mdc-typography">
      <div>
        <main>
          <Route path="/:source?" render={() => <Viewer song={this.props.song} />} />
        </main>
      </div>
    </div>)
  }
}

AppBody.propTypes = {
  song: PropTypes.string
}

export default AppBody
