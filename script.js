document.addEventListener('DOMContentLoaded', function () {

    // --- Initialize a STATIC map with zoom/pan disabled ---
    const map = L.map('map', {
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        dragging: false,
        boxZoom: false,
        attributionControl: false
    });

    // --- Load GeoJSON Data for India States ---
    fetch('india_states.geojson') 
        .then(response => response.json())
        .then(geojson => {
            // Create the GeoJSON layer with styling
            const indiaLayer = L.geoJson(geojson, {
                // Exclude Andaman & Nicobar Islands from the map
                filter: function (feature) {
                    const stateName = (feature.properties.shape1 || '').toLowerCase();
                    return !(stateName.includes('andaman') || stateName.includes('nicobar'));
                },
                style: function (feature) {
                    // Default style for the states
                    return {
                        fillColor: '#FFFFFF', // White fill for the states
                        weight: 1,
                        opacity: 1,
                        color: '#a0aec0',    // Grey borders for states
                        fillOpacity: 1
                    };
                },
                onEachFeature: function (feature, layer) {
                    // ***CORRECTED: Reads state name from 'shape1' property***
                    const stateName = feature.properties.shape1 || 'Unknown State';

                    // Only these states should be clickable (correspond to pinned locations)
                    const clickableStates = new Set([
                        'Delhi',
                        'Maharashtra',
                        'Haryana',
                        'Madhya Pradesh',
                        'Karnataka',
                        'West Bengal',
                        'Meghalaya'
                    ].map(s => s.toLowerCase()));

                    const isClickable = clickableStates.has((stateName || '').toLowerCase());

                    if (isClickable) {
                        layer.bindPopup(`<b>${stateName}</b>`);
                        // Add interaction to highlight state on hover and enable click only for these
                        layer.on({
                            mouseover: function (e) {
                                e.target.setStyle({
                                    weight: 2,
                                    color: '#f97316', // UPAY orange for border
                                    fillColor: '#fed7aa' // Lighter orange for fill on hover
                                });
                            },
                            mouseout: function (e) {
                                // Reset to the default style
                                indiaLayer.resetStyle(e.target);
                            },
                            click: function () {
                                // Zoom-on-click is disabled
                                // Popup will open due to bindPopup
                                console.log(`Clicked on state: ${stateName}`);
                            }
                        });
                        // Change cursor to pointer for clickable states
                        layer.on('add', function () {
                            const element = layer.getElement();
                            if (element) element.style.cursor = 'pointer';
                        });
                    } else {
                        // Ensure non-clickable states don't display pointer cursor
                        layer.on('add', function () {
                            const element = layer.getElement();
                            if (element) element.style.cursor = 'default';
                        });
                    }
                }
            }).addTo(map);

            // ***ADDED: Automatically fit the map to India's boundaries***
            map.fitBounds(indiaLayer.getBounds());

            // Add markers for requested locations
            const locations = [
                { name: 'Delhi', coords: [28.6139, 77.2090] },
                { name: 'Pune', coords: [18.5204, 73.8567] },
                { name: 'Gurgaon', coords: [28.4595, 77.0266] },
                { name: 'Nagpur', coords: [21.1458, 79.0882] },
                { name: 'Mauda', coords: [21.3116, 79.3713] },
                { name: 'Gadarwara', coords: [22.9220, 78.7849] },
                { name: 'Bengaluru', coords: [12.9716, 77.5946] },
                { name: 'Kolkata', coords: [22.5726, 88.3639] },
                { name: 'Garo Hills (Tura)', coords: [25.5142, 90.2026] }
            ];

            locations.forEach(({ name, coords }) => {
                L.marker(coords).addTo(map).bindPopup(`<b>${name}</b>`);
            });
        })
        .catch(error => {
            console.error('Error loading GeoJSON data:', error);
            alert('Could not load India state boundaries. Please check "india_states.geojson" file.');
        });


    // --- Initialize Charts (Chart.js) ---
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Corp. Grants', 'Donations', 'Govt. Aid'],
            datasets: [{
                label: 'Amount (in Lakhs)',
                data: [120, 190, 30],
                backgroundColor: [
                    '#1e3a8a',
                    '#f97316',
                    '#60a5fa'
                ],
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });

    const ctx2 = document.getElementById('chart2').getContext('2d');
    const chart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Delhi', 'Mumbai', 'Pune', 'Nagpur'],
            datasets: [{
                label: 'Number of Students',
                data: [2500, 3200, 1500, 1300],
                backgroundColor: '#1e3a8a',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});