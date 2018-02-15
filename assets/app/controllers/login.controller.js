(function() {
    'use strict';

	angular
	    .module('app')
	    .controller('AuthCtrl', AuthController);


	    function AuthController($scope, $firebaseAuth, $state) {
	    	var vm = this;
	    	var auth = $firebaseAuth();
	    	vm.login = user_auth;
	    	var user = auth.$getAuth();


	    	if (user) {
				$state.go('home');
			}

	    	vm.user = {
	    		email: '',
	    		password: ''
	    	}

	    	vm.login_loading = false;
	    	function user_auth(username, password) {
	    		vm.login_loading = true;
	    		auth.$signInWithEmailAndPassword(username, password).then(function(firebaseUser) {
			    	$state.go('complain');
			    vm.login_loading = false;
			  	}).catch(function(error) {
			    	console.log("Authentication failed:", error);
			    	if(error.code == 'auth/wrong-password') {
			    		swal(
						  'Oops...',
						  'Invalid Email/Password',
						  'error'
						)
			    	} else if(error.code == 'auth/too-many-requests') {
			    		swal(
						  'Oops...',
						  error.message,
						  'error'
						)
			    	}
			    vm.login_loading = false;
			  	});
	    	}
	    }
})();