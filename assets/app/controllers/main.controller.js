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
      var verify = validateEmail(username);
      username = document.getElementById("username").value;
      password = document.getElementById("password").value;
      if(!username || !password){
        swal(
          'Oops...',
          'Email/Password cannot be empty',
          'error'
          )
      }else if(verify == false){
        swal(
          'Oops...',
          'Email is not valid',
          'error'
          )
        vm.login_loading = false;
      }
      function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }

      vm.login_loading = true;
      auth.$signInWithEmailAndPassword(username, password).then(function(firebaseUser) {
        $state.go('home');
        vm.login_loading = false;
      }).catch(function(error) {
        console.log("Authentication failed:", error);
        console.log(error.code);
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
                //=================for sign in======================
        //  else if(error.code == 'auth/email-already-in-use'){
        //     var credential = firebase.auth.EmailAuthProvider.credential(email, password);

        //     app.signInWithGoogle()
        //       .then(function(){
        //         firebase.auth().currentUser.link(credential)
        //           .then(function(user){
        //             console.log("Account linking success", user);
        //           }, function(error){
        //             console.log("Account linking error", error);
        //           });
        //       });
        // }
         else if(error.code == 'auth/user-not-found'){
          'Oops...',
          'User not found',
          'error'
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

      var user2 = firebase.auth().currentUser;

      if (user2 != null) {
        user2.providerData.forEach(function (user_profile) {
          console.log("Sign-in provider: " + user_profile.providerId);
          console.log("Provider-specific UID: " + user_profile.uid);
          console.log("  Name: " + user_profile.displayName);
          console.log("  Email: " + user_profile.email);
          // console.log("  Photo URL: " + profile.photoURL);
        });
      }
    }
  }
})();