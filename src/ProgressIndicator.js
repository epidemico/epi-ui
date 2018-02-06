// @flow
import React from 'react'
import styles from './styles/ProgressIndicator.css'

type PropTypes = {
  currentStep: number,
  totalSteps: number,
}

const ProgressIndicator = (props: PropTypes) => {
  const { currentStep, totalSteps } = props
  const progressBarWidth = currentStep / totalSteps * 100
  const widthClass = {
    width: `${progressBarWidth}%`,
  }
  return (
    <div className="progress-indicator">
      <div className="progress-label">
        Step {currentStep} of {totalSteps}
      </div>
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={widthClass} />
      </div>
    </div>
  )
}

// Must keep this synced with PropTypes above manually:
ProgressIndicator.flowTypes = `{
  currentStep: number,
  totalSteps: number,
}`

export default ProgressIndicator
