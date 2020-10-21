var map = L.map('map', {
    minZoom: -4,
    maxZoom: 0,
    zoom: 0.5,
    crs: L.CRS.Simple,
    Renderer: 10
});
var bounds = [[0,0], [10200,4800]];
var image = L.imageOverlay('/images/MS River.png', bounds).addTo(map);

map.fitBounds(bounds);