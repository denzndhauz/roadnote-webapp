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
		var temp = $firebaseArray(ref.child('activity_logs'));
		vm.act_log = temp;
		// vm.act_log = temp.reverse();
		console.log($firebaseArray(ref.child('activity_logs').orderByKey()));
		// console.log(vm.act_log = $firebaseArray(ref.child('activity_logs').orderByChild('activity_date')));
	}
	
})();


// (function() {
// 	'use strict';

// 	angular
// 	.module('app')
// 	.controller('HistContrl', HistoryController);

// 	function HistoryController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage) {
// 		// var list = $firebaseArray(ref);
// 		// var rec = list.$getRecord("foo"); // record with $id === "foo" or null
// 		//==========================================
// 		var vm = this;
// 		var ref = firebase.database().ref();
// 		var temp = $firebaseArray(ref.child('activity_logs').orderByKey());
// 		console.log(temp);
// 		console.log(temp.reverse);
// 		vm.act_log = temp.reverse;

// 		// vm.act_log = $firebaseArray(ref.child('activity_logs').orderByKey());
// 		// vm.act_log = $firebaseArray(ref.child('activity_logs').orderByChild('activity_date'));
// 	}
	
// })();