import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
import CETEI from '../../node_modules/CETEIcean/src/CETEI' // :'(
// NB Verovio must be available as global variable

export default class DocumentRenderer extends Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.tei || nextProps.tei) {
      return true
    } else {
      return false
    }
  }

  componentDidUpdate() {
    this.refs.teiData.innerHTML = ''
    const x = this.refs.teiData.offsetWidth
    const vrvOptions = {
      pageWidth: x * 100 / 35,
      pageHeight: 1000 * 100 / 35,
      ignoreLayout: 1,
      adjustPageHeight: 1,
      border: 10,
      scale: 35
    }
    this.props.vrv.setOptions(vrvOptions)
    if (this.props.collation && this.props.tei && this.props.mei) {
      // Render TEI with CETEIcean
      const cc = new CETEI()
      cc.makeHTML5(this.props.tei, (teiData) => {
        // Render MEI with Verovio
        this.props.vrv.loadData( this.props.mei + '\n', '' )
        const svg = this.props.vrv.renderPage(1)
        const parser = new window.DOMParser()
        const svgDoc = parser.parseFromString(svg, 'text/xml')

        const colDoc = parser.parseFromString(this.props.collation, 'text/xml')
        // Make links for text variants
        for (const app of Array.from(colDoc.getElementsByTagName('app'))) {
          for (const rdg of Array.from(app.getElementsByTagName('rdg'))) {
            const sourceAndId = rdg.children[0].getAttribute('target').split('#')
            if (sourceAndId[0].includes(this.props.source)) {
              const variant = teiData.querySelector(`#${sourceAndId[1]}`)
              variant.classList.add('variant')
              variant.onclick = () => { this.props.getVariants(app, this.props.source, 'tei') }
            }
          }
        }
        // Make links for music variants
        for (const app of Array.from(colDoc.getElementsByTagName('mei:app'))) {
          for (const rdg of Array.from(app.getElementsByTagName('mei:rdg'))) {
            const targets = rdg.getAttribute('target').split(/\s+/)
            for (const target of targets) {
              const sourceAndId = target.split('#')
              if (sourceAndId[0].includes(this.props.source)) {
                svgDoc.querySelector(`#${sourceAndId[1]}`).classList.add('musVariant')
              }
            }
          }
        }
        const xi = teiData.getElementsByTagName('xi:include')[0]
        xi.parentNode.replaceChild(svgDoc.documentElement, xi)
        this.refs.teiData.appendChild(teiData)
      })
    }
  }

  render() {
    return (<div ref="teiData" key={this.props.source}/>)
  }
}

DocumentRenderer.propTypes = {
  getVariants: PropTypes.func,
  vrv: PropTypes.object,
  source: PropTypes.string,
  tei: PropTypes.string,
  mei: PropTypes.string,
  collation: PropTypes.string,
}
