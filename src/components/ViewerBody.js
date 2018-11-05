import React from 'react'
import PropTypes from 'prop-types'
import { Component } from 'react'
import Sources from './Sources'
import VariantsContainer from '../containers/VariantsContainer'
import MusicVariantsContainer from '../containers/MusicVariantsContainer'
import DocumentRenderer from './DocumentRenderer'

export default class ViewerBody extends Component {
  constructor(props) {
    super(props)
    this.state = {
      vrv: new window.verovio.toolkit()
    }
  }

  componentDidMount() {
    if (!this.props.collation) {
      // Only get the collation once
      // https://ems.digitalscholarship.utsc.utoronto.ca/
      this.props.getCollation(`/islandora/object/${this.props.song}/datastream/OBJ/view`)
      if (this.props.source && this.props.sources) {
        this.getResources()
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.source && prevProps.source !== this.props.source) {
      this.getResources()
    } else if (!prevProps.sources && this.props.sources) {
      this.getResources()
    }
  }

  getResources() {
    // https://ems.digitalscholarship.utsc.utoronto.ca/
    this.props.getResource(`/islandora/object/${this.props.song}/datastream/TEI-${this.props.source}/view`, 'tei')
    // MEI sources are not always present. Check in this.props.sources
    const msource = this.props.sources.mei.filter(s => s.source === this.props.source)[0]
    if (msource) {
      this.props.getResource(`/islandora/object/${this.props.song}/datastream/MEI-${this.props.source}/view`, 'mei')
    } else {
      this.props.getResource(null, 'mei')
    }
  }

  render() {
    if (this.props.source) {
      return [
        (<div className="mdc-layout-grid" key="grid">
          <div className="mdc-layout-grid__inner">
            <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
              <Sources sources={this.props.sources || {}} active={this.props.source}/>
            </div>
            <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-10">
              <DocumentRenderer
                source={this.props.source}
                tei={this.props.tei}
                mei={this.props.mei}
                collation={this.props.collation}
                vrv={this.state.vrv}
                setPopoutPosition={this.props.setPopoutPosition}
                setMusicPopoutPosition={this.props.setMusicPopoutPosition}
                getVariants={this.props.getVariants}
                getMusicVariants={this.props.getMusicVariants}/>
            </div>
          </div>
        </div>),
        <VariantsContainer key="popout" />,
        <MusicVariantsContainer vrv={this.state.vrv} key="muspopout" />
      ]
    }
    return null
  }
}

ViewerBody.propTypes = {
  getCollation: PropTypes.func,
  getResource: PropTypes.func,
  getVariants: PropTypes.func,
  getMusicVariants: PropTypes.func,
  tei: PropTypes.string,
  mei: PropTypes.string,
  collation: PropTypes.string,
  sources: PropTypes.object,
  song: PropTypes.string,
  source: PropTypes.string,
  setPopoutPosition: PropTypes.func,
  setMusicPopoutPosition: PropTypes.func
}
