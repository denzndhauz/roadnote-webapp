(function() {
    'use strict';

	angular
	    .module('app')
	    .controller('MainCtrl', MainController);


	    function MainController($scope, $firebaseAuth, $state) {
	    	var vm = this;
	    	var auth = $firebaseAuth();
	    	var user = auth.$getAuth();
	    	vm.routeTo = routeTo;


	    	if (user) {
			  console.log("Signed in as:", user.uid);
			} else {
			  console.log("Signed out");
			}

			function routeTo(name) {
				$state.go(name);
			}
	    }
})();