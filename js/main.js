  "use strict";
  //

  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuc2ltbW9ucyIsImEiOiJjamRsc2NieTEwYmxnMnhsN3J5a3FoZ3F1In0.m0ct-AGSmSX2zaCMbXl0-w';
  alert("End User Map v 0.9.013")
  const state = {}
  state.settings = {}
  state.settings.maps = {}
  state.settings.maps.richmondBorough = {
    url: 'mapbox://styles/dansimmons/cjqusg2fq1jp62srv0zdgz6c5',
    //url: "mapbox://styles/dansimmons/cjsa8mwbw2bts1gs6p3jdte1o",
    mapName: 'Richmond Borough parks',
    sitesSource: 'richmondsitenames-EPSG-4326-23yist',
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
      document.getElementById('map-name').innerHTML = " - " + state.settings.maps[mapID].mapName
    }
  }

  const map = new mapboxgl.Map({
    container: 'map',
    style: (state.settings.maps[state.settings.currentMapId].url), // contains all layers with data - Richmond
    //style: 'mapbox://styles/dansimmons/cjrrodbqq01us2slmro016y8b', //hounslow
    center: (state.settings.maps[state.settings.currentMapId].center),
    zoom: 13,
    maxZoom: 23,
    minZoom: 10,
    sprite: "mapbox://sprites/mapbox/bright-v8" //
  });

  map.addControl(new mapboxgl.NavigationControl());
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    fitBoundsOptions: {
      zoom: 19
    }
  }));

  let lineLayers = [
    'lines-wall',
    'lines-fence',
    'lines-fence-over-wall',
    'lines-path',
    'lines-all-other'
  ] // replace this with the name of the layer

  let pointsAndLineLayers = lineLayers
  pointsAndLineLayers.push('points-symbol')

  const allLayers = pointsAndLineLayers
  allLayers.push('polygons')

  lineLayers.map(layer => {
    map.on('mouseenter', layer, e => {
      map.getCanvas().style.cursor = 'cell';
    })
    map.on('mouseleave', layer, () => {
      map.getCanvas().style.cursor = '';
    });
  })

  const searchUpdate = () => {
    const searchBox = document.getElementById("search-box")
    console.log(searchBox.value)
    var options = {
      keys: ['title', 'author'],
      id: 'ISBN'
    }
  }

  const searchBoxOnFocus = () => {
    console.log("focus!")
    getSiteNameList()
  }

  const siteNamesArr = (sourceLayer) => {
    const sites = map.querySourceFeatures('composite', {
      'sourceLayer': sourceLayer
      // ,filter: ['==', 'Site_Name', 'Grove Road Gardens']
    })
    const sitesSet = new Set(sites.map(site => {
      return site.properties.Site_Name
    }))
    return Array.from(sitesSet).sort()
  }

  const flyTo = siteName => {
    // queryAllFeatures
    console.log("siteName:", siteName)
    const sites = map.querySourceFeatures('composite', {
      'sourceLayer': 'richmondsitenames-EPSG-4326-23yist'
      // ,filter: ['==', 'Site_Name', 'Grove Road Gardens']
    })
    // return match where properties.Site_Name = Site_Name
    const site = sites.filter(site => {
      return site.properties.Site_Name == siteName
    })
    console.log("site:", site)
    map.fitBounds(turf.bbox(site[0])) // fails with array
    //turf.bbox()
  }



  const populateDropDownSites = () => {
    const sites = map.querySourceFeatures('composite', {
      'sourceLayer': 'richmondsitenames-EPSG-4326-23yist'
      // ,filter: ['==', 'Site_Name', 'Grove Road Gardens']
    })
    const el = document.getElementById("site-dropdown-div")
    el.innerHTML = null
    let myList = ""
    // todo: somehow use new Set to create new ob of site names with dups  removed
    /*
        renderedSitePolys.map(feature => {
          myList += `<a href="#" class="dropdown-item nav-linkx navbar-collapse">${feature.properties.Site_Name}</a> `
        })
    */
    const sitesSet = new Set(sites.map(site => {
      return site.properties.Site_Name
    }))
    const sitesArray = Array.from(sitesSet).sort()
    sitesArray.map(siteName => {
      myList += `<a href="#" class="dropdown-item nav-linkx navbar-collapse"  onClick = "flyTo('${siteName}')">${siteName})</a> `
    })
    myList += `<hr><p style="color:white;padding:1em; background-color:#b2715d">If you can't see the site <br> you are looking for<br> then try zooming out</p>`
    el.innerHTML = myList
    //console.log(renderedSitePolys)
  }

  const selectNewMap = (mapID) => {
    map.setStyle(state.settings.maps[mapID].url)
    state.settings.currentMapId = mapID // fudge - come back to
    map.on('data', armIsStyleLoaded)
    document.getElementById("navbarToggler").classList.remove("show")
    //renderedSitePolys()
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
          //document.getElementById("reldata").innerHTML = propSet(propObject)
          let relatedDataContent = `<h4>Related Data</h4>`
          relatedDataContent += propSet(propObject)
          document.querySelector(".modal-related-data").innerHTML = relatedDataContent
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
              const el = document.querySelector('.modal-related-image')
              el.src = URL.createObjectURL(imageBlob);
              el.style.width = '100%'
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
    const itemList = Object.keys(p)
      .map(item => {
        return `<tr><td>${item}</td><td>${p[item]}</td>`;
      }).join("</tr>")
    return `<table class="table table-sm table-responsive-sm table-striped">${itemList}</table>`
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
      layers: pointsAndLineLayers
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
    const modalContent = `${propSet(feature.properties)}</p>`

    const popupContent = `<h4>${popupTitle}</h4><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">
    Details ...</button>`
    //const popupContent = `<img id="related-image" src="example-photo.jpg"/>`
    document.querySelector(".modal-feature-attr").innerHTML = modalContent
    document.querySelector(".modal-title").innerHTML = popupTitle
    const popup = new mapboxgl.Popup({
        offset: [0, -15]
      })
      .setLngLat(e.lngLat)
      .setHTML(popupContent)
      .addTo(map);
  });

  // https://www.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/

  map.on('moveend', () => {
    //repopulateData()
    /*
                  const features = map.queryRenderedFeatures({
                    layers: ['points-symbol']
                  })
                  //console.log(features)
    */
  });




  map.on('zoom', () => {
    // console.log("mapZoom:", map.getZoom())
  });

  const scaleControl = new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: 'imperial'
  });
  map.addControl(scaleControl);
  scaleControl.setUnit('metric');

  map.on('geolocate', () => {
    alert("geolocate!")
  });
