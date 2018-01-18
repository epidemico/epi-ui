// @flow
import React from 'react'

type PropTypes = {
  size: string,
  showContainer: boolean,
  color: string,
}

const Spinner = (props: PropTypes) => (
  <div className={`spinner-container ${props.showContainer ? 'is-visible' : ''}`}>
    <div className={`spinner spinner--${props.size} spinner--${props.color}`}>
      <div className="circle" />
    </div>
  </div>
)

Spinner.defaultProps = {
  size: 'sm',
  showContainer: false,
  color: 'blue',
}

export default Spinner
