import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
// import { Link } from 'react-router-dom'

export default class MusicVariants extends Component {
  constructor(props) {
    super(props)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentDidUpdate() {
    for (const r in this.refs) {
      if (r.includes('vrv-')) {
        const x = 250
        const vrvOptions = {
          pageWidth: x * 100 / 35,
          pageHeight: 1000 * 100 / 35,
          ignoreLayout: 1,
          adjustPageHeight: 1,
          border: 10,
          scale: 35
        }
        this.props.vrv.setOptions(vrvOptions)
        this.props.vrv.loadData( this.refs[r].getAttribute('data-mei') + '\n', '' )
        const svg = this.props.vrv.renderPage(1)
        this.refs[r].innerHTML = svg
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside(event) {
    if (this.refs.vpopmus && !this.refs.vpopmus.contains(event.target)) {
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
          ref="vpopmus">
          <ul className="mdc-list mdc-list--dense">
            <hr className="mdc-list-divider"/>
            {this.props.variants.map((group) => {
              return [group.values.map((v, i) => {
                if (!v.isLemma) {
                  return (<li className="mdc-list-item" key={i}>
                    <span className="mdc-list-item__graphic">{v.wit.replace('#', '')}</span>
                    <span ref={`vrv-${i}`} data-mei={v.mei}/>
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

MusicVariants.propTypes = {
  variants: PropTypes.array,
  vrv: PropTypes.object,
  popoutPosition: PropTypes.object,
  unsetPopoutPosition: PropTypes.func
}
