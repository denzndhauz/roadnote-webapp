(function() {
	'use strict';

	angular
	.module('app')
	.controller('VioFinesCtrl', VioFinesController);

	function VioFinesController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, Auth) {
		var vm = this;
		var ref = firebase.database().ref();
		vm.viofines = $firebaseArray(ref.child('violation_fines').orderByChild('vf_datestarted'));
		var ref = firebase.database().ref("violation_fines");
		vm.data = $firebaseArray(ref);
		var showErr;
		var errCount = 0;
		var auth = Auth;
		var logs = firebase.database().ref("activity_logs");
		var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
		vm.auth = auth;
		vm.violation_fines = {
			vf_name: '',
			vf_datestarted: '',
			vf_description: '',
			vf_fines: ''
		}
		vm.act_logs = {
			activity_admin: '',
			activity_date: '',
			activity_description: ''
		}
		//==========add

		 //======delete 

	 	 vm.deleteviolation_fines = function(vf){
		 	 	$('#modalConfirmDelete').modal('show');
		 	 	document.getElementById("confirmDeleteButton").onclick = function() {ConfirmDelete(vf)};
		 };

		 
		 function ConfirmDelete(vf){
		 	swal('Success!', 'Data is deleted successfully!', 'success');
		 	var refDel = firebase.database().ref();
		 	vm.auth.$onAuthStateChanged(function(firebaseUser) {
				if(firebaseUser){
					vm.act_logs.activity_admin = firebaseUser.uid;
					vm.act_logs.activity_date = today;
					vm.act_logs.activity_description = firebaseUser.email +" deleted the violation/fine named "+vf.vf_name;
					$firebaseArray(logs).$add(vm.act_logs)
					vm.act_logs.activity_admin = '';
					vm.act_logs.activity_date = '';
					vm.act_logs.activity_description = '';
				}
		    });
		 	refDel.child('violation_fines/'+vf.$id+'/').remove();
		 	$('#modalConfirmDelete').modal('hide');
		 }

		var vm = this;
		var ref = firebase.database().ref();
		vm._fine_obj = {
			vf_name: '',
			vf_datestarted: new Date(),
			vf_fines: '',
			vf_description: '',
		}
		vm.fine_obj = {};
		vm.loading = false;

		
		// download the data into a local object
		// synchronize the object with a three-way data binding
		// click on `index.html` above to see it used in the DOM!
		// vm.dogs = $firebaseArray(ref.child('dogs'));
		vm.fine_list = $firebaseArray(ref.child('violation_fines'));

		// console.log(vm.dogs+"dog");

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
			showErr = false;
			errCount = 0;
			if(type == 'add') {
				var nameAdd = document.getElementById("modalNameAdd").value;
				var descAdd = document.getElementById("modalDescAdd").value;
				var dateAdd = document.getElementById("modalDateAdd").value;
				var finesAdd = document.getElementById("modalFinesAdd").value;
				$('#modalAddFineErr').hide();
				$('#nameErrAdd').hide();
				$('#dateErrAdd').hide();
				$('#finesErrAdd').hide();
				if(nameAdd && dateAdd && finesAdd)
				{
					console.log("added!");
					vm.fine_obj.vf_datestarted = moment(vm.fine_obj.vf_datestarted).format('MM-DD-YYYY');
					vm.fine_list.$add(vm.fine_obj).then(function(ref) {
						vm.auth.$onAuthStateChanged(function(firebaseUser) {
							if(firebaseUser){
								vm.act_logs.activity_admin = firebaseUser.uid;
								vm.act_logs.activity_date = today;
								vm.act_logs.activity_description = firebaseUser.email +" added new violation/fine named "+nameAdd;
								$firebaseArray(logs).$add(vm.act_logs)
								vm.act_logs.activity_admin = '';
								vm.act_logs.activity_date = '';
								vm.act_logs.activity_description = '';
							}
					    });
						swal('Success!', 'Added New Data!', 'success');
						$('#addFine').modal('hide');
					}, function(error) {
						swal('Error!', error, 'error');
					});
				}else{
					if(!nameAdd){
						$('#nameErrAdd').show();
						errCount++;
					}
					if(!finesAdd){
						$('#finesErrAdd').show();
						errCount++;
					}
					if(!dateAdd){
						$('#dateErrAdd').show();
						if(dateAdd == ''){
							swal('Warning!', 'inputted day of the month does not exist!', 'error');
							if(errCount == 0){
								showErr = false;
							}else{
								showErr = true;
							}
						}
					}
					if(showErr == true){
						$('#modalAddFineErr').show();
					}
				}
			} else {
				var nameEdit = document.getElementById("modalNameEdit").value;
				var descEdit = document.getElementById("modalDescEdit").value;
				var dateEdit = document.getElementById("modalDateEdit").value;
				var finesEdit = document.getElementById("modalFinesEdit").value;
				$('#modalEditFineErr').hide();
				$('#nameErrEdit').hide();
				$('#dateErrEdit').hide();
				$('#finesErrEdit').hide();
				if(nameEdit && dateEdit && finesEdit)
				{
					vm.edit_fine.vf_datestarted = moment(vm.edit_fine.vf_datestarted).format('MM-DD-YYYY');
					vm.edit_fine.$save().then(function(ref) {
						vm.auth.$onAuthStateChanged(function(firebaseUser) {
							if(firebaseUser){
								vm.act_logs.activity_admin = firebaseUser.uid;
								vm.act_logs.activity_date = today;
								vm.act_logs.activity_description = firebaseUser.email +" edit violation/fine named "+nameEdit;
								$firebaseArray(logs).$add(vm.act_logs)
								vm.act_logs.activity_admin = '';
								vm.act_logs.activity_date = '';
								vm.act_logs.activity_description = '';
							}
					    });
					  swal('Success!', 'Updated!', 'success');
					  $('#editFine').modal('hide');
					}, function(error) {
					  swal('Error!', error, 'error');
					});
				}else{
					
					if(!nameEdit){
						$('#nameErrEdit').show();
						errCount++;
					}
					if(!finesEdit){
						$('#finesErrEdit').show();
						errCount++;
					}
					if(!dateEdit){
						$('#dateErrEdit').show();
						if(dateEdit == ''){
							swal('Warning!', 'inputted day of the month does not exist!', 'error');
							if(errCount == 0){
								showErr = false;
							}else{
								showErr = true;
							}
						}
					}
					if(showErr == true){
						$('#modalEditFineErr').show();
					}
				}
			}
		}
	}
	
})();