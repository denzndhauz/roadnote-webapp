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
			    templateUrl: './assets/app/views/login.html',
			    resolve: {
			    	"currentAuth": ["Auth", function(Auth) {
			          // $waitForSignIn returns a promise so the resolve waits for it to complete
			          return Auth.$waitForSignIn();
        			}]
			    }
			}).state({
			    name: 'home',
			    url: '/home',
			    templateUrl: './assets/app/views/home.html',
			    resolve: {
			    	"currentAuth": ["Auth", function(Auth) {
			          // $waitForSignIn returns a promise so the resolve waits for it to complete
			          return Auth.$requireSignIn();
        			}]
			    }
			}).state({
			    name: 'streetreport',
			    url: '/streetreport',
			    templateUrl: './assets/app/views/streetreport.html'
			}).state({
			    name: 'violationandfines',
			    url: '/violationandfines',
			    templateUrl: './assets/app/views/violationandfines.html',
			    resolve: {
			    	"currentAuth": ["Auth", function(Auth) {
			          // $waitForSignIn returns a promise so the resolve waits for it to complete
			          return Auth.$requireSignIn();
        			}]
			    }
			}).state({
			    name: 'history',
			    url: '/history',
			    templateUrl: './assets/app/views/history.html'
			}).state({
			    name: 'todelete',
			    url: '/todelete',
			    templateUrl: './assets/app/views/todelete.html'
			}).state({
			    name: 'signup',
			    url: '/signup',
			    templateUrl: './assets/app/views/signup.html'
			});

		$urlRouterProvider.otherwise('/login');
	}
})();