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
			    name: 'streetreport',
			    url: '/streetreport',
			    templateUrl: './assets/app/views/streetreport.html'
			}).state({
			    name: 'violationandfines',
			    url: '/violationandfines',
			    templateUrl: './assets/app/views/violationandfines.html'
			}).state({
			    name: 'history',
			    url: '/history',
			    templateUrl: './assets/app/views/history.html'
			}).state({
			    name: 'todelete',
			    url: '/todelete',
			    templateUrl: './assets/app/views/todelete.html'
			});

		$urlRouterProvider.otherwise('/login');
	}
})();