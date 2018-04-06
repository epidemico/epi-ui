// @flow
import * as React from 'react'
import { DragSource, DropTarget } from 'react-dnd'

type PropTypes = {
  connectDragSource: Function,
  connectDropTarget: Function,
  index: number,
  isDragging: boolean,
  moveColumn: Function,
  label: React.Node | string,
}

function TableDraggableColumn(props: PropTypes) {
  const { label, isDragging, connectDragSource, connectDropTarget } = props
  const opacity = isDragging ? 0 : 1
  return connectDragSource(connectDropTarget(<div style={{ opacity }}>{label}</div>))
}

function collectDragSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

function collectDropTarget(connect) {
  return {
    connectDropTarget: connect.dropTarget(),
  }
}

const columnSource = {
  beginDrag: ({ index }) => ({ index }),
}

const columnTarget = {
  hover(props, monitor, element) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    if (dragIndex === hoverIndex) return
    props.moveColumn(dragIndex, hoverIndex)
    monitor.getItem().index = hoverIndex
  },
}

export default DropTarget('column', columnTarget, collectDropTarget)(DragSource('column', columnSource, collectDragSource)(TableDraggableColumn))
