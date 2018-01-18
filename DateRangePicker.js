// @flow
import React from 'react'
import moment from 'moment'
import DRP from 'react-16-daterange-picker'

type PropTypes = {
  hideCustomSelectors: boolean,
  onChange: Function,
  quickRanges: Array<Object>,
  selectionType: string,
  start: string,
  end: string,
}

const DateRangePicker = ({
  hideCustomSelectors = false,
  selectionType = 'range',
  start = '2014-01-01',
  end = '2017-04-01',
  onChange,
  quickRanges = [
    {
      name: '3d',
      range: moment.range(moment().subtract(3, 'days'), moment()),
    },
    {
      name: '1m',
      range: moment.range(moment().subtract(1, 'months'), moment()),
    },
    {
      name: '3m',
      range: moment.range(moment().subtract(3, 'months'), moment()),
    },
    {
      name: '1y',
      range: moment.range(moment().subtract(1, 'years'), moment()),
    },
  ],
}: PropTypes) => {
  const queryRange = moment.range(start, end) // because datepicker needs a moment range

  return (
    <div className="form-group">
      <div>
        <DRP
          firstOfWeek={1}
          numberOfCalendars={1}
          selectionType={selectionType}
          value={selectionType === 'range' ? queryRange : moment(start)}
          onSelect={onChange}
        />
      </div>
      {selectionType === 'range' &&
        !hideCustomSelectors && (
          <div>
            <div className="date-picker-control">
              {quickRanges.map(qr => (
                <button
                  key={qr.name}
                  className={
                    qr.range.isSame(queryRange) ? 'btn btn-default active' : 'btn btn-default'
                  }
                  onClick={() => onChange(qr.range)}
                >
                  {qr.name}
                </button>
              ))}
            </div>
            <div className="custom-daterange">
              <div className="start">
                <div className="form-group form-group-date">
                  <div className="input-group">
                    <div className="input-group-addon">start</div>
                    <input
                      className="form-control"
                      onChange={e => onChange(moment.range(e.target.value, end))}
                      value={start}
                    />
                  </div>
                </div>
              </div>
              <div className="end">
                <div className="form-group form-group-date">
                  <div className="input-group">
                    <div className="input-group-addon">end</div>
                    <input
                      className="form-control"
                      onChange={e => onChange(moment.range(start, e.target.value))}
                      value={end}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default DateRangePicker
