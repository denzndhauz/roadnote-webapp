(function() {
	'use strict';

	angular
	.module('app')
	.controller('CompCtrl', CompController);

	function CompController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray) {
		var vm = this;
		var ref = firebase.database().ref();
		// download the data into a local object
		// synchronize the object with a three-way data binding
		// click on `index.html` above to see it used in the DOM!
		vm.dogs = $firebaseArray(ref.child('dogs'));
		vm.cats = $firebaseArray(ref.child('cats'));
		vm.cats.$add({





		})
	}
})();