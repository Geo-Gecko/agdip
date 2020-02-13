// Creating map options
var mapOptions = {
  center: [1.66, 32.55],
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
  layer.bindPopup('<h5 style=" margin:0;">Grid-ID: ' + feature.properties.id + '</h5><br><p>Properties</p><br><p style="color:#000; margin:0;">NDVI: ' + parseFloat(feature.properties.NDVI_JFM).toFixed(2) + '</p><br><p style="color:#000; margin:0;">NDWI: ' + parseFloat(feature.properties.NDWI_JFM).toFixed(2) + '</p><br><p style="color:#000; margin:0;">Phosphorus Content: ' + parseFloat(feature.properties.Soil_Phosp).toFixed(2) + '</p><br><p style="color:#000; margin:0;">Aluminium Content: ' + parseFloat(feature.properties.Soil_Alumi).toFixed(2) + '</p><br><p style="color:#000; margin:0;">Potassium Content: ' + parseFloat(feature.properties.Soil_Potas).toFixed(2) + '</p><br><p style="color:#000; margin:0;">Boron: ' + parseFloat(feature.properties.Soil_Boron).toFixed(2) + '</p><br><p style="color:#000; margin:0;">Rainfall: ' + parseFloat(feature.properties.Rainfall).toFixed(2) + '</p><br><p style="color:#000; margin:0;">PPP-sum: ' + parseFloat(feature.properties.ppp_sum).toFixed(2) + '</p><br><p style="color:#000; margin:0;">Land Cover: ' + parseFloat(feature.properties.Land_Cover).toFixed(0) + '</p><br><p style="color:#000; margin:0;">Slope: ' + parseFloat(feature.properties.Slope).toFixed(2) + '</p><br><p style="color:#000; margin:0;">Elevation: ' + parseFloat(feature.properties.Elevation).toFixed(2) + '</p>');
}


var data;

Papa.parse('./js/uganda_grid_5by5km_noWater_withDistrict.csv', {
  header: true,
  download: true,
  dynamicTyping: true,
  complete: function (results) {
    data = results.data;
  }
});


datalayer = L.geoJson(grid, {
  style: style,
  onEachFeature: function (feature, featureLayer) {
    featureLayer.bindPopup(feature.properties.District);

    featureLayer.on({
      mouseover: onMouseOver,
      mouseout: onMouseOut,
    })
  }
}).addTo(map)

function onMouseOver(e) {
  data.forEach(element => {
    if(e.target.feature.properties.id == element.id) {
      info.update(element);
    }
  });
}

function onMouseOut(e) {
  info.update();
}



map.fitBounds(datalayer.getBounds());

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Details</h4>' +  (props ?
        '<b>Grid ID #' + props.id + '</b><br />'+ 
        '<h3>Crop Data</h3><br />' 
        + '<span>Average Health</span><br />' + props.NDVI_JFM + '<br />'
        + '<span>Average Soil Moisture</span><br />' + props.NDWI_JFM + '<br />'+ 
        '<h3>Soil Data</h3><br /><sup>Units: grams per Kilo</sup><br />'
        + '<span>Average Aluminium Content</span><br />' + props.Soil_Alumi + '<br />'
        + '<span>Average Boron Content</span><br />' + props.Soil_Boron + '<br />'
        + '<span>Average Copper Content</span><br />' + props.Soil_Coppe + '<br />'
        + '<span>Average Iron Content</span><br />' + props.Soil_Iron + '<br />'
        + '<span>Average Magnesium Content</span><br />' + props.Soil_Magne + '<br />'
        + '<span>Average Phosphorus Content</span><br />' + props.Soil_Phosp + '<br />'
        + '<span>Average Potassium Content</span><br />' + props.Soil_Potas + '<br />'+ 
        '<h3>Land Factors</h3><br />' 
        + '<span>Average Elevation</span><br />' + props.DEM_mean + '<br />'
        + '<span>Average Slope</span><br />' + props.Slope_mean + '<br />'
        + '<span>Landcover Type</span><br />' + props.LandCover_mean + '<br />'
        : 'Hover over a grid cell');
};

info.addTo(map);


d3.selectAll(".slider").append("div").attr("class", "sliders");
var sliders = document.getElementsByClassName('sliders');
// var fieldName = ['NDVI_JFM', 'NDWI_JFM', 'Soil_Phosp', 'Soil_Alumi', 'Soil_Potas', 'Soil_Boron', 'Rainfall', 'ppp_sum', 'LandCover_mean', 'Slope_mean', 'DEM_mean'];
var fieldName = ['NDVI_JFM', 'NDWI_JFM', 'Soil_Phosp', 'Soil_Alumi', 'Soil_Potas', 'Soil_Boron', 'Rainfall', 'LandCover_mean', 'Slope_mean', 'DEM_mean'];
// var fieldName = ['DEM_mean', 'Slope_mean', 'LandCover_mean'];

var minMax = [
  [-0.02, 1],
  [-0.05, 1],
  [450, 5800],
  [540, 1820],
  [115, 1290],
  [40, 180],
  [20, 120],
  // [0, 3000],
  [1, 8],
  [88, 90],
  [620, 4000]
];

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
  var value;

  data.forEach(element => {
    for (var j = 0; j < sliderData[0].length; j++) {
      if (element[sliderData[0][j]]) {
        value = +(element[sliderData[0][j]]);
        if (value < +((sliderData[1][j][0])) || value > +((sliderData[1][j][1]))) {
          filtered.push(element.id);
        }
      }
    }
  });

  filteredIDs = filtered.filter(function (item, pos) {
    return filtered.indexOf(item) === pos;
  });

  for (key in datalayer['_layers']) {
    var l = datalayer['_layers'][key];
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



