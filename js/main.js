"use strict";
//
// --- setup state  -----

alert("End User Map v 0.9.022");
const state = {};
state.settings = {};
state.sitesFeatureCollection = {};
state.settings.maps = {};
state.settings.maps.richmondBorough = {
  url: "mapbox://styles/dansimmons/cjqusg2fq1jp62srv0zdgz6c5",
  //url: "mapbox://styles/dansimmons/cjsa8mwbw2bts1gs6p3jdte1o",
  mapName: "Richmond Borough parks",
  dataSource: "richmondsitenames-EPSG-4326-23yist",
  sitesDataSet: "cjsoewq710bcn2xmoupim2gi5",
  center: {
    lat: 51.443858500160644,
    lng: -0.3215425160765335
  },
  hasRelatedData: false,
  zoom: 11
};
state.settings.maps.hounslowBorough = {
  url: "mapbox://styles/dansimmons/cjrrodbqq01us2slmro016y8b",
  mapName: "Hounslow Borough parks",
  dataSource: "hounslow-borough-park-names-p-9yc84m",
  sitesDataSet: "cjsm0gxi30v872xp42mzlgep0", // todo - note this not rendered- and is INDEPENDENT of tileset layer for sites
  center: {
    lat: 51.44156782214026,
    lng: -0.4432747195056663
  },
  firebaseMapId: "-LR7CewcYJ2ZUDgCJSK8",
  hasRelatedData: true,
  zoom: 11
};
state.settings.currentMapId = "hounslowBorough";
state.sitesQueryResult = {};
state.fbDatabase = {};
state.userProfile = {};

const loadSiteNamesDatasetLayer = datasetId => {
  const url = `https://api.mapbox.com/datasets/v1/dansimmons/${datasetId}/features?access_token=${
    mapboxgl.accessToken
  }`;
  fetch(url)
    .then(resp => resp.json()) // Transform the data into json
    .then(function(data) {
      state.sitesFeatureCollection = data;
      const siteNames = data.features.map(feature => {
        const siteName =
          feature.properties.Site_Name || feature.properties.Site;
        return siteName;
      });
      autocomplete(document.getElementById("myInput"), siteNames);

      /*
          map.addLayer({
            'source': {
              'type': 'geojson',
              'data': data
            },
            'id': 'gjLayer',
            'type': 'fill',
            'layout': {},
            'paint': {
              'fill-color': '#088',
              'fill-opacity': 1
            }
          })
  */
    });
};

const armIsStyleLoaded = () => {
  if (map.isStyleLoaded()) {
    map.off("data", armIsStyleLoaded);
    console.log("finally loaded");
    const mapID = state.settings.currentMapId;
    map.setCenter(state.settings.maps[mapID].center);
    map.setZoom(11);
    document.getElementById("map-name").innerHTML =
      " - " + state.settings.maps[mapID].mapName;
  }
};

const selectNewMap = mapID => {
  map.setStyle(state.settings.maps[mapID].url);
  document.querySelector("#satellite-layer-chkbox").checked = false;
  state.settings.currentMapId = mapID; // fudge - come back to
  map.on("data", armIsStyleLoaded);
  document.getElementById("navbarToggler").classList.remove("show");
  loadSiteNamesDatasetLayer(state.settings.maps[mapID].sitesDataSet);
};

const selectNewMapWithAccess = userProfile => {
  mapboxgl.accessToken = userProfile.mapboxAccessToken;
  map.setStyle(userProfile.mapboxStyleId);
  document.querySelector("#satellite-layer-chkbox").checked = false;
  //state.settings.currentMapId = mapID; // fudge - come back to
  map.on("data", armIsStyleLoaded);
  //document.getElementById("navbarToggler").classList.remove("show");
  loadSiteNamesDatasetLayer(userProfile.mapboxSitesDataSet);
  console.log("attaching listeners ...");
  attachMapListeners();
  console.log("attached listeners done");
};

// ------ init -------------------------------

document.addEventListener("DOMContentLoaded", function(event) {
  initApp();

  document.getElementById("login-btn").addEventListener("click", () => {
    //User().btnLogin();
    console.log("btnlogin");
    userLogin();
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    userLogout();
  });

  /*
  map.on("mouseenter", "points-symbol", e => {
    map.getCanvas().style.cursor = "default";
  });
  map.on("mouseleave", "points-symbol", () => {
    map.getCanvas().style.cursor = "";
  });
 */
});

const initApp = () => {
  console.log("initApp!");
  state.fbDatabase = initFirebase();
  const myUser = User();
  const loggedIn = myUid => {
    // logged in Func
    getUserProfileFromFirebase(myUid).then(snapshot => {
      state.userProfile = snapshot.val();
      document.getElementById("Login-status-message").innerHTML = `Hi ${
        state.userProfile.userName
      }`;
      document.getElementById("login-btn").style.display = "none";
      document.getElementById("logout-btn").style.display = "block";
      document.getElementById("login-form").style.display = "none";
      document.querySelector("canvas").style.display = "block";
      document.getElementById("mapsplash").style.display = "none";
      selectNewMapWithAccess(state.userProfile);
    });
  };

  const loggedOut = () => {
    //logged out func
    document.getElementById("Login-status-message").innerHTML =
      "Bye - you have now signed out";
    document.getElementById("login-btn").style.display = "block";
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("login-form").style.display = "block";
    document.querySelector("canvas").style.display = "none";
    document.getElementById("mapsplash").style.display = "block";
    console.log("logged out - callback");
  };

  myUser.OnAuthChangedListener(loggedIn, loggedOut);
};

const attachMapListeners = () => {
  document
    .getElementById("select-hounslow-map")
    .addEventListener("click", () => {
      selectNewMap("hounslowBorough");
    });
  document
    .getElementById("select-richmond-map")
    .addEventListener("click", () => {
      selectNewMap("richmondBorough");
    });

  map.on("moveend", function(e) {
    document.getElementById("myInput").value = "";
  });

  document
    .querySelector("#satellite-layer-chkbox")
    .addEventListener("change", e => {
      if (e.target.checked) {
        // Checkbox is checked..
        satImageSetVisible(true);
        console.log("tickbox checked");
      } else {
        // Checkbox is not checked..
        satImageSetVisible(false);
        console.log("tickbox notChecked");
      }
    });

  map.on("click", e => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: pointsAndLineLayers
    });
    if (!features.length) {
      return;
    }
    const feature = features[0];

    if (state.settings.maps[state.settings.currentMapId].hasRelatedData) {
      const obId = feature.properties.OBJECTID + feature.geometry.type;
      fetchLastFirebaseRelatedData(obId);
    }
    const p = feature.properties;
    const popupTitle = p.ASSET || p.Asset || p.asset;
    //const popupFeatureContent = propSet(feature)
    //document.getElementById("popup-feature-template").innerHTML = propSet(feature)
    const modalContent = `${propSet(
      feature.properties
    )}</p><div class="propsetPhoto"></div>`;
    const popupContent = `<dt>${popupTitle}</dt><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">
        more...</button>`;
    //const popupContent = `<img id="related-image" src="example-photo.jpg"/>`
    document.querySelector(".modal-feature-attr").innerHTML = modalContent;
    document.querySelector(".modal-title").innerHTML = popupTitle;
    const popup = new mapboxgl.Popup({
      offset: [0, -15]
    })
      .setLngLat(e.lngLat)
      .setHTML(popupContent)
      .addTo(map);
    //attachPropsetPhotoIfExists(feature.properties);
    const photoParentEl = document.querySelector(".modal-feature-photo");
    if ((p.Photo || p.PHOTO) && state.userProfile.fbStoragePhotosPath) {
      //const storage = firebase.storage();
      //const pathRef = storage.ref(state.userProfile.fbStoragePhotosPath);
      const pathRef = state.userProfile.fbStoragePhotosPath;
      // .modal-feature-photo
      const photoId = p.Photo || p.PHOTO;
      fetchPhotoFromFBStorage({
        parentEl: photoParentEl,
        path: state.userProfile.fbStoragePhotosPath,
        photoId: photoId
      });
    } else {
      photoParentEl.src = "";
    }
  });
};

const attachPropsetPhotoIfExists = propset => {
  let el = "";
  if (propset.Photo || propset.PHOTO) {
    el = `<P>Photo here!</p>`;
  }
  return el;
};

const map = new mapboxgl.Map({
  container: "map",
  //style: (state.settings.maps[state.settings.currentMapId].url), // contains all layers with data - Richmond
  //style: 'mapbox://styles/dansimmons/cjrrodbqq01us2slmro016y8b', //hounslow
  center: state.settings.maps[state.settings.currentMapId].center,
  zoom: 13,
  maxZoom: 23,
  minZoom: 10,
  sprite: "mapbox://sprites/mapbox/bright-v8" //
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    fitBoundsOptions: {
      zoom: 19
    }
  })
);
map.addControl(
  new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: "metric"
  })
);

let lineLayers = [
  "lines-wall",
  "lines-fence",
  "lines-fence-over-wall",
  "lines-path",
  "lines-all-other"
]; // replace this with the name of the layer

let pointsAndLineLayers = lineLayers;
pointsAndLineLayers.push("points-symbol");

const allLayers = pointsAndLineLayers;
allLayers.push("polygons");

/*

*/
map.on("load", e => {
  map.on("mouseenter", "points-symbol", e => {
    map.getCanvas().style.cursor = "default";
  });
  map.on("mouseleave", "points-symbol", () => {
    map.getCanvas().style.cursor = "";
  });
  lineLayers.map(layer => {
    map.on("mouseenter", layer, e => {
      map.getCanvas().style.cursor = "default";
    });
    map.on("mouseleave", layer, () => {
      map.getCanvas().style.cursor = "";
    });
  });

  console.log("mapresources loaded");
});

//selectNewMap(state.settings.currentMapId);
//window.User = User;

// ------------- functions ---

const searchBoxOnFocus = () => {
  // Function not  used since  full dataset now stored in state
  // todo: why not all orignal shp properties appearing in object todo!!??
  console.log("focus!");
  const mapId = state.settings.currentMapId;
  //const siteNames = siteNamesArr('richmondsitenames-EPSG-4326-23yist')
  state.sitesQueryResult = map.querySourceFeatures("composite", {
    sourceLayer: state.settings.maps[mapId].dataSource
    // ,filter: ['==', 'Site_Name', 'Grove Road Gardens']
  });

  const siteNames = state.sitesQueryResult.map(feature => {
    const siteName = feature.properties.Site_Name || feature.properties.Site;
    return siteName;
  });
  autocomplete(document.getElementById("myInput"), siteNames);

  console.log("done!");
};

const siteNamesArr = sourceLayer => {
  const sites = map.querySourceFeatures("composite", {
    sourceLayer: sourceLayer
    // ,filter: ['==', 'Site_Name', 'Grove Road Gardens']
  });
  const sitesSet = new Set(
    sites.map(site => {
      return site.properties.Site_Name;
    })
  );
  return Array.from(sitesSet).sort();
};

const flyTo = siteName => {
  // queryAllFeatures
  console.log("siteName:", siteName);
  const siteId = state.settings.currentMapId;
  /*
        const sites = map.querySourceFeatures('composite', {
          'sourceLayer': state.settings.maps[siteId].dataSource
          // ,filter: ['==', 'Site_Name', 'Grove Road Gardens']
        })
    */
  // return match where properties.Site_Name = Site_Name
  const site = state.sitesFeatureCollection.features.filter(site => {
    const prop_name = site.properties.Site_Name || site.properties.Site;
    return prop_name == siteName;
  });
  console.log("site:", site);
  map.fitBounds(turf.bbox(site[0])); // fails with array
  //turf.bbox()
  //document.getElementById('myInput').value=""
};

const populateDropDownSites = () => {
  // not now used
  const el = document.getElementById("site-dropdown-div");
  el.innerHTML = null;
  let myList = "";
  //const sites = siteNamesArr('richmondsitenames-EPSG-4326-23yist')
  const mapId = state.settings.currentMapId;
  const sitesArray = map.querySourceFeatures("composite", {
    sourceLayer: state.settings.maps[mapId].dataSource
    // ,filter: ['==', 'Site_Name', 'Grove Road Gardens']
  });

  sitesArray.map(feature => {
    const siteName = feature.properties.Site_Name || feature.properties.Site;
    myList += `<a href="#" class="dropdown-item nav-linkx navbar-collapse"  onClick = "flyTo('${siteName}')">${siteName})</a> `;
  });
  myList += `<hr><p style="color:white;padding:1em; background-color:#b2715d">If you can't see the site <br> you are looking for<br> then try zooming out</p>`;
  myList += `<button class="btn btn-primary "id="Show-all-button" onClick="reseToBoundsOfProject()">Show all</button>`;
  el.innerHTML = myList;
};

const reseToBoundsOfProject = () => {
  const mapId = state.settings.currentMapId;
  map.setCenter(state.settings.maps[mapId].center);
  map.setZoom(state.settings.maps[mapId].zoom);
};

const fetchLastFirebaseRelatedData = obId => {
  const path = `/App/Maps/${
    state.settings.maps[state.settings.currentMapId].firebaseMapId
  }/Related/${obId}`;
  state.fbDatabase
    .ref(path)
    .orderByKey()
    .limitToLast(1)
    .once("value")
    .then(snap => {
      // set popup from props of the last relData entry  for the feature
      const propObject = Object.values(snap.val())[0];
      if (propObject) {
        //document.getElementById("reldata").innerHTML = propSet(propObject)
        let relatedDataContent = `<h4>Latest update</h4>`;
        relatedDataContent += propSet(propObject);
        document.querySelector(
          ".modal-related-data"
        ).innerHTML = relatedDataContent;
      }

      fetchPhotoFromFBStorage({
        parentEl: document.querySelector(".modal-related-image"),
        path: "hounslow/thumbnails/",
        photoId: "example-photo.jpg"
      });
    });
};

const fetchPhotoFromFBStorage = ({ parentEl, path, photoId }) => {
  const storage = firebase.storage();
  const pathRef = storage.ref(path);
  pathRef
    .child(photoId)
    .getDownloadURL()
    .then(url => {
      fetch(url)
        .then(response => {
          //alert("blobReturned!:", url)
          return response.blob();
        })
        .then(imageBlob => {
          //alert ("blob then ..")
          //const el = document.querySelector(".modal-related-image");
          parentEl.src = URL.createObjectURL(imageBlob);
          parentEl.style.width = "100%";
          //document.getElementById('related-image').src ="example-photo.jpg"
        })
        .catch(error => {
          //alert ("Error!:", error.message)
        });
    });
};

const propSet = p => {
  const itemList = Object.keys(p)
    .map(item => {
      return `<tr><td>${item}</td><td>${p[item]}</td>`;
    })
    .join("</tr>");
  return `<table class="table table-sm table-striped">${itemList}</table>`;
};

const fireBaseconfig = {
  apiKey: "AIzaSyB977vJdWTGA-JJ03xotQkeu8X4_Ds_BLQ",
  authDomain: "fir-realtime-db-24299.firebaseapp.com",
  databaseURL: "https://fir-realtime-db-24299.firebaseio.com",
  projectId: "fir-realtime-db-24299",
  storageBucket: "fir-realtime-db-24299.appspot.com",
  messagingSenderId: "546067641349"
};

const initFirebase = () => {
  firebase.initializeApp(fireBaseconfig);
  return firebase.database();
};

const userLogin = () => {
  User()
    .btnLogin()
    .then(data => {
      console.log("login () any final stuff:", data);

      // // const token = data.mapboxAccessToken
      //getUserProfileFromFirebase(data.uid).then(snapshot => {
      //state.userProfile = snapshot.val();
      // //const msg = document.getElementById("Login-status-message");

      //selectNewMapWithAccess(state.userProfile);
      //});
    })
    .catch(error => {
      console.log("error in login!");
    });
};

const userLogout = () => {
  User()
    .btnLogout()
    .then(data => {
      console.log("loggout:");
      document.querySelector("canvas").style.display = "none";
      document.getElementById("mapsplash").style.display = "block";
    })
    .catch(error => {
      console.log("error in logout!");
    });
};

const getUserProfileFromFirebase = userId => {
  return firebase
    .database()
    .ref(`App/Users/${userId}/`)
    .once("value");
};

const satImageSetVisible = visible => {
  if (visible) {
    map.setLayoutProperty("mapbox-satellite", "visibility", "visible");
    //map.setPaintProperty('polygons', 'fill-opacity', 0.1);
  } else {
    map.setLayoutProperty("mapbox-satellite", "visibility", "none");
  }
};

// --- search auto complete ---

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
    var a,
      b,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;

          /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
          closeAllLists();
          flyTo(inp.value);
          document
            .getElementById("navbarToggler")
            .classList.replace("show", "hide");
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function(e) {
    closeAllLists(e.target);
  });
}
