$(document).ready(function () {
	// Inits map
	var mapOptions = {
		zoom: 6,
		center: new google.maps.LatLng(60.976206, 14.763184)
	};
	var map = new google.maps.Map(document.getElementById('map'), mapOptions);
	var categories = {}; // Associative array needs to be object to iterate via $.each()
	var markers = [];
	
	// Inits traffic info
	$.getJSON("ajax.php", function(data) {
		var items = [];
		$.each(data.messages, function(index, value) {
			var date = new Date(parseInt(value.createddate.substr(6))); // Fix date-object from json format (solution from http://stackoverflow.com/questions/4511705/how-to-parse-json-to-receive-a-date-object-in-javascript)
			var dateString = date.getDay();
			switch (dateString) {
				case 1:
					dateString = "Måndagen";
					break;
				case 2:
					dateString = "Tisdagen";
					break;
				case 3:
					dateString = "Onsdagen";
					break;
				case 4:
					dateString = "Torsdagen";
					break;
				case 5:
					dateString = "Fredagen";
					break;
				case 6:
					dateString = "Lördagen";
					break;
				case 7:
					dateString = "Söndagen";
					break;
			}
			
			dateString += " den " +date.getDate() + "/";
			var month = date.getMonth() + 1;
			var minutes = "" + date.getMinutes();
			if (minutes.length < 2) {
				minutes = "0" + minutes; 
			}
			dateString += month + " " + date.getFullYear() + " kl: " + date.getHours() + ":" + minutes;
			value.createddate = dateString;
			
			// Add to list
			items.push(value);
		});
		items.reverse();
		addTrafficHTML(items);
		var selectCategory = "<select id='categorySelect' class='form-control'><option value='-1'>Alla kategorier</option>";
		
		$.each(categories, function(key, categ) {
			selectCategory += "<option value='"+key+"'>"+categ+"</option>";
		});
		selectCategory += "</select><input type='button' value='Välj' id='submitCategory' class='btn btn-default navbar-btn' />";
		$("#select").append(selectCategory);
		
		$("#submitCategory").click(function() {
			var category = $("#categorySelect").val();
			if (category != -1) {
				var categItems = [];
				$.each(items, function(index, value) {
					if (value.category == category) {
						categItems.push(value);
					}
				});
				categItems.reverse();
				addTrafficHTML(categItems);
			} else {
				addTrafficHTML(items);
			}
		});
		
		
	}).fail(function(jqxhr, textStatus, error) {
		$("#traffic").append("<p>Det gick inte att hämta trafikinformation från APIet.</p>");
	});
	
	
	function addTrafficHTML(items) {
		$("#traffic").html("");
		
		$.each(markers, function(key, mark) {
			mark.setMap(null);
		});
		markers = []; // Resetting markers
		$.each(items, function(index, value) {
			var categoryNr = value.category;
			var category = "";
			
			switch(categoryNr) {
				case 0:
					category = "Vägtrafik";
					break;
				case 1:
					category = "Kollektivtrafik";
					break;
				case 2:
					category = "Planerad störning";
					break;
				case 3:
				default:
					category = "Övrigt";
					break;
			}
			if (categories[categoryNr] == undefined) {
				categories[categoryNr] = category;
			}
			
			var info = "<h4>"+value.title+"</h4><p>"+value.description+"</p><p>Plats: "+value.exactlocation+"</p><p>Kategori: "+category+"</p><p>Tillagd: "+value.createddate+"</p>";
			$("#traffic").append("<div class='traffic-info'>"+info+"</div>");
			
			// Add marker and info-box to map 
			var infowindow = new google.maps.InfoWindow({
	        	content: "<div>"+info+"</div>"
			});
			
			var pos = new google.maps.LatLng(value.latitude, value.longitude);
			var marker = new google.maps.Marker({
				position: pos,
				map: map,
				title: value.title
			});
			markers.push(marker);
			// Connects the infowindow to the marker and map and displays it on click
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(map, marker);
				infowindow.setZIndex(100);
			});
		});
		
	}
});