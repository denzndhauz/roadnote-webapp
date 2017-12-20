(function() {
    'use strict';

	angular
	    .module('app')
	    .controller('MainCtrl', MainController);


	    function MainController($scope, $firebaseAuth) {
	    	var vm = this;
	    	var auth = $firebaseAuth();
	    	var user = auth.$getAuth();


	    	if (user) {
			  console.log("Signed in as:", user.uid);
			} else {
			  console.log("Signed out");
			}
	    }
})();