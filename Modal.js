// @flow
import * as React from 'react'
import SvgIcon from '/imports/epi-ui/SvgIcon'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import CSSTransition from 'react-transition-group/CSSTransition'
import { dynamic } from '/imports/fui'
import Spinner from '/imports/epi-ui/Spinner'

const ProgressIndicator = dynamic(import('./ProgressIndicator'))

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
  static defaultProps = {
    body: {},
    hasSteps: false,
    active: false,
    currentStep: 1,
    totalSteps: 1,
    onNext: () => {},
    onPrev: () => {},
    onCancel: () => {},
    onSubmit: () => {},
    centerContent: false,
    fullScreen: false,
    showFooter: true,
    showSubmit: true,
    submitTitle: `Submit`,
    cancelTitle: `Cancel`,
    loader: false,
  }

  render() {
    const {
      body,
      hasSteps,
      onNext,
      onPrev,
      onCancel,
      onSubmit,
      active,
      currentStep,
      totalSteps,
      centerContent,
      fullScreen,
      showFooter,
      showSubmit,
      submitTitle,
      cancelTitle,
      loader,
    } = this.props

    let modalContent = ''

    if (active) {
      modalContent = (
        <CSSTransition key={1} classNames="fadeSlideModal" timeout={400}>
          <div className="modal-wrapper">
            <div className="modal-background" onClick={onCancel} />
            <div className={`modal ${fullScreen ? 'modal--fullscreen' : 'modal--fixed-height'}`}>
              <div className="modal-header">
                <div className={`modal-title ${centerContent ? 'is-centered' : ''}`}>
                  {body.title}
                </div>
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
                    <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
                    {currentStep < totalSteps && (
                      <div className="modal-footer-next">
                        <button
                          className="btn btn-secondary"
                          onClick={() => onNext(currentStep + 1)}
                        >
                          Next
                        </button>
                      </div>
                    )}
                    {currentStep === totalSteps && (
                      <div className="modal-footer-next">
                        <button className="btn btn-secondary" onClick={onSubmit}>
                          {loader ? <Spinner size="sm" /> : "I'm done!"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </CSSTransition>
      )
    }
    return <TransitionGroup>{modalContent}</TransitionGroup>
  }
}
