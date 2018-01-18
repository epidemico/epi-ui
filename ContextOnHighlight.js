// @flow
import * as React from 'react'
import SvgIcon from '/imports/epi-ui/SvgIcon'
import $ from 'jquery'

const getSelected = () =>
  String(
    window.getSelection
      ? window.getSelection()
      : document.getSelection ? document.getSelection() : ''
  )

type PropTypes = {
  children: React.Node | string,
  contextClassName: string,
  contextMenu: Function,
  onHighlight: Function,
  showContextMenu?: boolean,
  showCloseButton?: boolean,
}

type StateTypes = {
  text: string,
}

export default class ContextOnHighlight extends React.Component<PropTypes, StateTypes> {
  static defaultProps = {
    children: null,
    contextClassName: '',
    contextMenu: (highlightedText: string) => {},
    onHighlight: (highlightedText: string) => {},
    showContextMenu: false,
    showCloseButton: true,
  }

  container: ?HTMLDivElement
  contextMenu: ?HTMLDivElement

  state = {
    text: '',
  }

  eventHandlers = []

  componentDidMount() {
    const { showContextMenu, contextMenu } = this.props
    let $contextMenu = $()
    if (showContextMenu && contextMenu) {
      $contextMenu = $(this.contextMenu)
      this.eventHandlers.push($contextMenu.on('mouseup', () => $contextMenu.fadeOut(200)))
    }
    this.eventHandlers.push(
      $(this.container).on('mouseup', e => {
        const [left, top] = [e.offsetX, e.offsetY]
        const text = getSelected()
        if (text) {
          $contextMenu
            .css({
              left,
              top,
            })
            .fadeIn(200)
          this.setState({ text })
          this.props.onHighlight(text)
        } else {
          $contextMenu.fadeOut(200)
        }
      })
    )
  }

  componentWillUnmount() {
    for (const handler of this.eventHandlers) {
      handler.off()
    }
  }

  render() {
    const { showContextMenu, contextMenu, contextClassName, showCloseButton, children } = this.props
    return (
      <div>
        {showContextMenu &&
          contextMenu && (
            <div
              className={`context-menu ${contextClassName}`}
              ref={ref => (this.contextMenu = ref)}
            >
              {showCloseButton && (
                <button className="btn btn-round-xs btn-danger close-btn">
                  <SvgIcon icon="Close" size={0.5} color="#ffffff" hideLabel />
                </button>
              )}
              {contextMenu(this.state.text)}
            </div>
          )}

        <div ref={ref => (this.container = ref)}>{children}</div>
      </div>
    )
  }
}
