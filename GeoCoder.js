// @flow
import { Meteor } from 'meteor/meteor'
import * as React from 'react'
import _ from 'underscore'
import toastr from 'toastr'
import SvgIcon from '/imports/epi-ui/SvgIcon'
import { Modal, Map } from '/imports/epi-ui'

type PropTypes = {
  classNames: Object,
  currentSource: Object,
  enableMapSearch: boolean,
  geoSources: Array<Object>,
  mapSelection?: Object,
  maxTags?: number,
  multiSource: boolean,
  onChange: Function,
  placeholder: string,
  selected: Array<Object>,
  taggable: boolean,
}
type StateTypes = {
  currentSource: Object,
  mapCoordinates: Array<number>,
  mapModal: boolean,
  mapSelection: Object,
  options: Array<*>,
  searchInput: string,
  selected: Array<Object>,
  tags: Array<Object>,
  values: Array<Object>,
}

type GeocoderPlaceType = {
  description: string,
  geo_geonameid: string,
  place_country: string,
  place_id: string,
  place_lat: string,
  place_lng: string,
  place_name: string,
  place_placename?: string,
  place_state: string,
}

type CoordinateType = [number, number]

type PlaceType = {
  address?: Object,
  coord?: Array<Array<string>>,
  country?: string,
  description: string,
  display_name?: string,
  formatted_address?: string,
  geo_geonameid?: string,
  geometry?: Object,
  geonameid?: string,
  lat?: string,
  lon?: string,
  name?: string,
  osm_id?: string,
  place_country?: string,
  place_id?: string,
  place_lat?: string,
  place_lng?: string,
  place_name?: string,
  place_state?: string,
  state?: string,
}

const googleGeoSource = {
  title: 'Google',
  epioneGeoLocationMethod: 'epione.getGoogleGeoLocations',
  epioneGeoCodeMethod: 'epione.getGoogleGeoCode',
  epioneReverseGeoCodeMethod: 'epione.getGoogleReverseGeoCode',
}
const OSMGeoSource = {
  title: 'OpenStreetMap',
  epioneGeoLocationMethod: 'epione.getOSMGeoLocations',
  epioneReverseGeoCodeMethod: 'epione.getOSMReverseGeoCode',
}

const epioneGeoSource = {
  title: 'Epidemico',
  epioneGeoLocationMethod: 'epione.getEpidemicoGeoLocations',
  epioneReverseGeoCodeMethod: 'epione.getEpidemicoReverseGeoCode',
}

export const mapEpiPlaceToGeoCoder = (place: PlaceType): GeocoderPlaceType => ({
  ...place,
  place_id: place.place_id || place.geo_geonameid || place.osm_id || Meteor.uuid(),
  description:
    place.description || place.place_name || place.formatted_address || place.display_name,
  geo_geonameid: place.place_id || place.geo_geonameid || place.geonameid || place.osm_id,
  place_country:
    place.place_country || place.country || (place.address && place.address.country) || '',
  place_lat:
    (place.coord && place.coord[0][0]) ||
    (place.geometry && place.geometry.location.lat) ||
    place.lat ||
    '',
  place_lng:
    (place.coord && place.coord[0][1]) ||
    (place.geometry && place.geometry.location.lng) ||
    place.lon ||
    '',
  place_name: place.place_name || place.name || '',
  place_state: place.place_state || place.state || '',
})

export const mapGeoCoderToEpi = ({
  description,
  geo_geonameid,
  place_country,
  place_id,
  place_lat,
  place_lng,
  place_name,
  place_placename,
  place_state,
}: GeocoderPlaceType) =>
  _.pick(
    {
      geo_geonameid,
      place_country,
      place_id,
      place_lat,
      place_lng,
      place_name: description || place_name,
      place_placename,
      place_state,
    },
    _.identity
  )

export default class GeoCoder extends React.Component<PropTypes, StateTypes> {
  static mapEpiPlaceToGeoCoder = mapEpiPlaceToGeoCoder
  static mapGeoCoderToEpi = mapGeoCoderToEpi

  static defaultProps = {
    classNames: {
      input: '',
      inputWrapper: '', // 'form-field form-field--condensed',
    },
    selected: [],
    enableMapSearch: false,
    multiSource: false,
    taggable: true,
    geoSources: [googleGeoSource, OSMGeoSource, epioneGeoSource],
    placeholder: 'Type a location...',
  }

  state = {
    currentSource: googleGeoSource,
    mapCoordinates: [0, 0],
    mapModal: false,
    mapSelection: {},
    options: [],
    searchInput: '',
    selected: [],
    tags: [],
    values: [],
  }

  handleChange: Function

  constructor(props: PropTypes) {
    super(props)
    this.handleChange = _.debounce(this._handleChange, 500)
  }

  componentDidMount() {
    this.updateIfGivenSelected(this.props)
  }

  componentWillReceiveProps(nextProps: PropTypes) {
    this.updateIfGivenSelected(nextProps)
    const currentSource = this.props.currentSource
    if (currentSource) this.setState({ currentSource })
  }

  updateIfGivenSelected(props: PropTypes) {
    const { selected } = props
    if (selected) {
      Object.assign(this.state, { selected })
      this.updateUIObject()
    }
  }

  _handleChange = (queryString: string) => {
    Meteor.call(this.state.currentSource.epioneGeoLocationMethod, queryString, (error, values) => {
      if (error)
        return toastr.error(
          `An error occurred fetching "${this.state.currentSource.title}" geolocations.`
        )
      this.setState(
        () => ({
          values: _.uniq(values.map(mapEpiPlaceToGeoCoder), function(item) {
            return item.place_id
          }),
        }),
        () => this.updateUIObject()
      )
    })
  }

  handleSearchInputChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    this.setState({ searchInput: value })
    this.handleChange(value)
  }

  handleDelete(selection: PlaceType, event: SyntheticEvent<HTMLDivElement>) {
    if (selection) {
      const selected = this.state.selected
      const selectionItem = _.findWhere(selected, { place_id: selection.place_id })
      const keyIndex = selected.indexOf(selectionItem)
      if (keyIndex > -1) {
        selected.splice(keyIndex, 1)
      }

      this.setState(
        () => ({ selected }),
        () => {
          this.props.onChange(this.state.selected)
          this.updateUIObject()
        }
      )
    }
  }

  _modalBody() {
    const modalDom = {
      title: `Search for a location`,
      dom: (
        <div>
          <GeoCoder
            currentSource={this.state.currentSource}
            multiSource={true}
            enableMapSearch={false}
            taggable={false}
            onChange={this._modalGeoCoderSelection}
          />
          <Map center={this.state.mapCoordinates} onAddMarker={this._onModalGeoCoderMarker} />
        </div>
      ),
    }
    return modalDom
  }

  _modalGeoCoderSelection = (selection: GeocoderPlaceType) => {
    const mapCoordinates = [+selection.place_lng, +selection.place_lat]
    this.setState(() => ({ mapCoordinates }), () => this.updateUIObject())
  }

  _onModalGeoCoderMarker = (coordinates: CoordinateType) => {
    Meteor.call(
      this.state.currentSource.epioneReverseGeoCodeMethod,
      coordinates,
      (error, values) => {
        if (error)
          return toastr.error(
            `An error occurred fetching "${this.state.currentSource.title}" geolocations.`
          )
        const { selected } = this.state
        let { mapSelection } = this.state
        var value = values.constructor === Array ? values[0] : values
        if (value) {
          if (mapSelection) selected.pop()
          mapSelection = mapEpiPlaceToGeoCoder(value)
          selected.push(mapSelection)
        }
        this.setState(() => ({ selected, mapSelection }), () => this.updateUIObject())
      }
    )
  }

  _closeModal() {
    this.setState(() => ({
      mapModal: false,
      searchInput: '',
    }))
  }

  _handleMapSubmit() {
    this.setState(() => ({
      mapModal: false,
      searchInput: '',
    }))
  }

  handleOpenMapClick = () => {
    this.setState(
      () => ({
        mapModal: true,
        searchInput: '',
      }),
      () => this.updateUIObject()
    )
  }

  handleChangeSource(value: Object) {
    this.setState(
      () => ({ currentSource: value }),
      () => {
        this.handleChange(this.state.searchInput)
        this.updateUIObject()
      }
    )
  }

  handleClick(value: PlaceType, event: SyntheticEvent<HTMLLIElement>) {
    if (value) {
      const { selected } = this.state
      selected.push(value)
      this.state.selected = selected
      this.state.values = []
      this.setState(() => ({ searchInput: '' }), () => this.updateUIObject())
      if (this.state.currentSource.epioneGeoCodeMethod) {
        Meteor.call(
          this.state.currentSource.epioneGeoCodeMethod,
          value.place_id,
          (error, result) => {
            if (error)
              return toastr.error(
                `An error occurred fetching "${this.state.currentSource.title}" geolocations.`
              )
            const selection = _.findWhere(this.state.selected, { place_id: result.place_id })
            const keyIndex = selected.indexOf(selection)
            try {
              this.state.selected[keyIndex].place_lat = result.geometry.location.lat
              this.state.selected[keyIndex].place_lng = result.geometry.location.lng
            } catch (e) {
              // No geometry available
            }
            if (!this.props.taggable) this.props.onChange(this.state.selected[keyIndex])
            else this.props.onChange(this.state.selected)
          }
        )
      } else {
        if (!this.props.taggable) this.props.onChange(selected)
        else this.props.onChange(this.state.selected)
      }
    }
  }

  updateUIObject() {
    const tags = []
    const options = []
    for (let place of this.state.selected) {
      tags.push(
        <li key={place.place_id} className="tag">
          <div className="is-highlight">{place.description}</div>
          <div className="is-highlight tag-close" onClick={this.handleDelete.bind(this, place)}>
            <SvgIcon icon="Close" size={0.5} hideLabel />
          </div>
        </li>
      )
    }
    if (this.state.searchInput.length > 0) {
      const geoSources = []
      if (this.props.multiSource) {
        for (let geoSource of this.props.geoSources) {
          geoSources.push(
            <li
              key={geoSource.title}
              onClick={this.handleChangeSource.bind(this, geoSource)}
              className={
                this.state.currentSource == geoSource
                  ? 'btn btn-sm btn-primary-dark'
                  : 'btn btn-sm btn-gray'
              }
            >
              {geoSource.title}
            </li>
          )
        }
        options.push(
          <li key="geo-sources-option">
            <ul className="list-unstyled btn-list--buttonbar">{geoSources}</ul>
          </li>
        )
      }

      for (let place of this.state.values) {
        if (!_.findWhere(this.state.selected, place)) {
          options.push(
            <li key={place.place_id} onClick={this.handleClick.bind(this, place)}>
              <span>{place.description}</span>
            </li>
          )
        }
      }

      if (this.props.enableMapSearch) {
        options.push(
          <li className="find-on-map" key="enable-map-serach">
            <span>
              <button className="btn btn-secondary" onClick={this.handleOpenMapClick} type="button">
                Search on Map
              </button>
            </span>
          </li>
        )
      }
    }
    this.setState(() => ({ tags, options }))
  }

  render() {
    const { classNames, maxTags, taggable, placeholder } = this.props
    const { tags, searchInput, options, mapModal } = this.state
    return (
      <div className="geocoder">
        <Modal
          modalTitle="Search for a location"
          active={mapModal}
          onCancel={() => this._closeModal()}
          showFooter={true}
          onSubmit={() => this._handleMapSubmit()}
          centerContent={true}
          fullScreen={true}
          body={this._modalBody()}
          submitTitle="Set location"
        />
        <div className="geocoder-search">
          <input
            type="text"
            disabled={maxTags ? tags.length >= maxTags : false}
            value={searchInput}
            onChange={this.handleSearchInputChange}
            list="data"
            autoComplete="off"
            className={classNames.input}
            placeholder={placeholder}
          />
          <ul
            className="keys-list"
            style={
              {
                //borderBottom: 'none',
                //position: 'relative',
              }
            }
          >
            {options}
          </ul>
          {taggable && <ul className="tag-group-list">{tags}</ul>}
        </div>
      </div>
    )
  }
}
