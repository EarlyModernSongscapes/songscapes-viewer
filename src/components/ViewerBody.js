import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'

export default class HomePage extends Component {
  componentDidMount() {
    if (!this.props.tei) {
      this.props.getResource(`data/tei/${this.props.filename}.xml`, 'tei')
    }
  }

  render() {
    let data = 'Loading data...'
    if (this.props.tei) {
      data = this.props.tei
    }
    return (
      <div>
        {data}
      </div>
    )
  }
}

HomePage.propTypes = {
  getResource: PropTypes.func,
  tei: PropTypes.string,
  filename: PropTypes.string
}
