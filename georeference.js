NgMap.getMap().then(function(map) {
			var bangalore = { lat: 10.333333, lng: 123.933334 };


      // This example adds an animated symbol to a polyline.

     

        // Define the symbol, using one of the predefined paths ('CIRCLE')
        // supplied by the Google Maps JavaScript API.
        var lineSymbol = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW ,
          scale: 8,
          strokeColor: '#393'
        };

        // Create the polyline and add the symbol to it via the 'icons' property.
        var line = new google.maps.Polyline({
          path: [{lat: 22.291, lng: 153.027}, {lat: 18.291, lng: 153.027},{ lat: 10.333333, lng: 123.933334 }],
          icons: [{
            icon: lineSymbol,
            offset: '100%'
          }],
          map: map
        });

        animateCircle(line);
      

      // Use the DOM setInterval() function to change the offset of the symbol
      // at fixed intervals.
      function animateCircle(line) {
          var count = 0;
          window.setInterval(function() {
            count = (count + 1) % 200;

            var icons = line.get('icons');
            icons[0].offset = (count / 2) + '%';
            line.set('icons', icons);
        }, 20);
      }
			addMarker(bangalore, map)
		});


		function addMarker(location, map) {
		        // Add the marker at the clicked location, and add the next-available label
		        // from the array of alphabetical characters.
		        var marker = new google.maps.Marker({
		        	position: location,
		        	label: 'test',
		        	map: map
		        });
		    }
}




//==================================================================================

NgMap.getMap().then(function(map) {
      var bangalore = { lat: 10.333333, lng: 123.933334 };


      // Define the custom symbols. All symbols are defined via SVG path notation.
      // They have varying stroke color, fill color, stroke weight,
      // opacity and rotation properties.
        var symbolOne = {
          path: 'M -2,0 0,-2 2,0 0,2 z',
          strokeColor: '#F00',
          fillColor: '#F00',
          fillOpacity: 1
        };

        var symbolTwo = {
          path: 'M -1,0 A 1,1 0 0 0 -3,0 1,1 0 0 0 -1,0M 1,0 A 1,1 0 0 0 3,0 1,1 0 0 0 1,0M -3,3 Q 0,5 3,3',
          strokeColor: '#00F',
          rotation: 45
        };

        var symbolThree = {
          path: 'M -2,-2 2,2 M 2,-2 -2,2',
          strokeColor: '#292',
          strokeWeight: 4
        };

        // Create the polyline and add the symbols via the 'icons' property.
        var line = new google.maps.Polyline({
          path: [{lat: 10.333333, lng: 123.933334}, {lat: 10.333334, lng: 153.027}],
          icons: [
            {
              icon: symbolOne,
              offset: '0%'
            }, {
              icon: symbolTwo,
              offset: '50%'
            }, {
              icon: symbolThree,
              offset: '100%'
            }
          ],
          map: map
        });
      addMarker(bangalore, map)
    });


    function addMarker(location, map) {
            // Add the marker at the clicked location, and add the next-available label
            // from the array of alphabetical characters.
            var marker = new google.maps.Marker({
              position: location,
              label: 'test',
              map: map
            });
        }