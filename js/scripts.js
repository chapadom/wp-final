// sets up my mapbox access token so they can track my usage of their basemap services
mapboxgl.accessToken = 'pk.eyJ1IjoibWlsaW1hcHMiLCJhIjoiY2p1bXhxcHdqMHYzajRlczhsMnN6cGx6ciJ9.dRiK8JSG4Q0kReMYqNveUg';

// zoom and center to show only nyc
var map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-73.931, 40.737],
  zoom: 11.3,
});

// add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

// a little object for looking up neighborhood center points
var neighborHoodLookup = {
  'brooklyn': [-73.979702, 40.68],
  'queens': [-73.938, 40.761],
  'lowermn': [-73.9885, 40.72],
  'uppermn': [-73.970, 40.7911],
}

// we can't add our own sources and layers until the base style is finished loading
map.on('style.load', function() {
  $('.flyto').on('click', function(e) {
    // pull out the data attribute for the neighborhood using query
    var neighborhood = $(e.target).data('neighborhood');
    // this is a useful notation for looking up a key in an object using a variable
    var center = neighborHoodLookup[neighborhood];
    // fly to the neighborhood's center point
    map.flyTo({
      center: center,
      zoom: 13
    });
  });

  // you can use map.getStyle() in the console to inspect the basemap layers
  map.setPaintProperty('water', 'fill-color', '#a4bee8')

  // add the citibike points layer
  map.addSource('citibike', {
    type: 'geojson',
    data: './data/citibike.geojson',
  });

  // edit the citibike layer and bucket ridership,
  // different point size and color based on station usage
  map.addLayer({
    id: 'citibike-points',
    type: 'circle',
    source: 'citibike',
    paint: {
      'circle-radius': {
        property: 'd_rides',
        type: 'interval',
        stops: [
          [50, 5],
          [50, 7],
          [300, 9],
          [500, 10],
        ]
      },
      'circle-color': {
        property: 'd_rides',
        type: 'interval',
        stops: [
          [50, '#fccde5'],
          [50, '#bebada'], //dac0e8
          [300, '#8dd3c7'], //#8dd3c7
          [500, '#fb8072'],
        ]
      }
    }
  });

  // add an outline to the citibike points
  map.addLayer({
    id: 'citibike-outline',
    type: 'circle',
    source: 'citibike',
    paint: {
      'circle-opacity': 0.7,
      'circle-color': 'gray',
      'circle-opacity': {
        stops: [
          [14, 0],
          [14.8, 1]
        ],
      }
    }
  });

  // add an empty data source, which we will use to highlight the station the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted station
  map.addLayer({
    id: 'highlight-circle',
    type: 'circle',
    source: 'highlight-feature',
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': 'black',
    }
  });

  // when the mouse moves, do stuff!
  map.on('mousemove', function(e) {
    // query for the features under the mouse, but only in the citibike layer
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['citibike-points'],
    });

    // get the first feature from the array of returned features.
    var station = features[0]
    if (station) { // if there's a station under the mouse, do stuff

      map.getCanvas().style.cursor = 'pointer'; // make the cursor a pointer
      var stationDescription = // use jquery to display the citibike stats on the sidebar
      $('#station_id').text(station.properties.station_id);
      $('#station_name').text(station.properties.station_name);
      $('#t_rides').text(station.properties.t_rides);
      $('#d_rides').text(station.properties.d_rides);

      // set this station's feature as the data for the highlight source
      map.getSource('highlight-feature').setData(station.geometry);
    } else {
      map.getCanvas().style.cursor = 'default'; // make the cursor default

      // reset the highlight source to an empty featurecollection
      map.getSource('highlight-feature').setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  })
})


// "Find Out More" Pop Up Box

/* Set the width of the box to 250px (show it) */
function openNav() {
  document.getElementById("about").style.width = "350px";
  document.getElementById("about").style.marginRight = "250px";
}

/* Set the width of the box to 0 (hide it) */
function closeNav() {
  document.getElementById("about").style.width = "0";
  document.getElementById("about").style.marginRight = "0";
}
