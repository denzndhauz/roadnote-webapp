(function() {
    'use strict';

	angular
	    .module('app')
	    .config(Config);

	function Config($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state({
			    name: 'login',
			    url: '/login',
			    templateUrl: './assets/app/views/login.html'
			}).state({
			    name: 'home',
			    url: '/home',
			    templateUrl: './assets/app/views/home.html'
			});

		$urlRouterProvider.otherwise('/login');
	}
})();