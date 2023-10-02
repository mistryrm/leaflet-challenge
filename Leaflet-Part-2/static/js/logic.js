// API endpoints
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
const platesUrl = "./data/PB2002_plates.json"

// GET data from endpoint
d3.json(queryUrl).then(function (earthquakeData) {
    d3.json(platesUrl).then(function (plateData) {
        createMap(earthquakeData.features, plateData.features);
    });
});

// This function helps classify earthquake color based on depth
function getColor(depth) {

    switch (true) {
        case -10 >= depth && depth < 10:
            return "#a2f601"
        case depth < 30:
            return "#dcf400"
        case depth < 50:
            return "#f6db12"
        case depth < 70:
            return "#fdb72a"
        case depth < 90:
            return "#fca25d"
        default:
            return "#ff5f65"
    }
}

function createMap(earthquakeData, plateData) {
    const [earthquakes, plates] = createFeatures(earthquakeData, plateData)
    const [streetMap, topologicalMap, darkMap] = getMapLayer()
    // Create map, passing the streetmap and earthquakes layers to display
    const map = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetMap, topologicalMap, earthquakes]
    });

    const baseMaps = {
        "Street": streetMap,
        "Topographic": topologicalMap,
        "Dark": darkMap
    };

    const overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": plates
    };

    addControls(map, baseMaps, overlayMaps)
    createLegend(map)
}

// This function generates features to be added to a map
function createFeatures(earthquakeData, plateData) {
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            `
            <h3 style='text-align: center;'>
               Information
            </h3>
            <hr/>
            <p><b>Location:</b> ${feature.properties.place}</p>
            <p><b>Depth:</b> ${feature.geometry.coordinates[2]}</p>
            <p><b>Magnitude:</b> ${feature.properties.mag}</p>
            `
        );
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            const color = getColor(feature.geometry.coordinates[2])

            const geojsonMarkerOptions = {
                radius: 4 * feature.properties.mag,
                fillColor: color,
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });

    const plates = L.geoJSON(plateData, {
        style: function () {
            return {
                color: "blue",
                weight: 2.5
            }
        }
    });

    return [earthquakes, plates]
}

// This function generates a map based on earthquake data
function getMapLayer() {
    // Define streetmap and layers
    const streetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const topologicalMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    return [streetMap, topologicalMap, darkMap]
}

// Creates legend to add to map
function createLegend(map) {
    // Create a legend to display information about our map
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML += 'Magnitude<br><hr>' // add legend title

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = -10; i < 110; i += 20) {
            div.innerHTML +=
                `
                <div class="legend-item">
                    <i style="background-color: ${getColor(i)}"></i>
                    <p>${i >= 90 ? '90+' : i + "-" + (i + 20)}</p>
                </div>
                `
        }

        return div;
    };

    legend.addTo(map);
}

// This function adds controls to map
function addControls(map, baseMaps, overlayMaps) {
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
}
