(function() {
    'use strict';

	angular
	    .module('app', ['ui.router', 'firebase', 'ngMap'])
	    .run(run)
	    .config(['$qProvider', function ($qProvider) {
		    $qProvider.errorOnUnhandledRejections(false);
		}]);
	    
	function run($rootScope, $state) {
	  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
	    if (error === "AUTH_REQUIRED") {
	      $state.go("login");
	    }
	  });
	}

})();