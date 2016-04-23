/*jslint devel: true, continue: true, eqeq: true, plusplus: true, sloppy: true, vars: true*/
/*global L, jQuery */

// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([42.58854, 12.22374], 5);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var markers;

function notEmpty(obj) {
    var x;
    for (x in obj) {
        if (!jQuery.isEmptyObject(obj[x])) {
            return true;
        }
    }
    return false;
}

function insertMount(mount) {
    var imagesPresent = false;
    if (markers) {
        map.removeLayer(markers);
    }
    console.log(mount);
    var addressPoints = [];
    var pic, source;
    if (mount.data.imgs && notEmpty(mount.data.imgs)) {
        imagesPresent = true;
        for (source in mount.data.imgs) {
            if (source == "others") {
                for (pic in mount.data.imgs[source]) {
                    if (mount.data.imgs[source][pic]) {
                        addressPoints.push([mount.data.imgs[source][pic].coord[0], mount.data.imgs[source][pic].coord[1], mount.name, mount.data.imgs[source][pic].src, mount.data.imgs[source][pic].source + " - Coordinates via EXIF"]);
                    }
                }
            } else {
                for (pic in mount.data.imgs[source]) {
                    if (mount.data.imgs[source][pic]) {
                        addressPoints.push([mount.data.lat, mount.data.lng, mount.name, mount.data.imgs[source][pic], source]);
                    }
                }

            }
        }
    } else {
        addressPoints.push([mount.data.lat, mount.data.lng, mount.name, "http://5.249.147.66:8080/css/m.png"]);
    }



    markers = L.markerClusterGroup({
        zoomToBoundsOnClick: false,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier: 2,
        iconCreateFunction: function(cluster) {
            return new L.DivIcon({
                html: '<div class="icon">' + cluster.getChildCount() + '</div>'
            });
        }
    });
    var i;
    var coords = [];
    for (i = 0; i < addressPoints.length; i++) {
        var a = addressPoints[i];
        var title = a[2];

        var icon = L.icon({
            iconUrl: a[3],
            shadowUrl: '',
            iconSize: [38, 38], // size of the icon
            shadowSize: [0, 0], // size of the shadow
            iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
            shadowAnchor: [0, 0], // the same for the shadow
            popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
        });
        coords[0] = a[0];
        coords[1] = a[1];
        var marker = new L.marker(new L.LatLng(a[0], a[1]), {
            icon: icon
        }, {
            title: title
        });
        if (imagesPresent) {
            marker.bindPopup(mount.name + "<br><br>" + "<img width='" + 600 + "' src='" + a[3] + "'/> <br> Source: " + a[4], {
                maxWidth: 900,
                maxHeight: 700
            });
        }
        markers.addLayer(marker);
    }
    map.addLayer(markers);
    map.setView(coords, 7, {
        animate: true,
        duration: 8
    });


    var aperto = false;
    markers.on('clusterclick', function(a) {
        if (!aperto) {
            a.layer.spiderfy();
            aperto = true;
        } else {
            a.layer.unspiderfy();
            aperto = false;
        }

    });
}