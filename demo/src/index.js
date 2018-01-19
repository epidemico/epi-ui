import * as React from 'react'
import { render } from 'react-dom'

import style from './style.css'
import EpiUI, { demodata } from '../../src'

const hasDemoData = Object.keys(demodata).sort()
const title = 'Epi-UI Browser'

if (document) {
  document.title = title
}

const EpiUIBrowser = () => (
  <div className="demo">
    <h2>{title}</h2>
    <p>
      React components for data visualization. Available on{' '}
      <a href="https://github.com/epidemico/epi-ui" target="_blank" rel="noopener">
        GitHub
      </a>. Made with ❤️ by{' '}
      <a href="https://www.epidemico.com" target="_blank" rel="noopener">
        Epidemico
      </a>.
    </p>
    <a href="https://github.com/epidemico/epi-ui" target="_blank" rel="noopener">
      <img
        className="github"
        src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67"
        alt="Fork me on GitHub"
        data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"
      />
    </a>
    {hasDemoData.map(key => (
      <button type="button" key={key}>
        <a href={`#${key}`}>{key}</a>
      </button>
    ))}
    <button className="tag">
      <a href="#svgicons">
        <span className="tag-label">SVG Icons</span>
      </a>
    </button>
    <br /> <hr /> <br />
    {hasDemoData.map(key => {
      // Render each epi-ui component and display info on each.
      const component = EpiUI[key]
      const props = demodata[key]
      const element = React.createElement(component, props)
      const defaultProps = JSON.stringify(
        component.getDefaultProps ? component.getDefaultProps() : component.defaultProps,
        null,
        '  '
      )
      const propTypes = JSON.stringify(Object.keys(component.propTypes || {}), null, '  ')

      return (
        <div key={key}>
          <a name={key} />

          <div className="row">
            <div className="col col-50p">
              <h4>{key}</h4>
              {element}
            </div>
            <div className="col col-50p">
              <h2 className="panel-title">Prop Types</h2>
              <pre className="panel-heading">{propTypes}</pre>
              <h2 className="panel-title">Default Props</h2>
              <pre className="panel-heading">{defaultProps}</pre>
            </div>
          </div>

          <hr className="componentseparator" />
        </div>
      )
    })}
    <div>
      <a name="svgicons" />
      <div className="row">
        <div className="col col-50p">
          <h4>SVG Icons</h4>
          <p>
            <code>
              &lt;SvgIcon icon=&#123;<i>NAME</i>&#125; size=&#123;1&#125; label="Label" /&gt;
            </code>
          </p>
          {Object.keys(EpiUI.icons).map(key => (
            <button key={key}>
              <div className="btn btn--disabled btn-round">
                <EpiUI.SvgIcon icon={key} size={0.9} label={key} hideLabel />
              </div>
              <label>{key}</label>
            </button>
          ))}
        </div>
        <div className="col col-50p">
          <h2 className="panel-title">Prop Types</h2>
          <pre className="panel-heading">
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
          <h2 className="panel-title">Default Props</h2>
          <pre className="panel-heading">
            [<br />
            icon: Arrow<br />
            size: {0.8} (default is {1}, value interpreted in REM units)<br />
            label: 'More' (default is name of icon, appears as alt text and in
            &lt;label&gt;&lt;/label&gt; tags after icon)<br />
            prependLabel: false (set to true if you want the label to appear BEFORE the icon)<br />
            hideLabel: false (set to true if you don't want the label to appear)<br />
            stacked: false (set to true if you want to stack the icon and label on top of eachother)<br />
            color: '#ffffff' (default is black)<br />
            rotate: {-90} (default is no rotation, values are {-90}, {90}, {180})<br />
            ]
          </pre>
        </div>
      </div>
    </div>
  </div>
)

render(<EpiUIBrowser />, document.querySelector('#demo'))
