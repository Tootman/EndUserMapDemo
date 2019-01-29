  "use strict";
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuc2ltbW9ucyIsImEiOiJjamRsc2NieTEwYmxnMnhsN3J5a3FoZ3F1In0.m0ct-AGSmSX2zaCMbXl0-w';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dansimmons/cjqusg2fq1jp62srv0zdgz6c5',
    center: [-0.3057026311378195, 51.45959256841422],
    zoom: 12,
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

  let lineLayers = [
    'lines- walls',
    'lines - fences',
    'fence over wall',
    'lines - paths',
    'lines - all other'
  ] // replace this with the name of the layer

  let allLayers = lineLayers
  allLayers.push('richmondpointsall')
  allLayers.push('richmondpolygonsall-74pg99')
  //allLayers.push('archive-polygons-cb5y86')
  lineLayers.map(layer => {
    map.on('mouseenter', layer, e => {
      map.getCanvas().style.cursor = 'cell';
    })
    map.on('mouseleave', layer, () => {
      map.getCanvas().style.cursor = '';
    });
  })

  map.on('mouseenter', "richmondpointsall", e => {
    map.getCanvas().style.cursor = 'cell';
  })
  map.on('mouseleave', "richmondpointsall", () => {
    map.getCanvas().style.cursor = '';
  });



  map.on('click', e => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: allLayers
    });

    if (!features.length) {
      return;
    }

    const feature = features[0];
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
    const popup = new mapboxgl.Popup({
        offset: [0, -15]
      })
      .setLngLat(e.lngLat)
      .setHTML(popupContent)
      .addTo(map);
  });

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
