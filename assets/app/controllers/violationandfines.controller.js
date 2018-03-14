(function() {
	'use strict';

	angular
	.module('app')
	.controller('VioFinesCtrl', VioFinesController);

	function VioFinesController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray) {
		var vm = this;
		var ref = firebase.database().ref();
		vm.viofines = $firebaseArray(ref.child('violation_fines'));
		var ref = firebase.database().ref("violation_fines");
		vm.data = $firebaseArray(ref);
		var showErr;
		var errCount = 0;

		vm.violation_fines = {
			vf_name: '',
			vf_datestarted: '',
			vf_description: '',
			vf_fines: ''
		}
		//==========add
		vm.addviolation_fines = function(){
			vm.msg2="";
			

			var ref = firebase.database().ref("violation_fines");
			$firebaseArray(ref).$add(vm.violation_fines)
			.then(
				function(ref){
					console.log(ref);

					vm.violation_fines.vf_name = "";
					vm.violation_fines.vf_datestarted = "";
					vm.violation_fines.vf_description = "";

					// $scope.msg2= "Student added successfully.";
					// window.setTimeout(function(){
					// 	$scope.$apply(function(){
					// 		$scope.msg2 = false;
					// 	})
					// },2000)
				},
				function(error){
					console.log(error);
				}
				)
		};

		 //======delete 

	 	 vm.deleteviolation_fines = function($id){
		 	 	//$id = key
		 	 	//remove
		 	 	console.log($id);
		 	 	$('#modalConfirmDelete').modal('show');
		 	 	document.getElementById("confirmDeleteButton").onclick = function() {ConfirmDelete($id)};
		 		
		 };

		 
		 function ConfirmDelete($id){

		 	swal('Success!', 'Data is deleted successfully!', 'success');
		 	var refDel = firebase.database().ref();
		 	refDel.child('violation_fines/'+$id+'/').remove();
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
					
					vm.fine_obj.vf_datestarted = moment(vm.fine_obj.vf_datestarted).format('MM-DD-YYYY');
					vm.fine_list.$add(vm.fine_obj).then(function(ref) {
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