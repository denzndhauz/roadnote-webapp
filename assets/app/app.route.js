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
			}).state({
			    name: 'complain',
			    url: '/complain',
			    templateUrl: './assets/app/views/complain.html'
			}).state({
			    name: 'violationandfines',
			    url: '/violationandfines',
			    templateUrl: './assets/app/views/violationandfines.html'
			}).state({
			    name: 'developersmapping',
			    url: '/developersmapping',
			    templateUrl: './assets/app/views/developersmapping.html'
			});

		$urlRouterProvider.otherwise('/login');
	}
})();