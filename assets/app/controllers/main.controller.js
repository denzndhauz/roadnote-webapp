(function() {
  'use strict';

  angular
  .module('app')
  .controller('MainCtrl', MainController);

// $scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage
  function MainController($scope, $rootScope, $firebaseAuth ,$firebaseObject , $firebaseArray, $state, NgMap, Auth) {
    var vm = this;
    var auth = Auth;
    var ref = firebase.database().ref();

    vm.auth = auth;
    vm.login = user_auth;
    vm.is_loggedin = false;
    vm.routeTo = routeTo;
    vm.login_loading = false; 
    // vm.admin_level = 1;

    vm.auth.$onAuthStateChanged(function(firebaseUser) {
      if(firebaseUser){
        vm.auth_user = angular.copy(firebaseUser);
        vm.is_loggedin = true;
        console.log(vm.auth_user.uid)
        vm.getuser = firebaseUser;
        ref.child('admin_profile').orderByChild('admin_username').equalTo(firebaseUser.email).once('value').then(function(snapshot) {
          snapshot.forEach(function(admin_snapshot) {
            var admin_val = admin_snapshot.val();
            vm.admin_level = admin_val.admin_level;
            console.log("admin name "+firebaseUser.email);
            console.log("admin level:"+vm.admin_level);
            if(vm.admin_level != 2){
              $state.go('home');
            }
          })
        })

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

    function user_auth(username, password) {
      var verify = validateEmail(username);
      username = document.getElementById("username").value;
      password = document.getElementById("password").value;
      if(!username || !password){
        var msg = "";
        if(!username){
          msg += "Username must not be empty. <br>";
        }
        if(!password){
          msg += "Password must not be empty. <br>";
        }
        swal(
          'Oops...',
          msg,
          'error'
          )
      }else if(verify == false){
        swal(
          'Oops...',
          'Email is not valid',
          'error'
          )
        vm.login_loading = false;
      }else{
        ref.child('admin_profile').once('value').then(function(snapshot) {
          snapshot.forEach(function(ap_snapshot) {
            var ap = ap_snapshot.val();
            
            if(username == ap.admin_username){
              console.log(ap.admin_username)
              vm.login_loading = true;
              vm.admin_level = ap.admin_level;
              console.log(ap.admin_level)
              console.log("admin"+vm.admin_level)
              auth.$signInWithEmailAndPassword(username, password).then(function(firebaseUser) {
                $state.go('home');
                vm.login_loading = false;
              }).catch(function(error) {
                console.log("Authentication failed:", error);
                if(error.code === 'auth/user-not-found'){
                  'Oops...',
                  'User not found',
                  'error'
                }else if(error.code == 'auth/wrong-password') {
                  swal(
                    'Oops...',
                    'Wrong Email/Password',
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
                  'Wrong Email/Password',
                  'error'
                  )
                }
                vm.login_loading = false;
              });
            }
          });
        });   
      }
    }

    function routeTo(name) {
      console.log((name));
      if(name == "activity_logs" || name == "signup"){
        vm.auth.$onAuthStateChanged(function(firebaseUser) {
          if(firebaseUser){
            ref.child('admin_profile').orderByChild('admin_username').equalTo(firebaseUser.email).once('value').then(function(snapshot) {
              snapshot.forEach(function(admin_snapshot) {
                var admin_val = admin_snapshot.val();
                vm.level = admin_val.admin_level;
                console.log("admin name "+firebaseUser.email);
                console.log("admin level:"+vm.level);
                if(vm.level != 2){
                  $state.go('home');
                }
              })
            })
          }
        });
      }else{
        $state.go(name);
      }
    }
    
    vm.resetPassword = function(email,secAnswer){
      var verify;

      if(!email || !secAnswer){
        var msg = "";
        if(!email){
          msg += "Email must not be empty. <br>";
        }
        if(!secAnswer){
          msg += "Secret answer must not be empty.";
        }
        swal('Error', msg,'error');
      }else{
        verify = validateEmail(email);
        if(!verify){
          swal('Error','Invalid Email','error');
        }else{
          var e = document.getElementById("secretQuestion");
          var textSQuestion = e.options[e.selectedIndex].text;
          ref.child('admin_profile').once('value').then(function(snapshot) {
            var verified_to_reset = false;
            snapshot.forEach(function(admin_snapshot) {
              var ap = admin_snapshot.val();
              if(ap.admin_secretanswer == secAnswer && ap.admin_secretquestion == textSQuestion && ap.admin_username == email){
                console.log("ni sud diri")
                verified_to_reset = true;  
                auth.$sendPasswordResetEmail(email).then(function() {
                  $('#email').val("");
                  $('#secretQuestion').val(0);
                  $('#secretAnswer').val("");
                  $('#forgotpass').modal('hide');
                  swal('success',"Password reset is sent to your email successfully!",'success');
                }).catch(function(error) {
                  console.error("Error: ", error);
                  if(error.code == 'auth/user-not-found'){
                    swal('error','Invalid Credentials','error');
                  }
                });
              }
            });
              if(!verified_to_reset){
                swal('Error','Invalid credentials','error');
              }
          });
        }
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

    function validateLength(value,limit) {
      if(value.length <= limit){
        return true;
      }
      return false;
    }

  }
})();