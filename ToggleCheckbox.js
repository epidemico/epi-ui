// @flow
import React from 'react'

type PropTypes = {
  component: string,
  element: Object,
  field?: string,
  id?: string,
  elementName?: string,
  labels: Array<string>,
  onChange: Function,
}

const ToggleCheckbox = ({ element, id, onChange, labels, component, field }: PropTypes) => {
  const elementName = element.name || element.displayName
  return (
    <div key={`${id || elementName}_${component}`} className="onoffswitch onoffswitch--default">
      <input
        type="checkbox"
        name="onoffswitch"
        className="onoffswitch-checkbox"
        id={`onoffswitch${id || elementName}_${component}`}
        checked={element.on || element.registered || element[field] || 0}
        onChange={() => onChange(id || element._id || elementName)}
        disabled={element.status ? element.status : false}
      />
      <label
        className="onoffswitch-label"
        htmlFor={`onoffswitch${id || elementName}_${component}`}
        style={{ margin: 0 }}
      >
        <span
          className="onoffswitch-inner"
          data-text-before={labels ? labels[0] : 'On'}
          data-text-after={labels ? labels[1] : 'Off'}
        />
        <span className="onoffswitch-switch" />
      </label>
    </div>
  )
}

export default ToggleCheckbox
