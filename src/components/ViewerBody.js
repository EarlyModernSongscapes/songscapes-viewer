import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
import CETEI from '../../node_modules/CETEIcean/src/CETEI' // :'(
// NB Verovio must be available as global variable

export default class HomePage extends Component {
  constructor(props) {
    super(props)
    const e = document.documentElement
    const g = document.getElementsByTagName('body')[0]
    const x = window.innerWidth || e.clientWidth || g.clientWidth
    // const y = window.innerHeight|| e.clientHeight|| g.clientHeight
    const vrvOptions = {
      pageWidth: (x - 300) * 100 / 36,
      pageHeight: 1000 * 100 / 40,
      ignoreLayout: 1,
      adjustPageHeight: 1,
      border: 10,
      scale: 35
    }
    const vrv = new window.verovio.toolkit()
    vrv.setOptions(vrvOptions)

    this.state = { vrv }
  }

  componentDidMount() {
    if (!this.props.collation) {
      this.props.getResource(`/data/collations/${this.props.song}.xml`, 'collation')
      this.props.getResource(`/data/tei/${this.props.source}.xml`, 'tei')
      this.props.getResource(`/data/mei/${this.props.source}.xml`, 'mei')
    }
  }

  componentDidUpdate() {
    if (this.props.collation && this.props.tei && this.props.mei) {
      // Render TEI with CETEIcean
      const cc = new CETEI()
      cc.makeHTML5(this.props.tei, (teiData) => {
        // Render MEI with Verovio
        this.state.vrv.loadData( this.props.mei + '\n', '' )
        const svg = this.state.vrv.renderPage(1)
        const parser = new window.DOMParser()
        const svgDoc = parser.parseFromString(svg, 'text/xml')

        const colDoc = parser.parseFromString(this.props.collation, 'text/xml')
        // Make links for text variants
        for (const app of Array.from(colDoc.getElementsByTagName('app'))) {
          for (const rdg of Array.from(app.getElementsByTagName('rdg'))) {
            const sourceAndId = rdg.children[0].getAttribute('target').split('#')
            if (sourceAndId[0].includes(this.props.source)) {
              teiData.querySelector(`#${sourceAndId[1]}`).classList.add('variant')
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

        // Append to component's DOM
        const xi = teiData.getElementsByTagName('xi:include')[0]
        xi.parentNode.replaceChild(svgDoc.documentElement, xi)
        this.refs.teiData.appendChild(teiData)
        window.tei = teiData
      })
    }
  }

  render() {
    return (
      <div ref="teiData"/>
    )
  }
}

HomePage.propTypes = {
  getResource: PropTypes.func,
  tei: PropTypes.string,
  mei: PropTypes.string,
  collation: PropTypes.string,
  song: PropTypes.string,
  source: PropTypes.string
}
