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

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  renderMEI(mei) {
    const x = 400
    const vrvOptions = {
      pageWidth: x * 100 / 35,
      pageHeight: 1000 * 100 / 35,
      ignoreLayout: 1,
      adjustPageHeight: 1,
      border: 10,
      scale: 35
    }
    this.props.vrv.setOptions(vrvOptions)
    this.props.vrv.loadData( mei + '\n', '' )
    const svg = this.props.vrv.renderPage(1)
    return new DOMParser().parseFromString(svg, 'text/xml')
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
                if (v.isOmitted) {
                  return (<li style={{height: '100px', width: '100px'}} className="mdc-list-item" key={i}>
                    <span className="mdc-list-item__graphic">{v.wit.split('#M-')[1]}</span>
                    <span>[omitted.]</span>
                  </li>)
                } else if (!v.isLemma) {
                  const svgDoc = this.renderMEI(v.mei)
                  const height = svgDoc.documentElement.getAttribute('height')
                  return (<li className="mdc-list-item" key={i} style={{height}}>
                    <span className="mdc-list-item__graphic">{v.wit.split('#M-')[1]}</span>
                    <div dangerouslySetInnerHTML={{__html: new XMLSerializer().serializeToString(svgDoc)}} />
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
