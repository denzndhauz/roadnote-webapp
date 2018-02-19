(function() {
	'use strict';

	angular
	.module('app')
	.controller('CompCtrl', CompController);

	function CompController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage) {

		var vm = this;
		var ref = firebase.database().ref();

		vm.report_a_complain = $firebaseArray(ref.child('street_reports'));
		var storageRef = firebase.storage().ref("images");
    	vm.storage = $firebaseStorage(storageRef);

	}
	
})();