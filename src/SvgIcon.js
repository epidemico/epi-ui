// @flow
import React from 'react'
import icons from './icons'

type PropTypes = {
  color?: string,
  hideLabel?: boolean,
  icon: string,
  label?: string,
  prependLabel?: boolean,
  rotate?: number,
  size?: number,
  stacked?: boolean,
  t?: Function,
}

const SvgIcon = ({
  label,
  icon,
  rotate,
  prependLabel = false,
  hideLabel = false,
  stacked = false,
  size = 1,
  color,
  t = (translatable: string) => translatable,
}: PropTypes) => {
  const text = t(label || icon)
  return (
    <div className="svg-icon">
      <div className={`icon-label-wrapper ${stacked ? 'stacked' : ''}`}>
        {!hideLabel && prependLabel && <label>{text}</label>}
        <svg
          width={`${size}rem`}
          height={`${size}rem`}
          viewBox="0 0 1024 1024"
          className={rotate ? `rotate${rotate}` : ''}
          role="img"
          alt={text}
          aria-hidden={!hideLabel}
          style={{ width: size + 'rem', height: size + 'rem' }}
        >
          <g>
            {hideLabel && <title>{text}</title>}
            <path d={icons[icon]} fill={color} />
          </g>
        </svg>
        {!hideLabel && !prependLabel && <label>{text}</label>}
      </div>
    </div>
  )
}

// Must keep this synced with PropTypes above manually:
SvgIcon.flowTypes = `{
  color?: string,
  hideLabel?: boolean,
  icon: string,
  label?: string,
  prependLabel?: boolean,
  rotate?: number,
  size?: number,
  stacked?: boolean,
  t?: Function,
}`

export default SvgIcon
