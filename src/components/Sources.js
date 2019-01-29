import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Sources extends Component {
  render() {
    let sources = 'loading'
    if (this.props.sources) {
      if (this.props.sources.tei) {
        console.log(this.props.sources)
        sources = (<ul className="sourceList">
          {this.props.sources.tei.map((s, i) => {
            // TODO fix these string operations -- can we get these data from Islandora?
            // const label = s.split('-')[1].split('.xml')[0]
            // const url = s.split('/')[3].split('.xml')[0].split('-')[1]
            // const label = s.url.match(/datastream\/(.*?)\//)[1].split('-')[1]
            const active = s.url.includes(this.props.active) ? 'active' : 'inactive'
            const meiSource = this.props.sources.mei.filter(ms => ms.source === s.source)[0]
            const linkToMEI = meiSource ? meiSource.url : ''
            const aToMEI = (<a href={linkToMEI} style={
              {textDecoration: 'underline', visibility: meiSource ? 'visible' : 'hidden'}
            }>MEI</a>)
            return (
              <li key={i} className={active}>
                <Link to={s.source}>{s.source}</Link>
                <span style={{float: 'right'}}>
                  <a href={s.url} style={{textDecoration: 'underline'}}>TEI</a>&nbsp;&nbsp;
                  {aToMEI}
                </span>
              </li>
            )
          })}
        </ul>)
      }
    }
    return (
      <div>
        <h4>Sources</h4>
        {sources}
      </div>
    )
  }
}

Sources.propTypes = {
  sources: PropTypes.object,
  active: PropTypes.string
}
