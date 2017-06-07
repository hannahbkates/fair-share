// Instantiating the map object
var map = L.map('mapContainer').setView([40.735021, -73.994787], 11);


// Getting NYPD Precinct number entered in URL
var precinct = '';

if (window.location.hash) {
  var precinct = window.location.hash.split('precinct=')[1];
} else {
  console.error('Precinct ID is missing in URL hash');
}

console.log(precinct);
$('.header-main').append("NYPD Precinct " + precinct +": Selected Facilities");


// Adding a light basemap from carto's free basemaps
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map);


// Defining color for each Facility Domain
function getColor(facdomain) {
  return facdomain == 'Education, Child Welfare, and Youth' ? '#f7ca00' :
  facdomain == 'Health and Human Services' ? '#BA68C8' :
  facdomain == 'Libraries and Cultural Programs' ? '#73E5F4' :
  facdomain == 'Parks, Gardens, and Historical Sites' ? '#4CAF50' :
  facdomain == 'Public Safety, Emergency Services, and Administration of Justice' ? '#2979FF' :
  facdomain == 'Core Infrastructure and Transportation' ? '#8D8EAA' :
  facdomain == 'Administration of Government' ? '#CBCBD6' : '#FFF'
};


// Getting and adding all the precinct boundaries to the map
var precincts = 'https://cartoprod.capitalplanning.nyc/user/cpp/api/v2/sql?q=SELECT * FROM support_admin_nypdprecincts WHERE precinct <> ' + precinct + '&format=geojson&filename=download'

$.getJSON(precincts, function(precincts) {

  L.geoJson(precincts, {
    style: {
      color: "#000",
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.2
    }
  }).addTo(map);
});


// Getting and adding the selected precinct boundary to the map
var precinct_selected_url = 'https://cartoprod.capitalplanning.nyc/user/cpp/api/v2/sql?q=SELECT * FROM support_admin_nypdprecincts WHERE precinct = ' + precinct + '&format=geojson&filename=download'

var precinct_selected;

$.getJSON(precinct_selected_url, function(precinct_selected_data) {

 precinct_selected = L.geoJson(precinct_selected_data, {
    style: {
      color: "#000",
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0
    }
  }).addTo(map);

  map.fitBounds(precinct_selected.getBounds());
});


// Getting and adding the filtered facilities to the map
var facsubset_url = 'https://cartoprod.capitalplanning.nyc/user/cpp/api/v2/sql?q=SELECT f.*, n.precinct FROM facdb_facilities AS f, support_admin_nypdprecincts AS n WHERE ST_Intersects(f.the_geom, n.the_geom) AND n.precinct = ' + precinct + ' AND (facsubgrp = \'Solid Waste Transfer and Carting\' OR facsubgrp = \'Camps\' OR facsubgrp = \'Child Care\' OR facsubgrp = \'DOE Universal Pre-Kindergarten\' OR facsubgrp = \'Dual Child Care and Universal Pre-K\' OR facsubgrp = \'Preschools for Students with Disabilities\' OR facsubgrp = \'Foster Care Services and Residential Care\' OR facsubgrp = \'Public Schools\' OR facsubgrp = \'Comprehensive After School System (COMPASS) Sites\' OR facsubgrp = \'Youth Centers, Literacy Programs, Job Training, and Immigrant Services\' OR facsubgrp = \'Chemical Dependency\' OR facsubgrp = \'Hospitals and Clinics\' OR facsubgrp = \'Mental Health\' OR facsubgrp = \'Residential Health Care\' OR facsubgrp = \'Community Centers and Community School Programs\' OR facsubgrp = \'Financial Assistance and Social Services\' OR facsubgrp = \'Legal and Intervention Services\' OR facsubgrp = \'Non-residential Housing and Homeless Services\' OR facsubgrp = \'Programs for People with Disabilities\' OR facsubgrp = \'Senior Services\' OR facsubgrp = \'Soup Kitchens and Food Pantries\' OR facsubgrp = \'Workforce Development\' OR facsubgrp = \'Public Libraries\' OR facsubgrp = \'School-Based Safety Program\')&format=geojson&filename=download';

var facsubset;

$.getJSON(facsubset_url, function(facsubset_data) {

  for (var i=0; i<facsubset_data.features.length; i++) {
    var myRow = '<tr>'
      + '<td width="28%">' + facsubset_data.features[i].properties.facname + '</td>'
      + '<td width="28%">' + facsubset_data.features[i].properties.facsubgrp + '</td>'
      + '<td width="28%">' + facsubset_data.features[i].properties.address + '</td>'
      + '<td width="16%"><a href=\'https://capitalplanning.nyc/facility/' + facsubset_data.features[i].properties.uid + '\' target=\'_blank\'>More details</a></td>'
    + '</tr>';

    $('.table-body').append(myRow);
  };

  facsubset = L.geoJson(facsubset_data, {
    pointToLayer: function (feature, latlng) {
        var geojsonMarkerOptions = {
            radius: 5,
            fillColor: getColor(feature.properties.facdomain),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
        };

        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: function(feature, layer) {
      var d = feature.properties;
 
      var popupText = 'Name: <b>' + d.facname + '</b><br />' 
        + 'Category: ' + d.facsubgrp + '<br />' 
        + 'Address: ' + d.address;

      layer.bindPopup(popupText);
    }
  }).addTo(map);
});

// Creating csv download URL
var facsubset_download = '<a href=\"https://cartoprod.capitalplanning.nyc/user/cpp/api/v2/sql?q=SELECT f.uid, f.facname, f.facdomain, f.facgroup, f.facsubgrp, f.address, n.precinct FROM facdb_facilities AS f, support_admin_nypdprecincts AS n WHERE ST_Intersects(f.the_geom, n.the_geom) AND n.precinct = ' + precinct + ' AND (facsubgrp = \'Solid Waste Transfer and Carting\' OR facsubgrp = \'Camps\' OR facsubgrp = \'Child Care\' OR facsubgrp = \'DOE Universal Pre-Kindergarten\' OR facsubgrp = \'Dual Child Care and Universal Pre-K\' OR facsubgrp = \'Preschools for Students with Disabilities\' OR facsubgrp = \'Foster Care Services and Residential Care\' OR facsubgrp = \'Public Schools\' OR facsubgrp = \'Comprehensive After School System (COMPASS) Sites\' OR facsubgrp = \'Youth Centers, Literacy Programs, Job Training, and Immigrant Services\' OR facsubgrp = \'Chemical Dependency\' OR facsubgrp = \'Hospitals and Clinics\' OR facsubgrp = \'Mental Health\' OR facsubgrp = \'Residential Health Care\' OR facsubgrp = \'Community Centers and Community School Programs\' OR facsubgrp = \'Financial Assistance and Social Services\' OR facsubgrp = \'Legal and Intervention Services\' OR facsubgrp = \'Non-residential Housing and Homeless Services\' OR facsubgrp = \'Programs for People with Disabilities\' OR facsubgrp = \'Senior Services\' OR facsubgrp = \'Soup Kitchens and Food Pantries\' OR facsubgrp = \'Workforce Development\' OR facsubgrp = \'Public Libraries\' OR facsubgrp = \'School-Based Safety Program\')&format=csv&filename=customfacilities_precinct' + precinct + '\">Download</a>';

$('.btn-download').append(facsubset_download);