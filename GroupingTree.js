import React, { Component } from 'react'
import { SvgIcon, Tree } from '/imports/epi-ui'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import CSSTransition from 'react-transition-group/CSSTransition'

export default class GroupingTree extends Component {
  getTreeData = () => {
    const { treeData, currentPortfolio } = this.props
    if (treeData) return [treeData]
    const topics = currentPortfolio.formattedTags.topics // Same with tags?
    if (!topics) return []
    return topics.map(topic => {
      const obj = {}
      obj.name = topic.term
      const traverse = list => {
        return (list || []).map(c => {
          return { name: c.term, children: traverse(c.children) }
        })
      }
      obj.children = traverse(topic.children)
      return obj
    })
  }
  render() {
    const { actions, currentPortfolio, groupingTreeIsOpen } = this.props
    let treeContent = ''
    if (groupingTreeIsOpen) {
      treeContent = (
        <CSSTransition key={1} classNames="slideHeight" timeout={400}>
          <div id="tree-wrapper" className="tree-wrapper">
            <div className="close-tree" onClick={() => actions.toggleGroupingTree()}>
              <SvgIcon icon="Close" size={1} hideLabel />
            </div>
            <h3>Group Data</h3>
            <p>
              Expand/collapse the categories below to group data for chart and table visualizations.
            </p>
            {this.getTreeData().map((d, i) => {
              return (
                <div className="tree" key={i}>
                  <Tree
                    data={d}
                    topics={currentPortfolio.formattedTags.topics}
                    onChange={this.props.actions.onTreeChange}
                  />
                </div>
              )
            })}
          </div>
        </CSSTransition>
      )
    }
    return <TransitionGroup>{treeContent}</TransitionGroup>
  }
}
