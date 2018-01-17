(function() {
	'use strict';

	angular
	.module('app')
	.controller('VioFinesCtrl', VioFinesController);

	function VioFinesController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray) {
		
		// var list = $firebaseArray(ref);
		// var rec = list.$getRecord("foo"); // record with $id === "foo" or null
		//==========================================
		// Alert message IDs
		// var alertObject = {};
		// alertObject.strAlertDivID = "alertMessageDiv";
		// alertObject.strAlertDivTitle = "alertMessageTitle";
		// alertObject.strAlertDivBody = "alertMessageBody";
		// alertObject.strAlertDivClose = "alertMessageClose";
		// // $(document).ready(function(){
		// 	$(".btnDelete").click(function(){ 
		// 		alert("Hello! I am an alert box!!");}
		// 	});

			// $alertMessage("error","Something went wrong: "+ error, alertObject);
		// });


		var vm = this;
		var ref = firebase.database().ref();
		vm._fine_obj = {
			vf_name: '',
			vf_datestarted: new Date(),
			vf_status: 'active',
			vf_fine: '',
			vf_description: '',
		}
		vm.fine_obj = {};
		vm.loading = false;

		
		// download the data into a local object
		// synchronize the object with a three-way data binding
		// click on `index.html` above to see it used in the DOM!
		vm.dogs = $firebaseArray(ref.child('dogs'));
		vm.fine_list = $firebaseArray(ref.child('violation_fines'));

		vm.loading = true;
		vm.fine_list.$loaded().then(function() {
			vm.loading = false;
		});


		//vm.cats.$add({ code: "bar"}); for adding to database
		//==================================

		vm.addviolation_fine_modal = function() {
			vm.fine_obj = angular.copy(vm._fine_obj);
			$('#addFine').modal('show');
		}

		vm.editviolation_fine = function(id) {
			vm.edit_fine = $firebaseObject(ref.child('violation_fines').child(id));

			vm.edit_fine.$loaded().then(function() {
				// Parse date string to date object
				vm.edit_fine.vf_datestarted = moment(vm.edit_fine.vf_datestarted, 'MM-DD-YYYY').toDate();
			});
			$('#editFine').modal('show');
		}

		vm.save_fine = function(type) {
			if(type == 'add') {
				vm.fine_obj.vf_datestarted = moment(vm.fine_obj.vf_datestarted).format('MM-DD-YYYY');
				vm.fine_list.$add(vm.fine_obj).then(function(ref) {
					swal('Success!', 'Added New Data!', 'success');
					$('#addFine').modal('hide');
				}, function(error) {
					swal('Error!', error, 'error');
				});
			} else {
				// Parse date object to date string
				vm.edit_fine.vf_datestarted = moment(vm.edit_fine.vf_datestarted).format('MM-DD-YYYY');
				vm.edit_fine.$save().then(function(ref) {
				  swal('Success!', 'Updated!', 'success');
				  $('#editFine').modal('hide');
				}, function(error) {
				  swal('Error!', error, 'error');
				});

				
			}
		}

	}
	
})();