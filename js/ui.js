$( document ).on( 'click', '.btn-add', function ( event ) {
	event.preventDefault();
	var field = $(this).closest( '.row' );
	var field_new = field.clone();
	var temp = field_new.html().replace(/addli\d+/g, 'addli' + uic.counter);
	temp = temp.replace(/addli\d+/g, 'addli' + uic.counter);
	temp = temp.replace(/value, \d+\);/g, 'value, ' + uic.counter + ');');
	temp = temp.replace(/addre\d+/g, 'addre' + uic.counter );
	field_new.html(temp);

	$(this).toggleClass( 'btn-default' ).toggleClass( 'btn-add' ).toggleClass( 'btn-danger' ).toggleClass( 'btn-remove' ).html( '–' );
	field_new.insertAfter( field );
	uic.counter++;

} );

$( document ).on( 'click', '.btn-remove', function ( event ) {
	event.preventDefault();
	$(this).closest( '.row' ).remove();
	uic.counter--;
} );

$(document).on('click', '.panel-heading span.clickable', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-minus').addClass('glyphicon-plus');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});
$(document).on('click', '.panel div.clickable', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-minus').addClass('glyphicon-plus');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});
$(document).ready(function () {
    $('.panel-heading span.clickable').click();
    $('.panel div.clickable').click();
});


$(document).ready(function() {

L.control.mousePosition().addTo(mapc.map);


  $('button').tooltip({container: 'body'});


	function getServerUrl() {
	if (window.location.href.indexOf("/_plugin/") != -1) {
 		return window.location.host;
    } else return null;
	};
	$("div#eintrag").hide();
	$("div#paginierung").hide();
	$('button#trashunten').hide();
	uic.init();
	if (url = getServerUrl()) {
		$("input#url").val(url);
		$("button#connect").click();  // war dies automatische Verbindung????
	} else {
		uic.setConnected(false);
	}
	$('#such').hide();


  $('#ortseintrag').click(function(e)
  {
	if(mapc.editBox == true) {
		return;
	}
	var drawLayer = new L.FeatureGroup().addTo(mapc.map);
	mapc.map.addControl(new L.Control.Draw({
		draw: {
			// polyline: true,
			// marker: true,
			// polygon: true,
			circle: false
				// polygon: {allowIntersection: false, shapeOptions: {
				// 		weight: 2, color: "#888", opacity: 0.5, fillColor: "#ccc", fillOpacity: 0.1
				// }},
				// rectangle: {shapeOptions: {
					// 	weight: 2, color: "#888", opacity: 0.5, fillColor: "#ccc", fillOpacity: 0.1
				// }},
				// circle: false
			},
				// edit: { featureGroup: drawLayer }
	}));
	mapc.editBox = true;		
  });

	// $(document).keypress(function(e){
	//    if (e.which == 13 && esc.isConnected) {	//	Probleme bei Texteingabe plus Newline!!!!!!
	//         $("#search").click();
	//     }
	// });


});


var getcoord = function(coord) {
	var result = '"coo" : [';
	for(var index in coord) {
		result += '{"lat" : ' + coord[index]['lat'] + ', "lon" : ' + coord[index]['lng'] + '}, ';  
	}
	result = result.substring(0, result.length-2) + ']';
	return result;
}
var getQuery = function(prefix, drawnlayer, type) { //drawnobj.layer
	var query = '';
	if(type === 'marker') {
		var coord = drawnlayer._latlng;
   		query = '{' + prefix + '"type":"zeiger", "coo" : {"lat" : ' +  coord.lat + ', "lon" : ' + coord.lng + '}}';
  		return query;
 	}
 	// beschr !== undefined && beschr != ''
 	else if(type != undefined ) {
 		var coord = drawnlayer._latlngs;
 		query = '{' + prefix + '"type":"' + type + '",' + getcoord(coord) + '}'
 		return query;
 	}
 	else {
 		query = '{' + prefix.substring(0, prefix.length-1) + '}'; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 		return query;		
 	}  	
}

var uic = {
	"mits" : [],
	counter: 1,
	"pinbutton":  '<button type="button" id="pin" class="btn btn-default glyphicon glyphicon-pushpin" style="display:inline;"></button>',
normalizeUrl: function(url) {
	var regexp = new RegExp("^(http://)?([a-zA-Z0-9\-\.]+)(:([0-9]+))?(.*)$");
	var m = regexp.exec(url);
	if (m) {
		var host = m[2];
		var port = (m[4]) ? m[4] : 9200;
		return host + ":" + port;
	} else return url;
},


	addDistricts: function() {
		if(mapc.activePlace == 'SF') {
			var box = document.stadtteil; 
			box.options.length = 0;
			box.options[0] = new Option('alle','free');
		}
		else {

		}
	},


	setOptions: function(chosen, counter) {
		var selbox;
		var suffix = 'addre' + counter;
		selbox = document.suchops[suffix];
		// selbox = $('div#' + suffix)


   		selbox.options.length = 0;

   		if (chosen == "1") {
   			selbox.options[selbox.options.length] = new Option('alle','free');
			selbox.options[selbox.options.length] = new Option('Umsonst','free');
			selbox.options[selbox.options.length] = new Option('Kostenpflichtig','money');
  		 }
   
   		if (chosen == "2") {
   			selbox.options[selbox.options.length] = new Option('jedes','immer');
			selbox.options[selbox.options.length] = new Option('Allwetter','immer');
			selbox.options[selbox.options.length] = new Option('Schoenwetter','sonne');
   		}
   		if (chosen == "3") {
  			selbox.options[selbox.options.length] = new Option('jedes','alle');
			selbox.options[selbox.options.length] = new Option('0-6 Monate','Neugeborenes');
			selbox.options[selbox.options.length] = new Option('6-12 Monate','Baby');
			selbox.options[selbox.options.length] = new Option('1-2 Jahre','Kleinkind');
			selbox.options[selbox.options.length] = new Option('2-4 Jahre','Kind');
			selbox.options[selbox.options.length] = new Option('4-6 Jahre','Grosskind');
			selbox.options[selbox.options.length] = new Option('6-10 Jahre','Teenager');
   		}
	},


	"init": function() {

	
		
		$("button#hinzu").click(function() {
			$("div#tabelle").hide();
			$("div#eintrag").show();		
		});
		/////////////////////////////////////////////////////////
		$("button#speichern").click(function() {
			// var url = $("input#url").val();
			var bez = $("input#bez").val();
			var strasse = $("input#ort1").val();
			var hausnr = $("input#ort2").val();
			var plz = $("input#ort3").val();
			var beschr = $("textarea#descr").val();
			beschr = beschr.replace(/[\n\t]+/g,'');
	
			var prefix = '';
			if(bez !== undefined && bez != '') {
				prefix += '"bez": "' + bez + '",'
			}
			if(strasse !== undefined && strasse != '') {
				prefix += '"strasse": "' + strasse + '",'
			}
			if(hausnr !== undefined && hausnr != '') {
				prefix += '"hausnr": "' + hausnr + '",';
			}
			if(plz !== undefined && plz != '') {
				prefix += '"PLZ": "' + plz + '",';
			}			
			if(beschr !== undefined && beschr != '') {
				prefix += '"beschr": "' + beschr + '",';
			}



			var options = { contentType: 'application/json', dataType: 'json', processData: false };
			var opt = jQuery.extend({}, options);
			opt.type = 'POST';
			opt.url = 'http://localhost:9200/speichern/ui';
			opt.success = function() {
				alert('Yihah, Eintrag erfolgreich gespeichert');
				// document.forms['textuell'].output.value = "";
			}
			opt.error = undefined;
			var drawnobj = mapc.drawnFeature;
			var query;
			if(drawnobj == undefined) {
				query = getQuery(prefix, undefined, undefined);
			}
			else {
				query = getQuery(prefix, drawnobj.layer, drawnobj.layerType);
			}
			opt.data = query;
			jQuery.ajax(opt);
  	
		});

	
		$("a#connect").click(function() {
			var url = $("input#url").val();
			url = uic.normalizeUrl(url);
			$("input#url").val(url);
			esc.connect(url);
		});
		$("a#disconnect").click(function() {
			mapc.setEnabled(false);
			uic.setConnected(false);
			esc.isConnected = false;
		});

		$("button#Lupe").click(function() {
			esc.presearch();
		});

		$("button#3").click(function() {
		

		});



$('button#trasheintrag').click(function() {
	$("div#eintrag").hide();
	});

$("button#trashunten").click(function() {
		$('#tableHead tr').remove();
		$('#dataTable tr').remove();
		$('#page_navigation .previous_link').remove();
		$('#page_navigation .page_link').remove(); 
		$('#page_navigation .next_link').remove();
		$('input#such').hide();
		$("button#trashunten").hide();
		$("div#paginierung").hide();

	});
$("button#onv").click(function() {
	$().button('toggle');
	esc.suchonv();
	});
 },


	"setConnected": function(connected, warning) {
		if (connected) {
			$("input#url").prop('disabled', true);
			$("select#indizes, a#connect").hide();
			$("select#indizes, a#disconnect").show();

		} else {
			$("input#url").prop('disabled', false);
			$("select#indizes, a#connect").show();
			$("select#indizes, a#disconnect").hide();
		}
	},

 
	"reobj" : { },
	"streetmap": [],

	"drawStreet" : function(hits) {
		$('#tableHead tr').remove();
		$('#dataTable tr').remove();
		uic.reobj = {};	
		uic.streetmap = [];
    	for(var i=0; i < hits.length; i++) {
			var table = document.getElementById('dataTable');
			var rowCount = table.rows.length;
        	var row = table.insertRow(rowCount);
			var strassenname = hits[i]._source.name;
			uic.streetmap[i] = strassenname;
			uic.reobj[strassenname] = [];
			uic.reobj[strassenname][0] = hits[i]._source.gestalt;
			var newcell1 = row.insertCell(0);	
			newcell1.innerHTML =  strassenname ;
			var numarray = hits[i]._source.hausnr;
			if(numarray == undefined)  {
			var newcell3 = row.insertCell(1);
        	newcell3.innerHTML = uic.pinbutton;				
				
				continue;
			}
			///////////////////////////////////////////////////////////////
			var newcell2 = row.insertCell(1);

			var print = "$('select#hausn" + i + "').val() ";

			var zelle2 = '<SELECT  id="hausn' + i + '" onchange="uic.drawHausnr(' + print + ', ' + i +' );">';	
			uic.reobj[strassenname][1] = {};
			for(var j=0; j<numarray.length; j++) {
				if(numarray[j]['lon'] == undefined) {				
					uic.reobj[strassenname][1][numarray[j]['nr']] = numarray[j]['koon'];
				}
				else {
					uic.reobj[strassenname][1][numarray[j]['nr']] = [numarray[j]['lat'], numarray[j]['lon']];
				}
				zelle2 += '<OPTION value="' + numarray[j]['nr'] + '">' + numarray[j]['nr'] + '</OPTION>';
			}
			
			zelle2 += '</SELECT>';
			newcell2.innerHTML = zelle2;
			var newcell3 = row.insertCell(2);
        	newcell3.innerHTML = uic.pinbutton;
		}
		
        $('table#ergebnistabelle tr').hover(function(){  
        	$(this).find('td').addClass('hovered'); 

        }, function() {  
        	$(this).find('td').removeClass('hovered');
        }); 

		$('table#ergebnistabelle tr').click(function(){ // 'tr' stattdessen => zeilenid funktioniert, aber vertauscht mit spaltenfunktion
    			var current = $(this).find('td').html();
    			  mapc.drawGestalt( uic.reobj[current][0] );
		});



	},

	"drawHausnr" : function(arg1, arg2) {
		var hnr = arg1;
		var strassenname = uic.streetmap[arg2];
		var coord = uic.reobj[strassenname][1][hnr];
		var spiegelcoord = [];
		for(var i=0; i<coord.length; i++) {
			spiegelcoord[i] = [coord[i]['lon'], coord[i]['lat']];
		}
	if(coord.length == 2)
		L.marker([coord[1], coord[0]]).addTo(mapc.map).bindPopup(strassenname + '@' + hnr).openPopup();
	else {
		L.polyline(spiegelcoord).addTo(mapc.map).bindPopup(strassenname + '@' + hnr).openPopup();
	}
	},

	"previous" : function() {
		var new_page = parseInt($('#current_page').val()) - 1;
			if(new_page >= 0)
				uic.go_to_page(new_page);
	},

	"next" : function(){
		var new_page = parseInt($('#current_page').val()) + 1;
			if(new_page < parseInt($('#maxpage').val()))
				uic.go_to_page(new_page);
	},

	"go_to_page" : function(page_num){
		start_from = page_num * 10;
		end_on = start_from + 10;
		$('#dataTable tr').hide(); 
		var restable = document.getElementById('dataTable');
		var trs = restable.getElementsByTagName("tr");
		for(var i=start_from; i<end_on; i++) {
			$(trs[i]).show();
		}
		$('#current_page').val(page_num);
		$('button#mitte').empty();
	var thispage =  parseInt($('#current_page').val()) + 1;
	$('button#mitte').text(' ' + thispage + ' von ' + $('#maxpage').val());
	},

	"formatResults" : function() {
		$('div#paginierung').show();
		var show_per_page = 5;  
		var restable = document.getElementById('dataTable');
		var entrynumber = restable.rows.length;
		var pagenumber = Math.ceil(entrynumber / 10); // VAR flexibel
		$('#maxpage').val(pagenumber);
		$('#current_page').val(0);
		$('#show_per_page').val(10);// VAR flexibel

		var navhtml = '<a class="previous_link" href="javascript:uic.previous();">PREV</a>';
		var currlink = 0;
		while(pagenumber > currlink){
			// navhtml += '<a class="page_link" href="javascript:uic.go_to_page(' + currlink +')" longdesc="' + currlink +'">'+ (currlink + 1) +'</a>';
			currlink++;
		}
		$('#dataTable tr').hide();
		var trs = restable.getElementsByTagName("tr");
		for(var i=0; i<10; i++) {
			$(trs[i]).show();
		}
		var thispage =  parseInt($('#current_page').val()) + 1;
 		$('button#mitte').text(' ' + thispage + ' von ' + pagenumber);

	},

	"drawKats" : function(hits, kat) {
		$('#tableHead tr').remove();
		$('#such').show();
		$('button#trashunten').show();
		$('#such').keyup(function(){ // Suche innerhalb Tabelle
			_this = this;
			var tbody = $('#dataTable');
			if($('input#such').val() == '') {
				tbody.find('tr').removeClass('visible');
				tbody.find('td').removeClass('alt');	
				uic.formatResults();
				$('#page_navigation').show();
			}
			else {		
				tbody.find('tr').removeClass('visible');
				tbody.find('td').removeClass('alt');	
				tbody.find('tr').hide();
				$.each(tbody.find('td'), function() {
        			if( $(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) != -1) {
           				$(this).addClass('alt').closest('tr').show().addClass('visible');
       				}     	                
   				});
				$('#page_navigation').hide();   
			}
		});
		///////////////////////////////////////////////////////////
		


		var fields = []; //name, addr, fon, koo
		if(kat == 'alle') {
			fields = ['addr', 'kategorie'];
		}
		else {
			for(var field in hits[0]._source) {	// RETRIEVE FROM MAPPING !!!
				if(field == 'koo' || field == 'name')
					continue;
				fields.push(field);
			}
		}
		var headercontent = '<tr><th></th><th>Name</th>';
		for(var i=0; i<fields.length; i++) {
			headercontent += '<th>' + fields[i] + '</th>';
		}
		headercontent += '</tr>';
 		var header = document.getElementById('tableHead');
 		var nu = header.insertRow(0);
 		nu.innerHTML = headercontent;	
 		////////////////////////////////////////////////////////////
 		
 		$('#dataTable tr').remove();

    	for(var i=0; i < hits.length; i++) {
    		var table =  document.getElementById('dataTable');
			var rowCount = table.rows.length;
        	var row = table.insertRow(rowCount);

			var newcell0 = row.insertCell(0);	
			newcell0.innerHTML = uic.pinbutton ;	
  
    		var source = hits[i]._source;
			var name = source.name;
			if(name == undefined)
				name = 'fehlt'
			var newcell1 = row.insertCell(1);	
			newcell1.innerHTML = name ;			

			for(var j=0; j<fields.length; j++) {
				var fieldval = source[fields[j]];
				if(fieldval == undefined)
					fieldval = 'fehlt';
				row.insertCell(j+2).innerHTML = fieldval;
			}
		}
		uic.formatResults();

		   $('table#ergebnistabelle td').click(function(){ // 'tr' stattdessen => zeilenid funktioniert, aber vertauscht mit spaltenfunktion
    		// var colIndex = $(this).parent().children().index($(this));
    		var rowIndex = $(this).parent().parent().children().index($(this).parent());
          		var currlong = hits[rowIndex]._source.koo.lon;
          		var currlat = hits[rowIndex]._source.koo.lat;
          		mapc.addPointer([currlong, currlat]);
    	
			});

		  

		 $('table#ergebnistabelle tr').hover(function(){  
		 // $('tbody tr').hover(function(){  		 	
         	var current = $(this).find('td').html();
          	$(this).find('td').addClass('hovered'); 
        }, function() {  
        	$(this).find('td').removeClass('hovered');
        
        }); 
	},


	"paintKats" : function(hits, kat) {
		var results = hits;
		var features = [];
		for(var i=0; i<results.length; i++) {
			var geometry = {};
			var current = results[i];
			var fields = current._source;
			var name = fields.name;
			var addr = fields.addr;
			var kategorie = fields.kategorie;
			var properties;
			var currentcolor = 'black';
			
			properties = kategorie + ' ';


			if(kat == 'alle') {
				properties += name + '<br>' + addr;

			}
			else if(kat == 'kita') {
				var fon = fields.fon;	//optional
				properties += name + '<br>' + addr;
				if(fon != undefined)
					properties += '<br>' + 'Kontakt: ' + fon;
			}
			else if(kat =='playground') {
				var flache = fields.flache;
				var spielflache = fields.spielflache;									
				properties += ': ' + name ;
				if(flache != undefined)
					properties += '<br>' + 'Flaeche: ' + flache;
				if(spielflache != undefined)
					properties += '<br>' + 'Spielflaeche: ' + spielflache;			
				if(addr != undefined)
					properties += '<br>' + 'Addresse: ' + addr;
			}

			
			
			if(fields.koo.lon == undefined) {	//2DO: komplexe hausnr kommen bisher nicht vor, noch einfuegen & checken
				alert('POLYGON BEI KITAS!!!');
				// geometry['type'] = 'LineString';
				// geometry['coordinates'] = [];
				// var cooarray = fields.locations;
				// for(var j=0; j<cooarray.length; j++) {
				// 	geometry['coordinates'].push([cooarray[j].lat, cooarray[j].lon])
				// }
			
			}
			else {
				var lon = fields.koo.lon;
				var lat = fields.koo.lat;	
				geometry['type'] = 'Point';
				geometry['coordinates'] = [lat, lon]; 
			}
		
			
			features.push({		// Point vs. LineString vs. Polygon 
				"type": "Feature",
				"geometry": geometry,
				"properties": properties
			});
		}
		var featureCollection = { "type": "FeatureCollection", "features": features}
		if(mapc.hasresfeatures == true)
			mapc.map.removeLayer(mapc.resultFeatures);
		mapc.hasresfeatures = true;

		mapc.resultFeatures = L.geoJson(featureCollection, {
		style: function(feature) {
			return {
				color: currentcolor
			};
		},
		pointToLayer: function(featureData, latlng) {
			return new L.CircleMarker(latlng, {
				radius: 4, weight: 2, color: 'brown', opacity: 0.8, fillOpacity: 0.8 
			});
		},
		onEachFeature: function(feature, layer) {
			layer.on('click', function(e) {
			// Do nothing yet
			}).on('mouseover', function(e) {
		    	uic.pointBox(e.originalEvent.clientX, e.originalEvent.clientY, feature.properties);
			}).on('mouseout', function(event) { $("#karteninfo").remove(); });
		}
   		}).addTo(mapc.map);		
		},


	"pointBox": function(x, y, data) {
		$("<div id='karteninfo'>" + data + "</div>").css({

			position: "absolute",
			display: "none",
			"border-radius": "4px",
			top: y - 40,
			left: x + 5,
			border: "1px solid black",
			padding: "2px 5px 2px 5px",
			"background-color": "grey",
			"max-width": "500px",
			color: "white",
			opacity: 0.8

		}).appendTo("body").fadeIn(100);
	},
	"drawONV": function() {
		alert('angekommen');
	}
}
