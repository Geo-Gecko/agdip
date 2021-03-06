
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
    color: "#d1a917",
    weight: 0,
    opacity: 1,
    fillOpacity: 0.7
  };
}

function onEachFeature(feature, layer) {
  layer.bindPopup('<h5 style=" margin:0;">Grid-ID: '+feature.properties.id+'</h5><br><p>Properties</p><br><p style="color:#000; margin:0;">NDVI: '+parseFloat(feature.properties.NDVI_JFM).toFixed(2)+'</p><br><p style="color:#000; margin:0;">NDWI: '+parseFloat(feature.properties.NDWI_JFM).toFixed(2)+'</p><br><p style="color:#000; margin:0;">Phosphorus Content: '+parseFloat(feature.properties.Soil_Phosp).toFixed(2)+'</p><br><p style="color:#000; margin:0;">Aluminium Content: '+parseFloat(feature.properties.Soil_Alumi).toFixed(2)+'</p><br><p style="color:#000; margin:0;">Potassium Content: '+parseFloat(feature.properties.Soil_Potas).toFixed(2)+'</p><br><p style="color:#000; margin:0;">Boron: '+parseFloat(feature.properties.Soil_Boron).toFixed(2)+'</p><br><p style="color:#000; margin:0;">Rainfall: '+parseFloat(feature.properties.Rainfall).toFixed(2)+'</p><br><p style="color:#000; margin:0;">PPP-sum: '+parseFloat(feature.properties.ppp_sum).toFixed(2)+'</p><br><p style="color:#000; margin:0;">Land Cover: '+parseFloat(feature.properties.Land_Cover).toFixed(0)+'</p><br><p style="color:#000; margin:0;">Slope: '+parseFloat(feature.properties.Slope).toFixed(2)+'</p><br><p style="color:#000; margin:0;">Elevation: '+parseFloat(feature.properties.Elevation).toFixed(2)+'</p>');
}

var layer;
// loading GeoJSON file - Here my html and usa_adm.geojson file resides in same folder
$.getJSON("data/Kiboga.geojson", function (data) {
  // L.geoJson function is used to parse geojson file and load on to map
  layer = L.geoJson(data, {
    onEachFeature: onEachFeature,
    style: style
  }).addTo(map);
  map.fitBounds(layer.getBounds())
});

d3.selectAll(".slider").append("div").attr("class", "sliders");
var sliders = document.getElementsByClassName('sliders');
var fieldName = ['NDVI_JFM', 'NDWI_JFM', 'Soil_Phosp', 'Soil_Alumi', 'Soil_Potas', 'Soil_Boron', 'Rainfall', 'ppp_sum', 'Land_Cover', 'Slope', 'Elevation'];

var minMax = [[-0.02, 1], [-0.05, 1], [600, 2300], [700, 970], [130, 280], [45, 150], [0, 70], [0, 3000], [1, 8], [1, 20], [1055, 1570]];

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
    tooltips: true
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
        if (subCountyValue < +((sliderData[1][j][0])) || subCountyValue > +((sliderData[1][j][1]))) {
          filtered.push(l['feature']['properties'].id);
        }
      }

    }

  }

  filteredIDs = filtered.filter(function (item, pos) {
    return filtered.indexOf(item) === pos;
  });

  for (key in layer['_layers']) {
    var l = layer['_layers'][key];
    l.setStyle({
      opacity: 1,
      fillOpacity: 0.7
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



