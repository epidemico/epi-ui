import * as React from 'react'
import { render } from 'react-dom'

import style from './style.css'
import EpiUI, { demodata } from '../../src'
import { version } from '../../package.json'

const hasDemoData = Object.keys(demodata).sort()
const title = 'Epi-UI Browser'

if (document) {
  document.title = title
}

class ModalWrapper extends React.Component<{}, { active: boolean }> {
  state = { active: false }
  toggle = () => {
    this.setState(state => ({ active: !state.active }))
  }
  render() {
    return (
      <div>
        <button type="button" className="btn btn-secondary" onClick={this.toggle}>
          Toggle Modal
        </button>
        <EpiUI.Modal {...demodata.Modal} active={this.state.active} onSubmit={this.toggle} onCancel={this.toggle} />
      </div>
    )
  }
}

const EpiUIBrowser = () => (
  <div>
    <div className="demo-header">
      <h1>{title}</h1>
      <p>
        React components for data visualization. Available on{' '}
        <a href="https://github.com/epidemico/epi-ui" target="_blank" rel="noopener">
          GitHub
        </a>. Made with ❤️ by{' '}
        <a href="https://www.epidemico.com" target="_blank" rel="noopener">
          Epidemico
        </a>.
      </p>
      <p>
        {hasDemoData.concat('SVG Icons').map(key => (
          <button type="button" key={key}>
            <a href={`#${key}`}>{key}</a>
          </button>
        ))}
      </p>
      <hr /> <br />
    </div>
    <div className="demo-body">
      {hasDemoData.map(key => {
        // Render each epi-ui component and display info on each.
        const component = EpiUI[key]
        const props = demodata[key]
        const element = React.createElement(component, props)
        const defaultProps = JSON.stringify(component.getDefaultProps ? component.getDefaultProps() : component.defaultProps, null, '  ')
        const flowTypes = component.flowTypes
        const sampleProps =
          key === 'Modal'
            ? `{
  body: {
    title: (
      <div>
        Epi-UI <strong>Modal</strong>
      </div>
    ),
    dom: (
      <div>
        <code>&lt;Modal&gt;</code> supports <strong>HTML / JSX</strong>!
      </div>
    ),
  },
  active: false,
  showFooter: true,
  centerContent: false,
  onCancel: () => log('Modal cancelled!'),
  onSubmit: () => log('Modal submitted!'),
  onNext: (currentStep: number) => log(currentStep),
  onPrev: (currentStep: number) => log(currentStep),
  submitTitle: 'OK',
}`
            : JSON.stringify(props, null, '  ')

        return (
          <div key={key}>
            <a name={key} />

            <div className="row">
              <div className="col col-50p">
                <h2>
                  <strong>{key}</strong>
                </h2>
                <div className="col col-50p">
                  <h3>Prop Flowtypes</h3>
                  <pre>{flowTypes}</pre>
                  <h3>Default Props</h3>
                  <pre>{defaultProps}</pre>
                </div>
                <div className="col col-50p">
                  <h3>Sample props</h3>
                  <pre>{sampleProps}</pre>
                </div>
              </div>
              <div className="col col-50p">
                <h3 style={{ marginTop: '3rem' }}>Output</h3>
                {key === 'Modal' ? <ModalWrapper>{element}</ModalWrapper> : element}
              </div>
            </div>

            <hr className="componentseparator" />
          </div>
        )
      })}
      <div>
        <a name="SVG Icons" />
        <div className="row">
          <div className="col col-50p">
            <h2>Prop Types</h2>
            <pre>
              [<br />
              "icon" (required)<br />
              "size" (optional)<br />
              "label" (optional)<br />
              "prependLabel" (optional)<br />
              "hideLabel" (optional)<br />
              "color" (optional)<br />
              "rotate" (optional)<br />
              "stacked" (optional)<br />
              ]
            </pre>
            <h2>Default Props</h2>
            <pre>
              [<br />
              icon: Arrow<br />
              size: {0.8} (default is {1}, value interpreted in REM units)<br />
              label: 'More' (default is name of icon, appears as alt text and in &lt;label&gt;&lt;/label&gt; tags after icon)<br />
              prependLabel: false (set to true if you want the label to appear BEFORE the icon)<br />
              hideLabel: false (set to true if you don't want the label to appear)<br />
              stacked: false (set to true if you want to stack the icon and label on top of eachother)<br />
              color: '#ffffff' (default is black)<br />
              rotate: {-90} (default is no rotation, values are {-90}, {90}, {180})<br />
              ]
            </pre>
          </div>
          <div className="col col-50p">
            <h4>SVG Icons</h4>
            <p>
              <code>
                &lt;SvgIcon icon=&#123;<i>NAME</i>&#125; size=&#123;1&#125; label="Label" /&gt;
              </code>
            </p>
            {Object.keys(EpiUI.icons).map(key => (
              <div key={key} className="icon-btn-wrapper">
                <div className="icon-btn">
                  <EpiUI.SvgIcon icon={key} size={0.9} label={key} hideLabel />
                </div>
                <label>{key}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <a href="https://github.com/epidemico/epi-ui" target="_blank" rel="noopener">
        <img
          className="github"
          src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67"
          alt="Fork me on GitHub"
          data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"
        />
      </a>
      <small className="version">v{version}</small>
    </div>
  </div>
)

render(<EpiUIBrowser />, document.querySelector('#demo'))
