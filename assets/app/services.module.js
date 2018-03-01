(function() {
    'use strict';

	angular
	    .module('app')
	    .factory('Auth', Auth);


	function Auth($firebaseAuth) {
		return $firebaseAuth();
	}
})();