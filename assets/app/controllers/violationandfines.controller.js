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
		
		vm.violation_fines = {
			vf_name: '',
			vf_datestarted: '',
			vf_description: '',
			vf_fines: '',
			vf_status: ''
		}
		
		//==========add
		vm.addviolation_fines = function(){
			vm.msg2="";
			console.log(vm.violation_fines);
			var ref = firebase.database().ref("violation_fines");
			$firebaseArray(ref).$add(vm.violation_fines)
			.then(
				function(ref){
					vm.violation_fines.vf_name = "";
					vm.violation_fines.vf_datestarted = "";
					vm.violation_fines.vf_description = "";
					vm.violation_fines.vf_status = "";

					$scope.msg2= "Student added successfully.";
					window.setTimeout(function(){
						$scope.$apply(function(){
							$scope.msg2 = false;
						})
					},2000)
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
		 	 	var refDel = firebase.database().ref();
		 	 	refDel.child('violation_fines/'+$id+'/').remove();


		 	//  vm.data
		 	// .$remove(info)
		 	// .then(
		 	// 	function(ref){
		 	// 		vm.msg1 = "violation/fine deleted successfully.";
		 	// 		window.setTimeout(function(){
		 	// 			vm.$apply(function(){
		 	// 				vm.msg1 = false;
		 	// 			})
		 	// 		},2000)
		 	// 		console.log(info);
		 	// 	},
		 	// 	function(error){
		 	// 		console.log(error);
		 	// 	}
		 	// 	)
		 };

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