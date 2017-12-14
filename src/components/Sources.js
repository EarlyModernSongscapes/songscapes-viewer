import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class HomePage extends Component {
  render() {
    let sources = 'loading'
    if (this.props.sources.length > 0) {
      sources = (<ul className="sourceList">
        {this.props.sources.map((s, i) => {
          // TODO fix these string operations
          const label = s.split('-')[1].split('.xml')[0]
          const url = s.split('/')[2].split('.xml')[0]
          const active = s.includes(this.props.active) ? 'active' : 'inactive'
          return <li key={i} className={active}><Link to={url}>{label}</Link></li>
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

HomePage.propTypes = {
  sources: PropTypes.array,
  active: PropTypes.string
}
