
var esc = {

	options: { contentType: 'application/json', dataType: 'json', processData: false},
	isConnected: false,
	// host: 'http://localhost:9200',
	urlmap: { 'playground' : '/daten/spielplatz/_search', 'kita' : '/daten/kitas/_search', 'onv': '/suchen/ubahn', 'alle' : '/daten/_search' }, 

	"connect": function(host) {
		var opt = jQuery.extend({}, this.options);
		opt.type = 'GET';		
		opt.processData = true;
		opt.data = {};
		opt.url = locES + '/_cluster/state';
		opt.success = function(result) {
			esc.isConnected = true;
			uic.setConnected(true);
			mapc.setEnabled(true);
			$("select#indizes").empty();
			for (indice in result.metadata.indices) {
				$("select#indizes").append('<option value="' + indice + '">' + indice + '</option>');
			}
		};
		opt.error = function() {
			esc.isConnected = false;
			uic.setConnected(false, true);
			mapc.setEnabled(false);			
		};
		jQuery.ajax(opt);
	},

	"retrieveArea": function(area) {
		// var query = '{"query":{"bool":{"must":[{"term":{"bezirke.name":"' + area + '"}}]}}, "size":1}'

		var query = '{ "query": { "query_string": { "query": "' + area + '", "fields":["name"] } } }';



		var opt = jQuery.extend({}, this.options); 
		opt.url = locES + '/suchen/bezirke/_search'; 	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		opt.data = query; 
		opt.type = 'POST'; 
		opt.success = function(result) { 
			var hits = result.hits.hits; 
			var message = "<strong>" + result.hits.hits.length + "</strong> hits " + " in <strong>" + result.took + "</strong> ms"; 
			$("span#took").html(message).show().delay(500).fadeOut(2000); 
			mapc.drawArea(hits); 
		}; 
 	jQuery.ajax(opt); 

	},
		"retrieveBezirk": function(area) {
		var query;
		
		if(area == '*') {
			query = '{"query":{"bool":{"must":[{"wildcard":{"bezirke.name":"*"}}],"must_not":[],"should":[]}},"from":0,"size":250,"sort":[],"facets":{}}';
		}
		else
			query = '{ "query" : { "filtered" : { "filter" : { "term" : { "name" : "' + area + '" } } } } }';

		
		var opt = jQuery.extend({}, this.options); 
		opt.url = locES + '/suchen/bezirke/_search'; 	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		opt.data = query; 
		opt.type = 'POST'; 
		opt.success = function(result) { 
			var hits = result.hits.hits; 
			var message = "<strong>" + result.hits.hits.length + "</strong> hits " + " in <strong>" + result.took + "</strong> ms"; 
			$("span#took").html(message).show().delay(500).fadeOut(2000); 
			mapc.drawArea(hits); 
		}; 
 	jQuery.ajax(opt); 

	},

	"presearch": function() {	  // stadtteil facette
		$("#dataTable").find("tr").remove();
		$("div#eintrag").hide();
		$("div#tabelle").show();
		
		var stadtteil = $("select#stadtteil").val();
		alert(stadtteil);
		if(stadtteil != 'alle') {
			var bezirkquery = '{ "query": { "query_string": { "query": "' + stadtteil + '", "fields":["name"] } } }';
			var opt = jQuery.extend({}, esc.options);
			opt.url = locES + '/suchen/bezirke/_search'; 
			opt.data = bezirkquery; 
			opt.type = 'POST'; 
	
			opt.success = function(result) { 
				var hits = result.hits.hits; 
				var message = "<strong>" + result.hits.hits.length + "</strong> hits " + " in <strong>" + result.took + "</strong> ms"; 
				uic.mits = hits[0];
				// esc.profilter(hits[0]._source.koo);
				esc.search(hits[0]._source.koo);
				mapc.drawArea(hits); 
			}; 
 			jQuery.ajax(opt);
		}
		else {
			esc.search();
		}
	},


	"search": function(cooarray) {
		var opt = jQuery.extend({}, this.options); 
		opt.type = 'POST';

		var size = $("input#obergrenze").val();
		var queryprefix = '{';
		if(size == '*')
			queryprefix += ' "size": 10000 ,';
		else if(size > 0) 
			queryprefix += ' "size": ' + size + ', ';

		var index = $("select#indizes").val();
		var querystring = $("input#query").val();

		//////////////
		var queryterm =  '';
		if(querystring == '') {	//BROWSEN ohne Suchbegriff
			queryterm =  ' "query" : { "match_all":{} } ' ;
		}
		else {
			queryterm =  ' "query": { "query_string": { "query": "' + querystring + '", "fields":["name"] }}';
		}		


		if(index == 'suchen') {  //STRASSENSUCHE
			if(querystring == '') {
				alert("Brauche Zeichenkette zur Strassensuche");
				return;
			}
			var query = '{ "query": { "query_string": {' + queryterm + '}';
			opt.data = query; 
			opt.url = locES + '/suchen/_search';
			opt.success = function(result) { 
				var hits = result.hits.hits; 
				var message = "<strong>" + result.hits.total + "</strong> hits " + " in <strong>" + result.took + "</strong> ms"; 
				$("span#took").html(message).show().delay(500).fadeOut(2000);
				uic.drawStreet(hits); 
			}; 
			jQuery.ajax(opt); 
			return;	
		}

		//////////////  PolygonFilter
		var type = $("select#kate").val(); 
		opt.url = locES + esc.urlmap[type];


		if(cooarray != undefined ) {
			var pre = queryprefix + '"query": { "filtered": {' + queryterm + ' , "filter": { "geo_polygon": { "koo": { "points": [' ;
			for(var i=0; i<cooarray.length; i++) {		//  	Object { lon=52.54021229004892, lat=13.40352847102303}
				pre += '{"lon": ' + cooarray[i].lon + ', "lat": ' + cooarray[i].lat + '},';
			}
			pre = pre.substring(0, pre.length-1);
			pre += '] } } } } } }';
			opt.data = pre;

			opt.success = function(result) { 
				var hits = result.hits.hits; 
				var message = "<strong>" + result.hits.hits.length + "</strong> hits " + " in <strong>" + result.took + "</strong> ms"; 
				$("span#took").html(message).show().delay(500).fadeOut(2000);
				uic.drawKats(hits, type);	
				uic.paintKats(hits, type);	 			
			};	
			jQuery.ajax(opt);
			return;
		}	
//////////////////

		opt.data = queryprefix + queryterm + '}';
	
		opt.success = function(result) { 
			var hits = result.hits.hits; 
			var message = "<strong>" + result.hits.hits.length + "</strong> hits " + " in <strong>" + result.took + "</strong> ms"; 
			$("span#took").html(message).show().delay(500).fadeOut(2000);
			uic.drawKats(hits, type); 	
			uic.paintKats(hits, type); 			
		};					
 		jQuery.ajax(opt); 
	},

	"suchonv": function() {
		var opt = jQuery.extend({}, this.options); 
		opt.type = 'POST';
		opt.url = locES + esc.urlmap['onv'] + '/_search';
		// opt.data = '{"query":{"bool":{"must":[{"term":{"ubahn.name":"u5"}}] }}}';
		opt.data = '{"query":{"match_all":{}}, "size": 5000}'

			if(mapc.stopschicht != null)
       			mapc.map.removeLayer(mapc.stopschicht);
       		if(mapc.linienschicht != null)
       			mapc.map.removeLayer(mapc.linienschicht);

		mapc.stopschicht = new L.LayerGroup();
 		mapc.linienschicht = new L.LayerGroup();

		opt.success = function(result) { 
			var treffer = result.hits.hits;

				$('#tableHead tr').remove();
        		$('#dataTable tr').remove();
				var table =  document.getElementById('dataTable');
        		var row = table.insertRow(0);

			for(var t=0; t<treffer.length; t++) {
        		var source = treffer[t]._source;
        		var linienname = source['name'];
        		var stoparray = source['stops'];
        		var gestaltarray = source['gestalt'];
        		//////////////////////////////////////////////


				var newcell = row.insertCell(t);	
				newcell.innerHTML = '<td>  ' + linienname.substring(12) + '  </td>';	
				//////////////////////////////////////////////////

        		for(var i=0; i<stoparray.length; i++) {
            		var stopname = stoparray[i].stopname;
            		var stoplon = stoparray[i].skoo.lon;
            		var stoplat = stoparray[i].skoo.lat;
            		var haltepunkt = L.circle([stoplon, stoplat], 10, { color: 'blue', fillColor: 'blue', fillOpacity: 1.0 }).bindPopup(stopname);
            		mapc.stopschicht.addLayer(haltepunkt);
        		}

        		for(var i=0; i<gestaltarray.length; i++) {
            		var latlngs = [];
            		var linie = gestaltarray[i];
            		for(var j=0; j<linie['koo'].length; j++) {
                		var punkt = linie['koo'][j];
                		latlngs.push([punkt.lon, punkt.lat]);
            		}
            		var linienzug = L.polyline(latlngs, {color: source.farbe, fillOpacity: 0.5});
            		mapc.linienschicht.addLayer(linienzug);
            	}
        	}

 			
    		mapc.map.addLayer(mapc.stopschicht);
    		mapc.map.addLayer(mapc.linienschicht);
    		uic.drawONV();
    		};          

    jQuery.ajax(opt); 

	},
 
}