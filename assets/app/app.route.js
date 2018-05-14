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
			    templateUrl: './assets/app/views/streetreport.html',
			    resolve: {
			    	"currentAuth": ["Auth", function(Auth) {
			          // $waitForSignIn returns a promise so the resolve waits for it to complete
			          return Auth.$requireSignIn();
        			}]
			    }
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
			    name: 'activity_logs',
			    url: '/activity_logs',
			    templateUrl: './assets/app/views/activity_logs.html',
			    resolve: {
			    	"currentAuth": ["Auth", function(Auth) {
			          // $waitForSignIn returns a promise so the resolve waits for it to complete
			          return Auth.$requireSignIn();
        			}]
			    }
			}).state({
			    name: 'signup',
			    url: '/signup',
			    templateUrl: './assets/app/views/signup.html',
			    resolve: {
			    	"currentAuth": ["Auth", function(Auth) {
			          // $waitForSignIn returns a promise so the resolve waits for it to complete
			          return Auth.$requireSignIn();
        			}]
			    }
			});
		$urlRouterProvider.otherwise('/login');
	}
})();