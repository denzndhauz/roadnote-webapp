(function() {
	'use strict';

	angular
	.module('app')
	.controller('MainCtrl', MainController);


	function MainController($scope, $rootScope, $firebaseAuth, $state, NgMap) {
	  var vm = this;
		var auth = $firebaseAuth();
		vm.login = user_auth;
    var user = auth.$getAuth();


    
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (user && toState.name == 'login') {
        $state.go('home');
      }
    });

    vm.user = {
      email: '',
      password: ''
    }

    vm.login_loading = false;
    function user_auth(username, password) {
      vm.login_loading = true;
      auth.$signInWithEmailAndPassword(username, password).then(function(firebaseUser) {
        $state.go('complain');
      vm.login_loading = false;
      }).catch(function(error) {
        console.log("Authentication failed:", error);
        if(error.code == 'auth/wrong-password') {
          swal(
          'Oops...',
          'Invalid Email/Password',
          'error'
        )
        } else if(error.code == 'auth/too-many-requests') {
          swal(
          'Oops...',
          error.message,
          'error'
        )
        }
      vm.login_loading = false;
      });
    }

		vm.routeTo = routeTo;
    vm.default_city = 'Cebu City';
		var apiKey = "AIzaSyDtLbU3jgtpnBDE4u5fgSNjByB8Q5dGuWY";

		var map;
		var drawingManager;
		var placeIdArray = [];
		var polylines = [];
		var snappedCoordinates = [];

		if (user) {
			console.log("Signed in as:", user.uid);
		} else {
			console.log("Signed out");
		}

		function routeTo(name) {
			$state.go(name);
		}

		NgMap.getMap().then(function(map) {
			var bangalore = { lat: 10.333333, lng: 123.933334 };

      // Adds a Places search box. Searching for a place will center the map on that
      // location.
      map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
          document.getElementById('bar'));
      var autocomplete = new google.maps.places.Autocomplete(
          document.getElementById('autoc'));
      autocomplete.bindTo('bounds', map);
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
      });

    // Enables the polyline drawing control. Click on the map to start drawing a
    // polyline. Each click will add a new vertice. Double-click to stop drawing.
    drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYLINE,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYLINE
        ]
      },
      polylineOptions: {
        strokeColor: '#696969',
        strokeWeight: 2
      }
    });
  drawingManager.setMap(map);

  // Snap-to-road when the polyline is completed.
  drawingManager.addListener('polylinecomplete', function(poly) {
    var path = poly.getPath();
    polylines.push(poly);
    placeIdArray = [];
    runSnapToRoad(path);
  });

  // Clear button. Click to remove all polylines.
  $('#clear').click(function(ev) {
    for (var i = 0; i < polylines.length; ++i) {
      polylines[i].setMap(null);
    }
    polylines = [];
    ev.preventDefault();
    return false;
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

// Snap a user-created polyline to roads and draw the snapped path
function runSnapToRoad(path) {
  var pathValues = [];
  for (var i = 0; i < path.getLength(); i++) {
    pathValues.push(path.getAt(i).toUrlValue());
  }

  $.get('https://roads.googleapis.com/v1/snapToRoads', {
    interpolate: true,
    key: apiKey,
    path: pathValues.join('|')
  }, function(data) {
    processSnapToRoadResponse(data);
    drawSnappedPolyline();
    getAndDrawSpeedLimits();
  });
}

// Store snapped polyline returned by the snap-to-road service.
function processSnapToRoadResponse(data) {
  snappedCoordinates = [];
  placeIdArray = [];
  for (var i = 0; i < data.snappedPoints.length; i++) {
    var latlng = new google.maps.LatLng(
        data.snappedPoints[i].location.latitude,
        data.snappedPoints[i].location.longitude);
    snappedCoordinates.push(latlng);
    placeIdArray.push(data.snappedPoints[i].placeId);
  }
}

// Draws the snapped polyline (after processing snap-to-road response).
function drawSnappedPolyline() {
  var snappedPolyline = new google.maps.Polyline({
    path: snappedCoordinates,
    strokeColor: 'black',
    strokeWeight: 3
  });

  snappedPolyline.setMap(map);
  polylines.push(snappedPolyline);
}

// Gets speed limits (for 100 segments at a time) and draws a polyline
// color-coded by speed limit. Must be called after processing snap-to-road
// response.
function getAndDrawSpeedLimits() {
  for (var i = 0; i <= placeIdArray.length / 100; i++) {
    // Ensure that no query exceeds the max 100 placeID limit.
    var start = i * 100;
    var end = Math.min((i + 1) * 100 - 1, placeIdArray.length);

    drawSpeedLimits(start, end);
  }
}

// Gets speed limits for a 100-segment path and draws a polyline color-coded by
// speed limit. Must be called after processing snap-to-road response.
function drawSpeedLimits(start, end) {
    var placeIdQuery = '';
    for (var i = start; i < end; i++) {
      placeIdQuery += '&placeId=' + placeIdArray[i];
      console.log(end);
    }

    $.get('https://roads.googleapis.com/v1/speedLimits',
        'key=' + apiKey + placeIdQuery,
        function(speedData) {
          processSpeedLimitResponse(speedData, start);
        }
    );
}

// Draw a polyline segment (up to 100 road segments) color-coded by speed limit.
function processSpeedLimitResponse(speedData, start) {
  var end = start + speedData.speedLimits.length;
  for (var i = 0; i < speedData.speedLimits.length - 1; i++) {
    var speedLimit = speedData.speedLimits[i].speedLimit;
    var color = red;

    // Take two points for a single-segment polyline.
    var coords = snappedCoordinates.slice(start + i, start + i + 2);

    var snappedPolyline = new google.maps.Polyline({
      path: coords,
      strokeColor: color,
      strokeWeight: 6
    });
    snappedPolyline.setMap(map);
    polylines.push(snappedPolyline);
  }
}

// function getColorForSpeed(speed_kph) {
//   if (speed_kph <= 40) {
//     return 'purple';
//   }
//   if (speed_kph <= 50) {
//     return 'blue';
//   }
//   if (speed_kph <= 60) {
//     return 'green';
//   }
//   if (speed_kph <= 80) {
//     return 'yellow';
//   }
//   if (speed_kph <= 100) {
//     return 'orange';
//   }
//   return 'red';
// }

  }
})();