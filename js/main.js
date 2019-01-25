"use strict";

// mouse over popups - not working
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuc2ltbW9ucyIsImEiOiJjamRsc2NieTEwYmxnMnhsN3J5a3FoZ3F1In0.m0ct-AGSmSX2zaCMbXl0-w';
var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/dansimmons/cjqusg2fq1jp62srv0zdgz6c5',
  center: [-0.3057026311378195, 51.46064256841422],
  zoom: 17,
  maxZoom: 22,
  minZoom: 11,
  sprite: "mapbox://sprites/mapbox/bright-v8" //
});
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}));


function showPopup(e) {
  console.log("showpopup!")
  const feature = e.features[0];
  const propSet = f => {
    return Object.keys(f.properties)
      .map(item => {
        return `${item}: ${f.properties[item]}`;
      })
      .join("<br>");
  };
  const p = feature.properties
  const popupTitle = p.ASSET || p.Asset || p.asset
  const popupContent = `<h3>${popupTitle}</h3>${propSet(feature)}`

  let coords = null
  if (e.features[0].geometry.type == "Point") {
    coords = e.features[0].geometry.coordinates
  } else {
    coords = e.lngLat
  }
  popup = new mapboxgl.Popup({
      offset: [0, -15]
    })
    //.setLngLat(e.lngLat)
    .setLngLat(coords)
    .setHTML(popupContent)
    .addTo(map);
};


map.on('mouseenter', 'richmondpolygonsall-2v4029', showPopup);
map.on('mouseleave', 'richmondpolygonsall-2v4029', hidePopup);

map.on('mouseenter', 'lines- walls', showPopup);
map.on('mouseleave', 'lines- walls', hidePopup);

map.on('mouseenter', 'richmondpointsall', showPopup);
map.on('mouseleave', 'richmondpointsall', hidePopup);



function hidePopup() {
  map.getCanvas().style.cursor = '';
  popup.remove();
  console.log("HIDE popup!")
}

// https://www.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/
map.on('moveend', () => {
  const features = map.queryRenderedFeatures({
    layers: ['richmondpointsall']
  })
  //console.log(features)

});

map.on('zoom', () => {
  // console.log("mapZoom:", map.getZoom())
});