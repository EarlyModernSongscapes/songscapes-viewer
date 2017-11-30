import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'

export default class HomePage extends Component {
  render() {
    return (
      <div>
        <h4>Sources</h4>
        <ul>
          {this.props.sources.map((s) => {
            <li>{s}</li>
          })}
        </ul>
      </div>
    )
  }
}

HomePage.propTypes = {
  sources: PropTypes.array
}
