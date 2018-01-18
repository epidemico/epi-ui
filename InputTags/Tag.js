// @flow
import * as React from 'react'
import { classNames } from 'meteor/maxharris9:classnames'

type RemoveComponentPropTypes = {
  customRemoveComponent?: Function,
  className: string,
  onClick: Function,
  readOnly: boolean,
}

const RemoveComponent = (props: RemoveComponentPropTypes) => {
  if (props.readOnly) return null
  if (props.customRemoveComponent) return <props.customRemoveComponent {...props} />
  return (
    <a className={props.className} onClick={props.onClick}>
      x
    </a>
  )
}

type TagPropTypes = {
  customRemoveComponent?: Function,
  classNames: Object,
  labelField: string,
  onDelete: Function,
  readOnly: boolean,
  removeComponent?: Function,
  tag: Object,
}

export default function Tag(props: TagPropTypes) {
  const label = props.tag[props.labelField]

  const tagClassName = classNames({
    [props.classNames.tag]: true,
    [props.classNames.tagError]: !props.tag.isValid,
  })
  const tagComponent = (
    <span className={tagClassName}>
      {label}
      <RemoveComponent
        className={props.classNames.remove}
        customRemoveComponent={props.customRemoveComponent}
        onClick={props.onDelete}
        readOnly={props.readOnly}
      />
    </span>
  )
  return tagComponent
}

Tag.defaultProps = {
  labelField: 'text',
}
