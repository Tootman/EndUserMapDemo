  "use strict";
  //

  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuc2ltbW9ucyIsImEiOiJjamRsc2NieTEwYmxnMnhsN3J5a3FoZ3F1In0.m0ct-AGSmSX2zaCMbXl0-w';

  const state = {}
  state.settings = {}
  state.settings.maps = {}
  state.settings.maps.richmondBorough = {
    url: 'mapbox://styles/dansimmons/cjqusg2fq1jp62srv0zdgz6c5',
    name: 'Richmond Borough parks',
    center: {
      lat: 51.443858500160644,
      lng: -0.3215425160765335
    }
  }
  state.settings.maps.hounslowBorough = {
    url: 'mapbox://styles/dansimmons/cjrrodbqq01us2slmro016y8b',
    name: 'Richmond Borough parks',
    center: {
      lat: 51.44156782214026,
      lng: -0.4432747195056663
    }
  }
  state.currentMapId = {}

  const armIsStyleLoaded = () => {
    if (map.isStyleLoaded()) {
      console.log("finally loaded")
      const mapID = state.settings.currentMapId
      map.setCenter(state.settings.maps[mapID].center)
      map.off('data', armIsStyleLoaded)
    }
  }


  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dansimmons/cjqusg2fq1jp62srv0zdgz6c5', // contains all layers with data - Richmond
    //style: 'mapbox://styles/dansimmons/cjrrodbqq01us2slmro016y8b', //hounslow
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
    'lines-wall',
    'lines-fence',
    'lines-fence-over-wall',
    'lines-path',
    'lines-all-other'
  ] // replace this with the name of the layer

  let allLayers = lineLayers
  allLayers.push('points-symbol')
  lineLayers.map(layer => {
    map.on('mouseenter', layer, e => {
      map.getCanvas().style.cursor = 'cell';
    })
    map.on('mouseleave', layer, () => {
      map.getCanvas().style.cursor = '';
    });
  })

  const selectNewMap = (mapID) => {
    map.setStyle(state.settings.maps[mapID].url)
    state.settings.currentMapId = mapID // fudge - come back to
    map.on('data', armIsStyleLoaded)

  }

  map.on('mouseenter', "points-symbol", e => {
    map.getCanvas().style.cursor = 'cell';
  })
  map.on('mouseleave', "points-symbol", () => {
    map.getCanvas().style.cursor = '';

  });

  // init App
  const fireBaseconfig = {
    apiKey: "AIzaSyB977vJdWTGA-JJ03xotQkeu8X4_Ds_BLQ",
    authDomain: "fir-realtime-db-24299.firebaseapp.com",
    databaseURL: "https://fir-realtime-db-24299.firebaseio.com",
    projectId: "fir-realtime-db-24299",
    storageBucket: "fir-realtime-db-24299.appspot.com",
    messagingSenderId: "546067641349"
  };
  firebase.initializeApp(fireBaseconfig);
  armIsStyleLoaded();

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
    const popupContent = `<h4>${popupTitle}</h4>${propSet(feature)}`
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
      layers: ['points-symbol']
    })
    //console.log(features)
  });

  map.on('zoom', () => {
    // console.log("mapZoom:", map.getZoom())
  });
