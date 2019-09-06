
// Creating map options
var mapOptions = {
  center: [0.9204, 31.7708],
  zoom: 10.5,
  // minZoom: 5,
  // maxZoom: 1
}



// Creating a map object
var map = new L.map('map', mapOptions);

// Creating a Layer object
var layer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// Adding layer to the map
map.addLayer(layer);

var scale = L.control.scale(); // Creating scale control
scale.addTo(map); // Adding scale control to the map


function style(feature) {
  return {
    fillColor: '#826600',
    weight: 0,
    opacity: 1,
    fillOpacity: 0.7
  };
}

var layer;
// loading GeoJSON file - Here my html and usa_adm.geojson file resides in same folder
$.getJSON("data/Kiboga.geojson", function (data) {
  // L.geoJson function is used to parse geojson file and load on to map
  layer = L.geoJson(data, {
    style: style
  }).addTo(map);
  map.fitBounds(layer.getBounds())
});

d3.selectAll(".slider").append("div").attr("class", "sliders");
var sliders = document.getElementsByClassName('sliders');
var fieldName = ['NDVI_JFM', 'NDWI_JFM', 'Soil_Phosp', 'Soil_Alumi', 'Soil_Potas', 'Soil_Boron', 'Rainfall', 'ppp_sum', 'Land_Cover', 'Slope', 'Elevation'];

var minMax = [[-0.02, 1], [-0.05, 1], [600, 2300], [700, 970], [130, 280], [45, 150], [0, 70], [0, 3000], [1, 8], [1, 20], [1055, 1570]];

// console.log(sliders)
// console.log(map)

for (var i = 0; i < sliders.length; i++) {

  noUiSlider.create(sliders[i], {
    start: [minMax[i][0], minMax[i][1]],
    behaviour: "drag",
    margin: 0.05,
    connect: true,
    orientation: "horizontal",
    range: {
      'min': minMax[i][0],
      'max': minMax[i][1]
    },
    tooltips: true,
    // format: {
    //   to: function (value) {
    //     // console.log(value);
    //     return value.toFixed(0) + '%';
    //   },
    //   from: function (value) {
    //     return value.replace('%', '');
    //   }
    // }
  });

  var activeFilters = [];

  sliders[i].noUiSlider.on('end', addValues);

}

function addValues() {

  var allValues = [];
  var range, rangeMin, rangeMax;
  var realRange = [];

  for (var i = 0; i < sliders.length; i++) {
    allValues.push([sliders[i].noUiSlider.get()]);
    range = sliders[i].noUiSlider.get();
    rangeMin = range.slice(0, 1);
    rangeMax = range.slice(1);

    realRange.push(rangeMin.concat(rangeMax));

  }

  var sliderData = [fieldName].concat([realRange]);


  var filtered = [];
  var filteredIDs = [];
  var subCountyValue;

  for (key in layer['_layers']) {
    var l = layer['_layers'][key];
    for (var j = 0; j < sliderData[0].length; j++) {
      if (l['feature']['properties'][sliderData[0][j]]) {
        subCountyValue = +(l['feature']['properties'][sliderData[0][j]]);
        // console.log(+((sliderData[1][j][0])));
        if (subCountyValue < +((sliderData[1][j][0])) || subCountyValue > +((sliderData[1][j][1]))) {
          filtered.push(l['feature']['properties'].id);
        }
      }

    }

  }

  filteredIDs = filtered.filter(function (item, pos) {
    return filtered.indexOf(item) === pos;
  });

  console.log(filteredIDs)

  for (key in layer['_layers']) {
    var l = layer['_layers'][key];
    l.setStyle({
      opacity: 1,
      fillOpacity: 1
    })
    for (var j = 0; j < filteredIDs.length; j++) {
      if (l['feature']['properties'].id === filteredIDs[j]) {
        l.setStyle({
          opacity: 0,
          fillOpacity: 0
        })
      }

    }

  }
}



