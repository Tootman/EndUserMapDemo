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

  map.on('load', () => {

    /*
          map.addLayer({
            "id": "myPoints",
            "type": "circle",
            "minzoom": 17,
            "maxzoom": 19,
            "source": {
              type: 'vector',
              url: 'mapbox://dansimmons.6klk60z4'
            },
            "source-layer": "RichmondPointsAll-bjmuam",
            "paint": {
              "circle-radius": 3,
              "circle-stroke-width": 1,
              "circle-stroke-color": "white"
            }
          });
    */

    /*
          map.addLayer({
            "id": "mySymbols",
            "type": "symbol",
            "minzoom": 19,
            "maxzoom": 24,
            "source": {
              type: 'vector',
              url: 'mapbox://dansimmons.6klk60z4'
            },
            "source-layer": "RichmondPointsAll-bjmuam",
            "layout": {
              //"icon-image":["case",["get", "ASSET"], "Bench", "park%20bench2"],


              "icon-image": [
                "match",
                ["get", "ASSET"], "Bench", "park%20bench2",
                "Litter bin", "litter%20bin",
                "Lighting column", "lighting%20column",
                "Inspection cover", "inspection%20cover",
                "gulley%20grating"
              ],

              "icon-size": 1,
              "text-field": ["match",["get", "ASSET"], ["Bench", "Lighting column","Inspection cover", "Gulley grating", "Litter bin"],"",["get", "ASSET"]],
              "symbol-placement": "point",
              "text-anchor": "left",
              "text-offset": [1, 0],
              // "text-allow-overlap": true,
              "icon-allow-overlap": true,
              "text-optional": true,
              "text-size": 10
            }

          });

    */
    /*
          map.addLayer({
            "id": "myLines",
            "type": "symbol",
            "minzoom": 14,
            "maxzoom": 24,
            "source": {
              type: 'vector',
              url: 'mapbox://dansimmons.6klk60z4'
            },
            "source-layer": "Richmondlinesall",
            "layout": {
              //"icon-image":["case",["get", "ASSET"], "Bench", "park%20bench2"],
              "icon-size": 1,
              "text-field": ["match",["get", "ASSET"], ["Bench", "Lighting column","Inspection cover", "Gulley grating", "Litter bin"],"",["get", "ASSET"]],
              "symbol-placement": "point",
              "text-anchor": "left",
              "text-offset": [1, 0],
              // "text-allow-overlap": true,
              "icon-allow-overlap": true,
              "text-optional": true,
              "text-size": 10
            }

          });

      */

  });

  /*
  map.addControl(new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
       bbox: [-0.34418089928223594,51.44143958893025,-0.210392128369989,51.50711685536709], // Boundary for
      proximity: {
        longitude: -0.2840893326948617,
        latitude:51.46828688632934
    }
  }));
  */

  map.on('click', e => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['richmondpointsall',
              'richmondpolygonsall-2v4029',
            'lines- walls',
            'lines - fences',
            'fence over wall',
            'lines - all other'
            ] // replace this with the name of the layer
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
          const p =  feature.properties
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