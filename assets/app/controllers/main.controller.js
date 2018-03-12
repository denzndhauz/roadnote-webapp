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
      

      vm.login_loading = true;
      auth.$signInWithEmailAndPassword(username, password).then(function(firebaseUser) {
        $state.go('home');
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

    function routeTo(name) {
      console.log(name);
      $state.go(name);
      console.log("aw");
    }
    vm.resetPassword = function(email){
      var verify;
      if(email == ''){
        swal('error','input must not be empty','error');
      }else{
        verify = validateEmail(email);
        if(!verify){
          swal('error','Invalid Email','error');
        }
        auth.$sendPasswordResetEmail(email).then(function() {
        console.log("Password reset email sent successfully!");
        }).catch(function(error) {
          console.error("Error: ", error);
          if(error.code == 'auth/user-not-found'){
            swal('error','user not found','error');
          }
          // else if(error.code =="auth/argument-error"){
          //   swal('error','input must not be empty','error');
          // }else if(error.code == 'auth/argument-error'){
          //   swal('error','input must not be empty','error')
          // }
        });
      }
    }
    vm.resetpassword_modal = function(){
      $('#forgotpass').modal('show');
    }
    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      console.log(re.test(String(email).toLowerCase()));
      return re.test(String(email).toLowerCase());
    }
  }
})();