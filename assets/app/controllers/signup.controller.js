(function() {
	'use strict';

	angular
	.module('app')
	.controller('SignUpCtrl', SignUpController);

	function SignUpController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage, Auth) {
		var vm = this;
		var auth = Auth;
    	vm.auth = auth;
    	var ref = firebase.database().ref();
    	var admin_profile = $firebaseArray(ref.child('admin_profile'));


		vm.createAccount = function(username, password, confirmPassword, firstName, middleName, familyName, birthDate, secretAnswer){
		var verify;
		console.log(username);
		// var squestion = document.getElementById("secretQuestion").text;
		// var e = document.getElementById("secretQuestion");
		var e = document.getElementById("secretQuestion");
		var textSQuestion = e.options[e.selectedIndex].text;
		auth.$createUserWithEmailAndPassword(username, password)
		.then(function(firebaseUser) {
			console.log("User " + firebaseUser.uid + " created successfully!");
			admin_profile.$add({
				admin_uid: firebaseUser.uid,
				admin_username: username,
				admin_firstname: firstName,
				admin_middlename: middleName,
				admin_familyname: familyName,
				admin_birthdate: birthDate,
				admin_secretquestion: textSQuestion,
				admin_secretanswer: secretAnswer

			}).then(function(ref){

			});
			swal("success",'account is created','success');
		}).catch(function(error) {
			console.error("Error: ", error);
			if(error.code == 'auth/weak-password')
				swal('error','auth/weak-password','error');
		});


		// 	if(email == ''){
		// 	swal('error','input must not be empty','error');
		// }else{
		// 	verify = validateEmail(email);
		// if(!verify){
		//   swal('error','Invalid Email','error');
		// }
		// auth.$sendPasswordResetEmail(email).then(function() {
		// 	console.log("Password reset email sent successfully!");
		// }).catch(function(error) {
		//   console.error("Error: ", error);
		//   if(error.code == 'auth/user-not-found'){
		//     swal('error','user not found','error');
		//   }
		//   // else if(error.code =="auth/argument-error"){
		//   //   swal('error','input must not be empty','error');
		//   // }else if(error.code == 'auth/argument-error'){
		//   //   swal('error','input must not be empty','error')
		//   // }
		// });

		// }
   
      
    	}


	}

})();