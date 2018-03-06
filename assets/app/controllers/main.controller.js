(function() {
  'use strict';

  angular
  .module('app')
  .controller('MainCtrl', MainController);

// $scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage
  function MainController($scope, $rootScope, $firebaseAuth, $firebaseArray, $state, NgMap, Auth) {
    var vm = this;
    var auth = Auth;
    vm.auth = auth;
    vm.login = user_auth;
    // vm.authObj = Auth.$getAuth();
    // vm.auth_user = user;
    vm.is_loggedin = false;

    vm.auth.$onAuthStateChanged(function(firebaseUser) {
      if(firebaseUser){
        vm.auth_user = angular.copy(firebaseUser);
        vm.is_loggedin = true;
      } else {
        $state.go('login');
        vm.is_loggedin = false;
      }
    });

    vm.logout = function() {
      vm.auth.$signOut();
      $state.go('login');
      vm.is_loggedin = false;
    }

    vm.user = {
      email: '',
      password: ''
    }

    vm.login_loading = false;
    function user_auth(username, password) {
      vm.login_loading = true;
      auth.$signInWithEmailAndPassword(username, password).then(function(firebaseUser) {
        console.log(firebaseUser);
        $state.go('complain');
        vm.login_loading = false;
      }).catch(function(error) {
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

    function routeTo(name) {
      $state.go(name);
      console.log("aw");
    }
  }
})();