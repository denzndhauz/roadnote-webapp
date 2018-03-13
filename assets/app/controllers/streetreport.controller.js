(function() {
	'use strict';

	angular
	.module('app')
	.controller('SReportCtrl', StreetReportController);

	function StreetReportController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage, NgMap) {
	
		var vm = this;
		var ref = firebase.database().ref();
		var marker;
		vm.report_a_complain = $firebaseArray(ref.child('street_reports'));
		var storageRef = firebase.storage().ref("images");
    	vm.storage = $firebaseStorage(storageRef);		
		var storageRef = firebase.storage().ref("Street_Reports/");
		// var getval = document.getElementById("value").value;
		// console.log(getval);
		vm.getLocation = {
			lat: 0,
			lng: 0
		}

		vm.updateSr_status = function(sr) {
			console.log(sr)
			//needs to $update
		}
		function addMarker(location, map) {
	        // Add the marker at the clicked location, and add the next-available label
	        // from the array of alphabetical characters.
	        
	        marker = new google.maps.Marker({
	          position: location,
	          label: 'test',
	          map: map
	        });
	    };
	    function getmodalLocation(){			
			$('#modalView').modal('hide');
			$('#modalLocation').modal('show');

		}	
	    document.getElementById("locationView").onclick = function() {getmodalLocation()};
		NgMap.getMap().then(function(map) {
			vm.map = map;
			vm.modalView = modalView;
			function modalView(street_reports) {
				$('#modalView').modal('show');
				vm.getLocation.lat = street_reports.sr_lat;
				vm.getLocation.lng = street_reports.sr_long;
				console.log(vm.getLocation.lng);
				console.log(vm.getLocation.lat);
				$('#streetReportMsg').html(street_reports.sr_msg);
				$('.thumbnail > img').attr('src', street_reports.sr_imgURL);

				var location = { lat: street_reports.sr_lat, lng: street_reports.sr_long };
		    	addMarker(location, map)
		    	var latlng = new google.maps.LatLng(location.lat, location.lng);
		    	map.setCenter(latlng);
				map.setZoom(16);
			}
		});
	}	
})();