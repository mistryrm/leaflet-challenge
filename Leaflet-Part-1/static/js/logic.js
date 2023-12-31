// API endpoint
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// GET data from endpoint
d3.json(queryUrl).then(function (data) {
    // On response, pass the data.features to ceate map
    createMap(data.features);
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

function createMap(earthquakeData) {
    const earthquakesFeatures = createFeatures(earthquakeData)
    const streeMapLayer = getMapLayer()
    // Create map, passing the streetmap and earthquakes layers to display
    const map = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streeMapLayer, earthquakesFeatures]
    });
    createLegend(map)
}

function createFeatures(earthquakeData) {
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
    return earthquakes = L.geoJSON(earthquakeData, {
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
}

// This function generates a map based on earthquake data
function getMapLayer() {
    // Define streetmap and layers
    return streetmap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
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
