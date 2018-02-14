(function() {
	'use strict';

	angular
	.module('app')
	.controller('CompCtrl', CompController);

	function CompController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage) {
		// var list = $firebaseArray(ref);
		// var rec = list.$getRecord("foo"); // record with $id === "foo" or null
		//==========================================
		var vm = this;
		var ref = firebase.database().ref();

		
		// download the data into a local object
		// synchronize the object with a three-way data binding
		// click on `index.html` above to see it used in the DOM!
		vm.dogs = $firebaseArray(ref.child('dogs'));
		vm.report_a_complain = $firebaseArray(ref.child('report_a_complain'));
		var storageRef = firebase.storage().ref("images");
    	vm.storage = $firebaseStorage(storageRef);

		//vm.cats.$add({ code: "bar"}); for adding to database
		//==================================
			//======
	}
	
})();