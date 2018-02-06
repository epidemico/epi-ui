// @flow
import React from 'react'
import styles from './styles/Spinner.css'

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

// Must keep this synced with PropTypes above manually:
Spinner.flowTypes = `{
  size: string,
  showContainer: boolean,
  color: string,
}`

Spinner.defaultProps = {
  size: 'sm',
  showContainer: false,
  color: 'blue',
}

export default Spinner
