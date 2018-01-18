// @flow
import React, { Component } from 'react'
import { uniq } from 'underscore'
import d3 from 'd3'

type PropTypes = {
  data: Object,
  topics: Array<string>,
  onChange: Function,
}

type StateTypes = { data: Object, leaves: Array<Object> }

export default class Tree extends Component<PropTypes, StateTypes> {
  state = { data: {}, leaves: [] }

  componentDidMount() {
    const parentDiv = document.getElementById('tree-wrapper')
    if (!parentDiv) return
    const component = this
    const margin = { top: 20, right: 120, bottom: 20, left: 120 }
    const width = parentDiv.clientWidth - margin.right - margin.left
    const height = 400 - margin.top - margin.bottom
    const fixedDepthWidth = 215

    let i = 0
    const duration = 750

    const tree = d3.layout.tree().size([height, width])

    const diagonal = d3.svg.diagonal().projection(d => {
      return [d.y, d.x]
    })

    const svg = d3
      .select('.tree-component')
      .append('svg')
      .attr('class', 'tree')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    const root = this.props.data
    root.x0 = height / 2
    root.y0 = 0

    update(root)

    d3.select(self.frameElement).style('height', '800px')

    function update(source) {
      // Compute the new tree layout.
      const nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes)

      // Normalize for fixed-depth.
      nodes.forEach(d => {
        d.y = d.depth * 180
      })

      // Update the nodes…
      const node = svg.selectAll('g.node').data(nodes, d => {
        return d.id || (d.id = ++i)
      })

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => {
          return 'translate(' + source.y0 + ',' + source.x0 + ')'
        })
        .on('click', click)

      nodeEnter
        .append('circle') // highlighted node
        .attr('class', 'highlight')
        .attr('r', function(d) {
          return (!d.parent && !d.children) || (d.parent && !d.children) ? 10 : 0
        })

      nodeEnter
        .append('circle') // all parent nodes get a circle
        .attr('class', 'circle')
        .attr('r', function(d) {
          return d.children || d._children ? 5 : ''
        })
        .style('fill', function(d) {
          return d._children ? '#666' : '#fff'
        })
        .style('stroke', function(d) {
          return d._children ? '#fff' : '#666'
        })

      nodeEnter
        .append('rect') // last child node gets a square
        .attr('class', 'square')
        .attr('width', function(d) {
          return d.children || d._children ? 0 : 6
        })
        .attr('height', function(d) {
          return d.children || d._children ? 0 : 6
        })
        .attr('x', '-3')
        .attr('y', '-3')

      nodeEnter
        .append('text')
        .attr('x', d => {
          return d.children || d._children ? -15 : 15
        })
        .attr('dy', '.35em')
        .attr('text-anchor', d => {
          return d.children || d._children ? 'end' : 'start'
        })
        .text(d => {
          return d.name
        })
        .style('fill-opacity', 1e-6)

      // Transition nodes to their new position.
      const nodeUpdate = node
        .transition()
        .duration(duration)
        .attr('transform', d => {
          return 'translate(' + d.y + ',' + d.x + ')'
        })

      nodeUpdate
        .select('rect') // deepest child gets a square icon
        .attr('width', function(d) {
          return d.children || d._children ? 0 : 6
        })
        .attr('height', function(d) {
          return d.children || d._children ? 0 : 6
        })

      nodeUpdate.select('.highlight').attr('r', function(d) {
        return (!d.parent && !d.children) || (d.parent && !d.children) ? 10 : 0
      })

      nodeUpdate
        .select('.circle')
        .attr('r', function(d) {
          return d.children || d._children ? 5 : ''
        })
        .style('fill', function(d) {
          return d._children ? '#666' : '#fff'
        })
        .style('stroke', function(d) {
          return d._children ? '#fff' : '#666'
        })

      nodeUpdate.select('text').style('fill-opacity', 1)

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr('transform', d => {
          return 'translate(' + source.y + ',' + source.x + ')'
        })
        .remove()

      nodeExit.select('circle').attr('r', 1e-6)

      nodeExit.select('text').style('fill-opacity', 1e-6)

      nodeExit
        .select('rect')
        .attr('width', 0)
        .attr('height', 0)

      // Update the links…
      const link = svg.selectAll('path.link').data(links, d => {
        return d.target.id
      })

      // Enter any new links at the parent's previous position.
      link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', d => {
          const o = { x: source.x0, y: source.y0 }
          return diagonal({ source: o, target: o })
        })

      // Transition links to their new position.
      link
        .transition()
        .duration(duration)
        .attr('d', diagonal)

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', d => {
          const o = { x: source.x, y: source.y }
          return diagonal({ source: o, target: o })
        })
        .remove()

      // Stash the old positions for transition.
      nodes.forEach(d => {
        d.x0 = d.x
        d.y0 = d.y
      })
      component.setState({ data: root, leaves: component.getTreeLeaves(root) })
    }

    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d._children = d.children
        d.children = null
      } else {
        d.children = d._children
        d._children = null
      }
      update(d)
    }
  }

  shouldComponentUpdate(nextProps: PropTypes, nextState: StateTypes) {
    return (
      this.leavesArray(this.state.leaves) !== this.leavesArray(nextState.leaves) ||
      JSON.stringify(this.props.topics) !== JSON.stringify(nextProps.topics)
    )
  }

  componentDidUpdate() {
    const { onChange } = this.props
    const { data, leaves } = this.state
    if (onChange) onChange({ data, leaves })
  }

  getTreeLeaves = (data: Object) => {
    const leaves = []
    const traverse = (child, on) => {
      if (!child.children) leaves.push({ name: child.name, on })
      if (child._children === null) leaves.push({ name: child.name, on: 0 })
      if (child && child.children) {
        child.children.forEach(c => {
          traverse(c, 1)
        })
      }
      if (child && child._children) {
        child._children.forEach(c => {
          traverse(c, 0)
        })
      }
    }
    traverse(data)
    return uniq(leaves)
  }

  leavesArray = (leaves: Array<Object>) => {
    return leaves
      .filter(l => l.on)
      .map(l => l.name)
      .sort()
      .toString()
  }

  render() {
    return <div className="tree-component" />
  }
}
