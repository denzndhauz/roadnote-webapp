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


		


		NgMap.getMap().then(function(map) {
			document.getElementById("locationView").onclick = function() {modalLocation()};

			vm.modalView = modalView;
			function modalView(id) {
				$('#modalView').modal('show');
				console.log(id.sr_date);
			}
			function modalLocation(){
				$('#modalView').modal('hide');
				$('#modalLocation').modal('show');
				console.log(document.getElementById("sr_id").value);

			}	
			vm.map = map;
			// init(map);
			var cebu = {
				lat: 10.3383039,
				lng: 123.911486 
			}
				var latlng = new google.maps.LatLng(cebu.lat, cebu.lng);
				map.setCenter(latlng);
				map.setZoom(16);
		    
		});

	}	
})();