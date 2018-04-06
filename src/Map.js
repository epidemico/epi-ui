// @flow
import React, { Component } from 'react'
import ol from 'openlayers'

import stlyes from './styles/Map.css'

type PropTypes = {
  center: Array<number>,
  className: string,
  mapInstance?: Function,
  mapOverlay?: Function,
  mapViewInstance?: Function,
  mouseWheelZoom: boolean,
  onAddMarker?: Function,
  zoom: number,
}

type StateTypes = {
  map?: Function,
  view?: Function,
}

export default class Map extends Component<PropTypes, StateTypes> {
  // Must keep this synced with PropTypes above manually:
  static flowTypes = `{
  center: Array<number>,
  className: string,
  mapInstance?: Function,
  mapOverlay?: Function,
  mapViewInstance?: Function,
  mouseWheelZoom: boolean,
  onAddMarker?: Function,
  zoom: number,
}`

  static defaultProps = {
    center: [-13.641363, 15.514747],
    className: 'map',
    mouseWheelZoom: false,
    zoom: 3,
  }

  state = {}

  componentDidMount() {
    const { center, zoom, className, mapInstance, mapViewInstance, mapOverlay, mouseWheelZoom, onAddMarker } = this.props

    let popupsDOM = {
      container: document.getElementById('popup'),
      content: document.getElementById('popup-content'),
      closer: document.getElementById('popup-closer'),
    }
    if (popupsDOM.closer) {
      popupsDOM.closer.onclick = function() {
        overlay.setPosition(undefined)
        popupsDOM.closer && popupsDOM.closer.blur()
        return false
      }
    }

    let overlay = new ol.Overlay({
      element: popupsDOM.container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    })

    let baseLayer = new ol.layer.Tile({ source: new ol.source.OSM() })
    let vectorSource = new ol.source.Vector({})
    let vector = new ol.layer.Vector({ source: vectorSource })

    var reprojectedCenter = ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857')

    let view = new ol.View({ center: reprojectedCenter, zoom: zoom })

    let map = new ol.Map({
      layers: [baseLayer, vector],
      interactions: ol.interaction.defaults({
        mouseWheelZoom: (function() {
          if (!mouseWheelZoom) return false
          return true
        })(),
      }),
      target: className,
      view: view,
    })

    if (onAddMarker) {
      var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(
          /** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 35],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            //There is an issue with the current version (4.4.2) of openlayers3 css that prevents us of using svg
            src: '/img/marker.png',
          })
        ),
      })

      map.on('click', function(evt) {
        vectorSource.clear()
        const feature = new ol.Feature(new ol.geom.Point(evt.coordinate))
        feature.setStyle(iconStyle)
        vectorSource.addFeature(feature)
        onAddMarker(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'))
      })
    }

    this.setState({ map, view })

    if (mapInstance) {
      mapInstance(map)
    }

    if (mapViewInstance && overlay) {
      mapViewInstance(view, overlay, popupsDOM)
    }

    if (overlay && mapOverlay) {
      mapOverlay(overlay, popupsDOM)
    }
  }

  render() {
    const { className, center } = this.props

    if (this.state.map && this.state.view) {
      this.state.view.setCenter(ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857'))
    }

    return (
      <div id={className} className={className}>
        <div id="popup" className="ol-popup">
          <a href="#" id="popup-closer" className="ol-popup-closer" />
          <div id="popup-content" />
        </div>
      </div>
    )
  }
}
