# ORCL End User map demo v0.9.1

---

v0.9.1
### Description

Mapbox based EndUser map (used served vector tile set)
Spatial data processing to be based only on features visible in viewport (unlike 'WebApp' and 'MapAdmin' where
processing is upon entire dataset)

### Next todo

- AddPoints:
- - Persist between sessions ? Manage cached Firebase pushes (similar to RelatedData push)
- - icon dependent on point 'type'

### Features
 - Append related Data from Firebase database to infoWindow 
  - Append related Photo from Firebase storage to infoWindow


## User guidance / notes
 - Should be intuative to use - so hopefully no (minimal) guidance/help doc needed

### device requirements

- Connection to internet
 - Chrome browser


### feature wish-list

 - Add related Data form and submit (for logged in user)
 - Add new Point (for logged in User)
  - 

### Bugs / issues
- difficult to select Line features (and some dot points) when using touch device (tablet/phone)
 - how to highlight the selected feature
 - Some properties of some assets not displayed (issue with importing/serving/converting TileSet?)
 - some torn / distorted / corrupted polygons eg see Richmond terrace gdns


### dev notes

- Not yet configured for webpack (ie no minified, scss, not transpiled to es6 from es6 -  babel, bundled )


### user stories
- Council - 'I want to know what assets I have and where there are'.


### Functional specification (pseudocode)
onLoad:
  - load Mapbox style
   - attach onClick listeners to Mapdata points, polygons, and the various seperately styled lines LayersControl

### Behaviour:



### Technology stack

Mapbox (which uses leaflet and  TileMill)
