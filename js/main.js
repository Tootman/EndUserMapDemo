  "use strict";
  //

  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuc2ltbW9ucyIsImEiOiJjamRsc2NieTEwYmxnMnhsN3J5a3FoZ3F1In0.m0ct-AGSmSX2zaCMbXl0-w';
  alert("End User Map v 0.9.009")
  const state = {}
  state.settings = {}
  state.settings.maps = {}
  state.settings.maps.richmondBorough = {
    url: 'mapbox://styles/dansimmons/cjqusg2fq1jp62srv0zdgz6c5',
    mapName: 'Richmond Borough parks',
    center: {
      lat: 51.443858500160644,
      lng: -0.3215425160765335
    },
    hasRelatedData: false,
  }
  state.settings.maps.hounslowBorough = {
    url: 'mapbox://styles/dansimmons/cjrrodbqq01us2slmro016y8b',
    mapName: 'Hounslow Borough parks',
    center: {
      lat: 51.44156782214026,
      lng: -0.4432747195056663
    },
    firebaseMapId: '-LR7CewcYJ2ZUDgCJSK8',
    hasRelatedData: true,
  }
  state.settings.currentMapId = 'richmondBorough'

  const armIsStyleLoaded = () => {
    if (map.isStyleLoaded()) {
      map.off('data', armIsStyleLoaded)
      console.log("finally loaded")
      const mapID = state.settings.currentMapId
      map.setCenter(state.settings.maps[mapID].center)
      map.setZoom(11)
      document.getElementById('map-name').innerHTML = state.settings.maps[mapID].mapName
    }
  }

  const map = new mapboxgl.Map({
    container: 'map',
    style: (state.settings.maps[state.settings.currentMapId].url), // contains all layers with data - Richmond
    //style: 'mapbox://styles/dansimmons/cjrrodbqq01us2slmro016y8b', //hounslow
    center: (state.settings.maps[state.settings.currentMapId].center),
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
    document.getElementById("navbarToggler").classList.remove("show")
  }

  map.on('mouseenter', "points-symbol", e => {
    map.getCanvas().style.cursor = 'cell';
  })
  map.on('mouseleave', "points-symbol", () => {
    map.getCanvas().style.cursor = '';

  });

  const fetchLastFirebaseRelatedData = obId => {
    const path = `/App/Maps/${state.settings.maps[state.settings.currentMapId].firebaseMapId}/Related/${obId}`
    fbDatabase.ref(path).orderByKey().limitToLast(1).once('value').then(
      snap => {
        // set popup from props of the last relData entry  for the feature
        const propObject = Object.values(snap.val())[0]
        if (propObject) {
          document.getElementById("reldata").innerHTML = propSet(propObject)
        }
        const storage = firebase.storage();
        const pathRef = storage.ref('hounslow/thumbnails/');
        pathRef.child('example-photo.jpg').getDownloadURL().then(url => {
          fetch(url)
            .then(response => {
              //alert("blobReturned!:", url)
              return response.blob();
            })
            .then(imageBlob => {
              //alert ("blob then ..")
              const el = document.getElementById('related-image')
              el.src = URL.createObjectURL(imageBlob);
              el.width= 280;
              //document.getElementById('related-image').src ="example-photo.jpg"
            })
            .catch(error => {
              //alert ("Error!:", error.message)
            })
        });
      }
    )
  }

  const propSet = p => {
    return Object.keys(p)
      .map(item => {
        return `${item}: ${p[item]}`;
      })
      .join("<br>");
  };


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
  const fbDatabase = firebase.database();
  armIsStyleLoaded();

  map.on('click', e => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: allLayers
    });
    if (!features.length) {
      return;
    }
    const feature = features[0];

    if (state.settings.maps[state.settings.currentMapId].hasRelatedData) {
      const obId = feature.properties.OBJECTID + feature.geometry.type
      fetchLastFirebaseRelatedData(obId)
    }

    const p = feature.properties
    const popupTitle = p.ASSET || p.Asset || p.asset
    //const popupFeatureContent = propSet(feature)
    //document.getElementById("popup-feature-template").innerHTML = propSet(feature)
const modalContent = `<h4>${popupTitle}</h4><p>${propSet(feature.properties)}</p>`

    const popupContent = `<h4>${popupTitle}</h4><p><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">
    Details ...</button><p id='reldata'>no related data</p><img id="related-image"/>`
    //const popupContent = `<img id="related-image" src="example-photo.jpg"/>`
    document.querySelector(".modal-body").innerHTML = modalContent
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
