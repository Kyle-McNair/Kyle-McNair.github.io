var map = L.map('map', {
    minZoom: -4,
    maxZoom: 2,
    zoom: 0.5,
    crs: L.CRS.Simple,
    Renderer: 10
});
var bounds = [[0,0], [11520,8640]];
var image = L.imageOverlay('../NamingWisconsin/images/NamingWI.png', bounds).addTo(map);

map.fitBounds(bounds);
