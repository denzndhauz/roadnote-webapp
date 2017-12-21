(function() {
    'use strict';

	angular
	    .module('app')
	    .controller('MainCtrl', MainController);


	    function MainController($scope, $firebaseAuth, $state, NgMap) {
	    	var vm = this;
	    	var auth = $firebaseAuth();
	    	var user = auth.$getAuth();
	    	vm.routeTo = routeTo;


	    	if (user) {
			  console.log("Signed in as:", user.uid);
			} else {
			  console.log("Signed out");
			}

			function routeTo(name) {
				$state.go(name);
			}

			NgMap.getMap().then(function(map) {
		    	var bangalore = { lat: 12.97, lng: 77.59 };

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
})();