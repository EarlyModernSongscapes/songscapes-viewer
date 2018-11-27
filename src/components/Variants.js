import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
// import { Link } from 'react-router-dom'

export default class Variants extends Component {
  constructor(props) {
    super(props)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside(event) {
    if (this.refs.vpop && !this.refs.vpop.contains(event.target)) {
      this.props.unsetPopoutPosition()
    }
  }

  render() {
    if (this.props.variants.length > 0 && this.props.popoutPosition) {
      return (
        <div className="variant-popout mdc-elevation--z10"
          style={{
            top: this.props.popoutPosition.top + window.pageYOffset + 25,
            left: this.props.popoutPosition.left  + window.pageXOffset
          }}
          ref="vpop">
          <ul className="mdc-list mdc-list--dense">
            <hr className="mdc-list-divider"/>
            {this.props.variants.map((group) => {
              return [group.values.map((v, i) => {
                if (!v.isLemma) {
                  return (<li className="mdc-list-item" key={i}>
                    <span className="mdc-list-item__graphic source_name">{v.wit.replace('#', '')}</span>
                    {v.text}
                  </li>)
                }
                return null
              }),
              <hr className="mdc-list-divider" key="hr"/>]
            })}
          </ul>
        </div>
      )
    }
    return null
  }
}

Variants.propTypes = {
  variants: PropTypes.array,
  popoutPosition: PropTypes.object,
  unsetPopoutPosition: PropTypes.func
}
