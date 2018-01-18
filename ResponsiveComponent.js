import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ResponsiveComponent extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element.isRequired, PropTypes.string.isRequired]),
  }

  state = {
    mounted: false,
    autoWidth: 0,
    autoHeight: 0,
  }

  componentDidMount() {
    this.setState(() => ({
      mounted: true,
      autoWidth: this.workspace.offsetWidth,
      autoHeight: this.workspace.offsetHeight,
    }))
  }

  render() {
    const { mounted, autoWidth, autoHeight } = this.state
    if (!mounted) return <div ref={workspace => (this.workspace = workspace)} />

    const width = autoWidth || 960
    const height = autoHeight || 500
    const style = Object.assign({}, this.props.style, { width, height })

    return React.createElement('div', { ...this.props, style }, this.props.children)
  }
}
