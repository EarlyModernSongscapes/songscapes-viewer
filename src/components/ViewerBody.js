import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
import Sources from './Sources'
import CETEI from '../../node_modules/CETEIcean/src/CETEI' // :'(
// NB Verovio must be available as global variable

export default class HomePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      vrv: new window.verovio.toolkit(),
      sources: []
    }
  }

  componentDidMount() {
    if (!this.props.collation) {
      this.props.getCollation(`/data/collations/${this.props.song}.xml`)
      this.props.getResource(`/data/tei/${this.props.source}.xml`, 'tei')
      this.props.getResource(`/data/mei/${this.props.source}.xml`, 'mei')
    }
  }

  componentDidUpdate() {
    const x = this.refs.teiData.offsetWidth
    const vrvOptions = {
      pageWidth: x * 100 / 35,
      pageHeight: 1000 * 100 / 35,
      ignoreLayout: 1,
      adjustPageHeight: 1,
      border: 10,
      scale: 35
    }
    this.state.vrv.setOptions(vrvOptions)
    if (this.props.collation && this.props.sources && this.props.tei && this.props.mei) {
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
      })
    }
  }

  render() {
    return (
      <div className="mdc-layout-grid">
        <div className="mdc-layout-grid__inner">
          <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
            <Sources sources={this.props.sources || []} active={this.props.source}/>
          </div>
          <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-8">
            <div ref="teiData"/>
          </div>
          <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
            <h4>Variant Info</h4>
          </div>
        </div>
      </div>
    )
  }
}

HomePage.propTypes = {
  getCollation: PropTypes.func,
  getResource: PropTypes.func,
  tei: PropTypes.string,
  mei: PropTypes.string,
  collation: PropTypes.string,
  sources: PropTypes.array,
  song: PropTypes.string,
  source: PropTypes.string
}
