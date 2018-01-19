import * as React from 'react'
import { render } from 'react-dom'

import style from './style.css'
import EpiUI, { demodata } from '../../src'

const hasDemoData = Object.keys(demodata).sort()

const EpiUIBrowser = () => (
  <div className="demo">
    <h2>Epi-UI Browser</h2>
    <ul className="tag-group-list" style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
      {hasDemoData.map(key => (
        <li className="tag" key={key}>
          <a href={`#${key}`}>{key}</a>
        </li>
      ))}
      <li className="tag" key="svgicons">
        <a href="#svgicons">
          <span className="tag-label">SVG Icons</span>
        </a>
      </li>
    </ul>
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
          <ul className="list-unstyled list--grid">
            {Object.keys(EpiUI.icons).map(key => (
              <li key={key}>
                <div className="btn btn--disabled btn-round">
                  <EpiUI.SvgIcon icon={key} size={0.9} label={key} hideLabel />
                </div>
                <label>{key}</label>
              </li>
            ))}
          </ul>
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
