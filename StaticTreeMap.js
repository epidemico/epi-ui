// @flow
import React from 'react'
import d3 from 'd3'

type PropTypes = {
  data: Object,
}

type StateTypes = {
  mounted: boolean,
  autoWidth: number,
  autoHeight: number,
}

export default class StaticTreeMap extends React.Component<PropTypes, StateTypes> {
  static color = d3.scale.category20c()

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

  render() {
    const { mounted, autoWidth, autoHeight } = this.state
    if (!mounted) return <div ref={workspace => (this.workspace = workspace)} />

    const width = autoWidth || 960
    const height = autoHeight || 500

    const treemap = d3.layout
      .treemap()
      .size([width, height])
      .sticky(true)
      .sort((a, b) => a.value - b.value)(this.props.data)

    return (
      <div
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {treemap.map(n => (
          <div
            key={Math.random()}
            className="node"
            style={{
              border: 'solid 1px white',
              font: '10px sans-serif',
              lineHeight: '12px',
              overflow: 'hidden',
              position: 'absolute',
              textIndent: '2px',
              background: n.children ? StaticTreeMap.color(n.name) : null,
              left: `${n.x}px`,
              top: `${n.y}px`,
              width: `${Math.max(0, n.dx - 1)}px`,
              height: `${Math.max(0, n.dy - 1)}px`,
            }}
          >
            {n.children ? null : n.name}
          </div>
        ))}
      </div>
    )
  }

  workspace: ?HTMLDivElement
}
