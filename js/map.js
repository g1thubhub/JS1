
$(document).ready(function() {
	// Initialize Leaflet map
	mapc.init("map-canvas");
	mapc.setEnabled(false);
});

var mapc = {
	map: null,
	stopschicht: null,
	linienschicht: null,
	drawnFeature: null,
	// resultFeatures: null,
	testFeatures: null,
	streetFeatures: null,
	editBox: false,
	activePlace: '',


	"init": function(target) {
		var map = L.map(target, {
			center: [52.518914, 13.405938],
			zoomControl: true ,
			zoom: 0,
		});
		var zoomFS = new L.Control.ZoomFS( { position: 'topright'});
		map.addControl(zoomFS);
				map.on('enterFullscreen', function() {
			if (window.console) window.console.log('enterFullscreen');
		});
		map.on('exitFullscreen', function() {
			if (window.console) window.console.log('exitFullscreen');
		});
		
		L.tileLayer(baseURL).addTo(map);
				L.tileLayer(baseURL2).addTo(map);
		this.map = map;
		// this.resultFeatures = new L.FeatureGroup().addTo(map);
		this.maskLayer = L.rectangle([[-90, -360], [90, 360]], {
			fillColor: "#fff", 
			fillOpacity: 0.5, 
			weight: 0
		}).addTo(map);
	//////////////////////////////////////////////////////////////
		var drawLayer = new L.FeatureGroup().addTo(map);
		mapc.streetFeatures = new L.FeatureGroup().addTo(mapc.map);
		mapc.houseFeatures = new L.FeatureGroup().addTo(mapc.map);
		map.on('draw:drawstart', function (e) {
			drawLayer.clearLayers();
			mapc.drawnFeature = null;
		});
		map.on('draw:created', function (e) {
			mapc.drawnFeature = e;
		    drawLayer.addLayer(e.layer);
		});
		map.on('draw:deleted', function (e) {
			drawLayer.clearLayers();
			mapc.drawnFeature = null;
		});
//		map.on("click", function(event) {
//			var latLng = event.latlng;
//			// console.log("Map clicked:", JSON.stringify(latLng));
//			alert("Map clicked:" + JSON.stringify(latLng));
//		});
		map.on("moveend", function(event) {
			var bounds = mapc.getBounds();
			console.log("Map bounds changed:", JSON.stringify(bounds));
		});	




	},
	"setEnabled": function(enabled) {
		if (enabled) this.map.removeLayer(this.maskLayer);
		else this.map.addLayer(this.maskLayer);
	},
	"getBounds": function() {
		var bounds = this.map.getBounds();
		return {
			"southLat": bounds.getSouthWest().lat,
			"northLat": bounds.getNorthEast().lat,
			"westLng": bounds.getSouthWest().lng,
			"eastLng": bounds.getNorthEast().lng
		};
	},
	"getFeatureShape": function() {
		if (this.drawnFeature) {
			var type = this.drawnFeature.layerType;
			var layer = this.drawnFeature.layer;
			switch (type) {
				case 'polygon':
					var latLngs = layer.getLatLngs() // LatLng[]
					var outer = [];
					for (var i = 0; i < latLngs.length; i++) {
						outer.push([latLngs[i].lng, latLngs[i].lat]);
					}
					// Close the Polygon
					outer.push([latLngs[0].lng, latLngs[0].lat]);
					return {
						"type": "polygon",
						"coordinates": [outer]
					};
				case 'rectangle':
					var latLngs = layer.getLatLngs() // LatLng[]
					return {
						"type": "envelope",
						"coordinates": [
							[latLngs[1].lng, latLngs[1].lat],
							[latLngs[3].lng, latLngs[3].lat]
						]
					};
				case 'circle':
					var center = layer.getLatLng(); // LatLng
					var radius = layer.getRadius(); // Radius in meter
					console.log('circle', center, radius);
					// do nothing yet
					break;
			}
		} else { // Fallback, get map bounds
			var bounds = mapc.getBounds();
			return {
				"type": "envelope",
				"coordinates": [
					[bounds.westLng, bounds.northLat],
					[bounds.eastLng, bounds.southLat]
				]
			};
		}
	},
	"addPointer" : function(coo) {

		if(mapc.hasresfeatures == false)   {       		
				mapc.resultFeatures = new L.LayerGroup();				
			mapc.hasresfeatures = true;
		}
			
		var marker = L.marker(coo);
		
	
			mapc.resultFeatures.addLayer(marker);
			mapc.map.addLayer(mapc.resultFeatures);




		  // L.marker(coo).addTo(mapc.map);
	},

	"drawGestalt" : function(gestalt) {
		// array of arrays of lat/lon
		for(var i=0; i<gestalt.length; i++) {
			var coord = [];
			for(var j=0; j<gestalt[i].length; j++) {
				coord[j] = [gestalt[i][j]['lat'], gestalt[i][j]['lon']] ;
			}
			
			mapc.streetFeatures.addLayer(L.polyline(coord));
		}
	},

"placeSelect": function(place) {
	if(place == 'Berlin') {
		mapc.activePlace = 'Berlin';

	}
	else {
		mapc.activePlace = "SF";
	}

	alert(mapc.activePlace);
},

	"drawArea" : function(poly) {	//  [{"_index":"suchen","_type":"bezirke","_id":"Spandau","_score":7.5202065, "_source" : { "name": "Spandau", "koo": [{"lon": 52.5677149
		
		if(mapc.hasarea == true) {
			mapc.map.removeLayer(mapc.area);
			mapc.map.removeLayer(mapc.area);
			mapc.map.removeLayer(mapc.area);
			mapc.map.removeLayer(mapc.area);
			mapc.map.removeLayer(mapc.area);
		}
		var multip = [];
		var arrayLength = poly.length;

		for (var m = 0; m < arrayLength; m++) {
			var pointarray = poly[m]._source.koo;
			var coord = [];
			for(var i=0; i<pointarray.length; i++) {
				coord[i] = [pointarray[i]['lon'], pointarray[i]['lat']];
			}
			multip[m] = coord;
		}
	mapc.area = L.multiPolygon(multip, {color: 'darkblue', fillOpacity: 0.1 }).addTo(mapc.map).bindPopup(poly[0]._source.name).openPopup();


		mapc.hasarea = true;


	},
};
