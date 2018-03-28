// @flow
import * as React from 'react'

import ProgressIndicator from './ProgressIndicator'
import Spinner from './Spinner'
import SvgIcon from './SvgIcon'

import styles from './styles/Modal.css'

type BodyType = {
  title: string,
  dom: React.Node,
}

type PropTypes = {
  active: boolean,
  body: BodyType,
  cancelTitle: string,
  centerContent: boolean,
  currentStep: number,
  doneText: string,
  fullScreen: boolean,
  hasSteps: boolean,
  loader: boolean,
  onCancel: Function,
  onNext: Function,
  onPrev: Function,
  onSubmit: Function,
  showFooter: boolean,
  showSubmit: boolean,
  submitTitle: string,
  totalSteps: number,
}

export default class Modal extends React.PureComponent<PropTypes> {
  // Must keep this synced with PropTypes above manually:
  static flowTypes = `{
  active: boolean,
  body: BodyType,
  cancelTitle: string,
  centerContent: boolean,
  currentStep: number,
  doneText: string,
  fullScreen: boolean,
  hasSteps: boolean,
  loader: boolean,
  onCancel: Function,
  onNext: Function,
  onPrev: Function,
  onSubmit: Function,
  showFooter: boolean,
  showSubmit: boolean,
  submitTitle: string,
  totalSteps: number,
}`

  static defaultProps = {
    active: false,
    body: {},
    cancelTitle: `Cancel`,
    centerContent: false,
    currentStep: 1,
    doneText: "I'm done!",
    fullScreen: false,
    hasSteps: false,
    loader: false,
    onCancel: () => {},
    onNext: () => {},
    onPrev: () => {},
    onSubmit: () => {},
    showFooter: true,
    showSubmit: true,
    submitTitle: `Submit`,
    totalSteps: 1,
  }

  render() {
    const {
      active,
      body,
      cancelTitle,
      centerContent,
      currentStep,
      doneText,
      fullScreen,
      hasSteps,
      loader,
      onCancel,
      onNext,
      onPrev,
      onSubmit,
      showFooter,
      showSubmit,
      submitTitle,
      totalSteps,
    } = this.props

    let modalContent = ''

    if (active) {
      modalContent = (
        <div className="modal-wrapper">
          <div className="modal-background" onClick={onCancel} />
          <div className={`modal ${fullScreen ? 'modal--fullscreen' : 'modal--fixed-height'}`}>
            <div className="modal-header">
              <div className={`modal-title ${centerContent ? 'is-centered' : ''}`}>{body.title}</div>
              <div onClick={onCancel} className="modal-cancel">
                <SvgIcon icon="Close" hideLabel />
                <span className="modal-cancel-label">Cancel</span>
              </div>
            </div>
            <div className={`modal-body ${centerContent ? 'is-centered' : ''}`}>{body.dom}</div>
            {showFooter &&
              !hasSteps && (
                <div className="modal-footer">
                  <div>
                    <button onClick={onCancel} className="btn btn-gray">
                      {cancelTitle}
                    </button>
                  </div>
                  {showSubmit && (
                    <div style={{ marginLeft: 5 }}>
                      <button onClick={onSubmit} className="btn btn-secondary">
                        {submitTitle}
                      </button>
                    </div>
                  )}
                </div>
              )}
            {showFooter &&
              hasSteps && (
                <div className="modal-footer modal-footer--has-steps">
                  {currentStep > 1 ? (
                    <div className="modal-footer-prev">
                      <button onClick={() => onPrev(currentStep - 1)} className="btn btn-gray">
                        Previous
                      </button>
                    </div>
                  ) : (
                    <div className="modal-footer-prev" />
                  )}
                  {totalSteps > 1 && <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />}
                  {currentStep < totalSteps && (
                    <div className="modal-footer-next">
                      <button className="btn btn-secondary" onClick={() => onNext(currentStep + 1)}>
                        Next
                      </button>
                    </div>
                  )}
                  {currentStep === totalSteps && (
                    <div className="modal-footer-next">
                      <button className="btn btn-secondary" onClick={onSubmit}>
                        {loader ? <Spinner size="sm" /> : totalSteps > 1 ? doneText : 'OK'}
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      )
    }
    return modalContent
  }
}
