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

		
		// download the data into a local object
		// synchronize the object with a three-way data binding
		// click on `index.html` above to see it used in the DOM!
		vm.dogs = $firebaseArray(ref.child('dogs'));
		vm.viofines = $firebaseArray(ref.child('violation_fines'));


		//vm.cats.$add({ code: "bar"}); for adding to database
		//==================================

	}
	
})();