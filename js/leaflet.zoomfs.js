L.Control.ZoomFS = L.Control.Zoom.extend({
	includes: L.Mixin.Events,
	onAdd: function (map) {
		
		var container = L.DomUtil.create('div','leaflet-bar');

		this._map = map;
		this._isFullscreen = false;
//  _createButton:function(t,e,i,n,s,a){var r=o.DomUtil.create("a",i,n);r.innerHTML=t,r.href="#"
		this._zoomFullScreenButton = this._createButton('[_]','Fullscreen', 'strg-vollbild' , container, this.fullscreen, this);
		this._swipeButton = this._createButton('X','Delete markers', 'strg-loschen', container, this.swipe, this);
		this._centerButton = this._createButton('><','Center view', 'strg-zentrieren', container, this.center, this);

		
		
		
		
		return container;

	},
	
	searchin: function() {
		alert('jooo');
	
	},

	center: function() {
	

		mapc.map.setView([37.65, -122.54],10);
	
	},
	
	swipe: function() {
	
	// hasfeatures
			if(mapc.hasresfeatures == true) {
				mapc.map.removeLayer(mapc.resultFeatures);
				mapc.hasresfeatures = false;
				}
				
			if(mapc.hasarea == true) {
				mapc.map.removeLayer(mapc.area);
				mapc.hasarea = false;
			}

			if(mapc.streetFeatures != true) {
				 mapc.streetFeatures.clearLayers();
			}


//


	},	
	fullscreen: function() {
		// call appropriate internal function
		if (!this._isFullscreen) {
			this._enterFullScreen();
		} else {
			this._exitFullScreen();
		}

		// force internal resize
		this._map.invalidateSize();
	},
	_enterFullScreen: function() {
		var container = this._map._container;

		// apply our fullscreen settings
		container.style.position = 'fixed';
		container.style.left = 0;
		container.style.top = 0;
		container.style.width = '100%';
		container.style.height = '100%';

		// store state
		L.DomUtil.addClass(container, 'leaflet-fullscreen');
		this._isFullscreen = true;

		// add ESC listener
		L.DomEvent.addListener(document, 'keyup', this._onKeyUp, this);

		// fire fullscreen event on map
		this._map.fire('enterFullscreen');
	},
	_exitFullScreen: function() {
		var container = this._map._container;

		// update state
		L.DomUtil.removeClass(container, 'leaflet-fullscreen');
		this._isFullscreen = false;

		// remove fullscreen style; make sure we're still position relative for Leaflet core.
		container.removeAttribute('style');

		// re-apply position:relative; if user does not have it.
		var position = L.DomUtil.getStyle(container, 'position');
		if (position !== 'absolute' && position !== 'relative') {
			container.style.position = 'relative';
		}

		// remove ESC listener
		L.DomEvent.removeListener(document, 'keyup', this._onKeyUp);

		// fire fullscreen event
		this._map.fire('exitFullscreen');
	},
	_onKeyUp: function(e) {
		if (!e) e = window.event;
		if (e.keyCode === 27 && this._isFullscreen === true) {
			this._exitFullScreen();
		}
	}
});
