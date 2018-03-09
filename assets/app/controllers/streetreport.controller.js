(function() {
	'use strict';

	angular
	.module('app')
	.controller('SReportCtrl', StreetReportController);

	function StreetReportController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage, NgMap) {

		var vm = this;
		var ref = firebase.database().ref();

		vm.report_a_complain = $firebaseArray(ref.child('street_reports'));
		var storageRef = firebase.storage().ref("images");
    	vm.storage = $firebaseStorage(storageRef);		
		var storageRef = firebase.storage().ref("Street_Reports/");
		// var getval = document.getElementById("value").value;
		// console.log(getval);
		vm.getLocation = {
			lat: 1,
			lng: 1
		}
		function addMarker(location, map) {
	        // Add the marker at the clicked location, and add the next-available label
	        // from the array of alphabetical characters.
	        var marker = new google.maps.Marker({
		          position: location,
		          label: 'test',
		          map: map
		        });
	    };

		NgMap.getMap().then(function(map) {
			document.getElementById("locationView").onclick = function() {modalLocation()};
			vm.map = map;
			vm.modalView = modalView;
			function modalView(street_reports) {
				$('#modalView').modal('show');
				vm.getLocation.lat = street_reports.sr_lat;
				vm.getLocation.lng = street_reports.sr_long;
				console.log(vm.getLocation.lng);
				console.log(vm.getLocation.lat);

				var location = { lat: street_reports.sr_lat, lng: street_reports.sr_long };
		    	addMarker(location, map)
		    	var latlng = new google.maps.LatLng(location.lat, location.lng);
		    	map.setCenter(latlng);
				map.setZoom(16);
			}
			function modalLocation(){
				$('#modalView').modal('hide');
				$('#modalLocation').modal('show');
			}	
			
		});

	}	
})();