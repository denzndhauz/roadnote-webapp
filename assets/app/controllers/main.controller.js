(function() {
  'use strict';

  angular
  .module('app')
  .controller('MainCtrl', MainController);

  function MainController($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseStorage, $state, NgMap) {
    var vm = this;
    var auth = $firebaseAuth();
    vm.login = user_auth;
    var user = auth.$getAuth();
    vm.routeTo = routeTo;

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (user && toState.name == 'login') {
        $state.go('home');
      }
    });

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
        }else{
          swal(
          'Oops...',
          'Invalid Email/Password',
          'error'
        )
        }
      vm.login_loading = false;
      });
    }

    if (user) {
      console.log("Signed in as:", user.uid);
    } else {
      console.log("Signed out");
    }
    function routeTo(name) {
      console.log(name);
      $state.go(name);
    }

  }
})();