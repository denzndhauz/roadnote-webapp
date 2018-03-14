(function() {
	'use strict';

	angular
	.module('app')
	.controller('HistContrl', HistoryController);

	function HistoryController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage) {
		// var list = $firebaseArray(ref);
		// var rec = list.$getRecord("foo"); // record with $id === "foo" or null
		//==========================================
		var vm = this;
		var ref = firebase.database().ref();
		vm.act_log = $firebaseArray(ref.child('activity_logs'));
	}
	
})();