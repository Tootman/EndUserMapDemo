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
- - reset or remove when new map loaded
- - Move popupcontent to Flyout panel
- - icon dependent on point 'type'

### Features


## User guidance / notes
 - Should be intuative to use - so hopefully no (minimal) guidance/help doc needed

### device requirements

- Connection to internet


### feature wish-list

 - Handle Photo related to feature
-  handle Related data (by appending data from Firebase Database  - however OBJECTID not used in Richmond Dataset)
- onHoverOver  infoBox for feature props (tried to implement - but couldn't get to work)

### Bugs / issues
- difficult to select Line features when using touch device (tablet/phone)
 - Some properties of some assets not displayed (issue with importing/serving/converting TileSet)


### dev notes

- Not yet configured for webpack (ie no minified, scss, babel, bundled )
- not yet attached to Firebase database

### user stories


### Functional specification (pseudocode)
onLoad:
  - load Mapbox style
   - attach onClick listeners to Mapdata points, polygons, and the various seperately styled lines LayersControl

### Behaviour:



### Technology stack

Mapbox (which uses leaflet and  TileMill)
