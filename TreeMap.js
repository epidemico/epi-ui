// @flow
/* eslint-disable react/no-did-mount-set-state */
import React from 'react'
import { dynamic } from '/imports/fui'

const D3TreeMap = dynamic(import('react-d3-treemap'))

type PropTypes = {
  data: Object,
}

type StateTypes = {
  mounted: boolean,
  autoWidth: number,
  autoHeight: number,
}

export default class TreeMap extends React.Component<PropTypes, StateTypes> {
  state = {
    mounted: false,
    autoWidth: 0,
    autoHeight: 0,
  }

  componentDidMount() {
    this.setState(state => ({
      mounted: true,
      autoWidth: this.workspace ? this.workspace.offsetWidth : state.autoWidth,
      autoHeight: this.workspace ? this.workspace.offsetHeight : state.autoHeight,
    }))
  }

  workspace: ?HTMLDivElement

  render() {
    const { data } = this.props
    const { mounted, autoWidth, autoHeight } = this.state

    if (!mounted || !(data && data.children && data.children.length)) {
      return <div ref={workspace => (this.workspace = workspace)} />
    }

    const width = autoWidth || 960
    const height = autoHeight || 500

    return <D3TreeMap {...{ width, height }} {...this.props} />
  }
}
