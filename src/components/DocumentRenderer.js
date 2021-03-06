import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
import CETEI from '../../node_modules/CETEIcean/src/CETEI' // :'(
// NB Verovio must be available as global variable

export default class DocumentRenderer extends Component {
  componentDidUpdate() {
    this.refs.teiData.innerHTML = 'Loading...'
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
      let svgDoc
      const parser = new window.DOMParser()
      // Render TEI with CETEIcean
      const cc = new CETEI()
      cc.makeHTML5(this.props.tei, (teiData) => {
        // Render MEI with Verovio if present
        if (this.props.mei !== 'nodata') {
          this.props.vrv.loadData( this.props.mei + '\n', '' )
          let svg = '<span>'
          for (const [pg, n] of Array(this.props.vrv.getPageCount()).entries()) {
            n
            svg += this.props.vrv.renderPage(pg + 1)
          }
          svg += '</span>'
          // const svg = this.props.vrv.renderPage(1)
          svgDoc = parser.parseFromString(svg, 'text/xml')
        }
        const colDoc = parser.parseFromString(this.props.collation, 'text/xml')
        // Make links for text variants
        for (const app of Array.from(colDoc.getElementsByTagName('app'))) {
          for (const rdg of Array.from(app.getElementsByTagName('rdg'))) {
            // TODO deal with empty readings
            if (rdg.children.length > 0) {
              const sourceAndId = rdg.children[0].getAttribute('target').split('#')
              if (sourceAndId[0].includes(this.props.source)) {
                const variant = teiData.querySelector(`#${sourceAndId[1]}`)
                if (variant) {
                  variant.classList.add('variant')
                  variant.onclick = (e) => {
                    this.props.getVariants(app, rdg.getAttribute('wit'))
                    const parentPos = e.target.offsetParent.getBoundingClientRect()
                    this.props.setPopoutPosition({
                      top: e.pageY,
                      left: e.pageX,
                      parentTop: parentPos.top,
                      parentLeft: parentPos.left,
                    })
                  }
                }
              }
            }
          }
        }
        // Make links for music variants
        if (this.props.mei !== 'nodata') {
          for (const app of Array.from(colDoc.getElementsByTagName('mei:app'))) {
            const appType = app.getAttribute('type')
            for (const rdg of Array.from(app.getElementsByTagName('mei:rdg'))) {
              const mTargets = rdg.getAttribute('target')
              if (mTargets) {
                const targets = mTargets.split(/\s+/)
                for (const target of targets) {
                  const sourceAndId = target.split('#')
                  if (sourceAndId[0].includes(this.props.source)) {
                    const musVariant = svgDoc.querySelector(`#${sourceAndId[1]}`)
                    if (musVariant) {
                      if (appType === 'barline') {
                        const barline = musVariant.querySelector('.barLineAttr')
                        if (barline) {
                          barline.classList.add('musVariant')
                          barline.onclick = (e) => {
                            this.props.getMusicVariants(app, rdg.getAttribute('source'))
                            const parentPos = e.target.closest('tei-notatedmusic').offsetParent.getBoundingClientRect()
                            this.props.setMusicPopoutPosition({
                              top: e.pageY,
                              left: e.pageX,
                              parentTop: parentPos.top,
                              parentLeft: parentPos.left,
                            })
                          }
                        }
                        break
                      } else {
                        musVariant.classList.add('musVariant')
                        musVariant.onclick = (e) => {
                          this.props.getMusicVariants(app, rdg.getAttribute('source'))
                          const parentPos = e.target.closest('tei-notatedmusic').offsetParent.getBoundingClientRect()
                          this.props.setMusicPopoutPosition({
                            top: e.pageY,
                            left: e.pageX,
                            parentTop: parentPos.top,
                            parentLeft: parentPos.left,
                          })
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          const xi = teiData.getElementsByTagName('xi:include')[0]
          xi.parentNode.replaceChild(svgDoc.documentElement, xi)
        }
        this.refs.teiData.innerHTML = ''
        this.refs.teiData.appendChild(teiData)
      })
    }
  }

  render() {
    return (<div ref="teiData" key={this.props.source}>Loading...</div>)
  }
}

DocumentRenderer.propTypes = {
  getVariants: PropTypes.func,
  getMusicVariants: PropTypes.func,
  setPopoutPosition: PropTypes.func,
  setMusicPopoutPosition: PropTypes.func,
  vrv: PropTypes.object,
  source: PropTypes.string,
  tei: PropTypes.string,
  mei: PropTypes.string,
  collation: PropTypes.string,
}
