// Set global variable
var myMap ={};

// STEP ONE
// Get data set

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(data => {

// STEP TWO
// Import and visualise the data

  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);

});

// Set colors for circles
var hue = ["#7CFC00", "#DFFF00", "#FFFF31", "#F4C430", "#FF7518", "#FF0800"];

//function to return color of circle
function circleHue(magnitude) {
    if (magnitude < 1) {
        return hue[0];
    }
    else if (magnitude < 2) {
        return hue[1];
    }
    else if (magnitude < 3) {
        return hue[2];
    }
    else if (magnitude < 4) {
        return hue[3];
    }
    else if (magnitude < 5) {
        return hue[4];
    }
    else {
        return hue[5];
    }
}

// Function to create marker size for earthquakes
function calcRadius(magnitude) {
  return (magnitude/5) * 20;
}

// Function to create marker layer and popup
function createFeatures(earthquakeData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {

    // Create circle markers based on earthquake magnitude
    pointToLayer: function(feature) {
      return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          fillColor: circleHue(+feature.properties.mag), // Use function to apply marker fill based on magnitude
          color: "rgb(153,51,204)",
          weight: 0.5,
          opacity: 0.7,
          fillOpacity: 0.7,
          radius: calcRadius(+feature.properties.mag) // Use function to calculate radius based on magnitude 
      });
    },

    
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h5>" + feature.properties.place +
      "</h5><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
      
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}



// Function to create map layers
function createMap(earthquakes) {

    //create a satellite tile layer
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={accessToken}", {
          attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
          maxZoom: 18,
          id: "mapbox.satellite",
          accessToken: API_KEY
      });

    //create a light tile layer
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
    });

    //create an terrain tile layer
    var terrainmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.mapbox-terrain-v2",
        accessToken: API_KEY
    });

      // Define a baseMaps object to hold our base layers
      var baseMaps = {
        "Satellite": satellitemap,
        "Grayscale": lightmap,
        "Terrain": terrainmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create the map with our layers
    myMap = L.map("map", {
      center: [32.00, -87.00],
      zoom: 3,
      layers: [satellitemap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend to myMap
    info.addTo(myMap);

};

// Create legend and position on bottom right of map
var info = L.control({position: "bottomright"});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function() {

  // Create a <div> element to insert legend
  var div = L.DomUtil.create("div", "legend");

  // Create labels and values to find colors
  var magnitudeLabels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
  var magnitudeScale = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];

  // Create the legend inner html
  div.innerHTML = '<div><strong>Legend</strong></div>';
  for (var i = 0; i < magnitudeScale.length; i++) {
    div.innerHTML += '<i style = "background: ' + circleHue(magnitudeScale[i]) 
    + '"></i>&nbsp;' + magnitudeLabels[i] + '<br/>';
  };
  return div;
};