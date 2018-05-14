(function() {
	'use strict';

	angular
	.module('app')
	.controller('SReportCtrl', StreetReportController);

	function StreetReportController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage, NgMap, Auth) {
	
		var vm = this;
		var ref = firebase.database().ref();
		var marker;
		vm.report_a_complain = $firebaseArray(ref.child('street_reports').orderByChild('sr_date'));
		var auth = Auth;
		vm.auth = auth;
		var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        var markersArray = [];
		// var getval = document.getElementById("value").value;
		// console.log(getval);
		vm.getLocation = {
			lat: 0,
			lng: 0
		}
		vm.updateSr_status = function(sr) {
			console.log(sr.$id)
			//needs to $update
			var sr_update = $firebaseObject(ref.child('street_reports').child(sr.$id));

			// console.log(sr_update);
			// ref.child('street_reports').once('value').then(function(snapshot){
   //      		snapshot.forEach(function(sr_snapshot){
   //      			console.log("wawawee")
   //      			var sr_snap = sr_snapshot.val();

   //      			 if(sr.$id == sr_snapshot.key){
   //      			 	sr_update.sr_date = sr_snap.sr_date;
   //      			 	sr_update.sr_imgURL = sr_snap.sr_imgURL;
   //      			 	sr_update.sr_lat = sr_snap.sr_lat;
   //      			 	sr_update.sr_long = sr_snap.sr_long;
   //      			 	sr_update.sr_msg = sr_snap.sr_msg;
   //      			 	sr_update.sr_reportedby = sr.sr_reportedby;
   //      			 	sr_update.sr_status = sr.sr_status;

   //      			 	sr_update.$save().then(function(ref) {
   //                          toastr.success('You Mark it as '+sr.sr_status, 'You Successfully changed')
   //                      }, function(error) {
   //                          console.log("Error:", error);
   //                      });
   //      			 }
   //      		});
   //      	});

			//==================================================
			vm.auth.$onAuthStateChanged(function(firebaseUser) {
				vm.act_logs = {
					activity_admin: '',
					activity_date: '',
					activity_description: ''
				}
				if(firebaseUser){
					var logs = firebase.database().ref("activity_logs");
					vm.act_logs.activity_admin = firebaseUser.uid;
					vm.act_logs.activity_date = today;
					vm.act_logs.activity_description = firebaseUser.email +" mark the report of "+sr.sr_reportedby +" to "+ sr.sr_status;
					$firebaseArray(logs).$add(vm.act_logs)
				}
		    });
			sr_update.sr_date = sr.sr_date;
		 	sr_update.sr_imgURL = sr.sr_imgURL;
		 	sr_update.sr_lat = sr.sr_lat;
		 	sr_update.sr_long = sr.sr_long;
		 	sr_update.sr_msg = sr.sr_msg;
		 	sr_update.sr_reportedby = sr.sr_reportedby;
		 	sr_update.sr_status = sr.sr_status;
        	sr_update.$save().then(function(ref) {
                toastr.success('You Mark it as '+sr.sr_status, 'You Successfully changed')
            }, function(error) {
                console.log("Error:", error);
            });
		}
	    function getmodalLocation(){			
			$('#modalView').modal('hide');
			$('#modalLocation').modal('show');
		}	
	    document.getElementById("locationView").onclick = function() {getmodalLocation()};
		NgMap.getMap().then(function(map) {
			vm.modalView = modalView;
			function modalView(street_reports) {
				$('#modalView').modal('show');
				vm.getLocation.lat = street_reports.sr_lat;
				vm.getLocation.lng = street_reports.sr_long;
				$('#streetReportMsg').html(street_reports.sr_msg);
				$('.thumbnail > img').attr('src', street_reports.sr_imgURL);
				var location = { lat: street_reports.sr_lat, lng: street_reports.sr_long };
		    	var latlng = new google.maps.LatLng(location.lat, location.lng);
	            marker = new google.maps.Marker({
                    position: new google.maps.LatLng(location.lat, location.lng),
                    map: map,
                });
		    	map.setCenter(latlng);
				map.setZoom(16);
			}
		});	
		
	}	
})();