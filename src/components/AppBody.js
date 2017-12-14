import React from 'react'
import { Component } from 'react'
import { Route } from 'react-router-dom'
import Viewer from '../containers/Viewer'

class AppBody extends Component {
  render() {
    return (<div className="mdc-typography">
      <div>
        <main>
          <Route exact path="/:song/:source" component={Viewer} />
        </main>
      </div>
    </div>)
  }
}

export default AppBody
