import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Sources extends Component {
  render() {
    let sources = 'loading'
    if (this.props.sources.length > 0) {
      sources = (<ul className="sourceList">
        {this.props.sources.map((s, i) => {
          // TODO fix these string operations -- can we get these data from Islandora?
          // const label = s.split('-')[1].split('.xml')[0]
          // const url = s.split('/')[3].split('.xml')[0].split('-')[1]
          const label = s.match(/datastream\/(.*?)\//)[1].split('-')[1]
          const active = s.includes(this.props.active) ? 'active' : 'inactive'
          return <li key={i} className={active}><Link to={label}>{label}</Link></li>
        })}
      </ul>)
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
  sources: PropTypes.array,
  active: PropTypes.string
}
