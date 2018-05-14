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

    	console.log(vm.auth);
		vm.auth.$onAuthStateChanged(function(firebaseUser) {
			console.log(firebaseUser+":")
			if(firebaseUser){
				ref.child('admin_profile').orderByChild('admin_username').equalTo(firebaseUser.email).once('value').then(function(snapshot) {
					snapshot.forEach(function(admin_snapshot) {
						console.log(firebaseUser.email+"currently using");
						var admin_val = admin_snapshot.val()
						vm.level = admin_val.admin_level;
						if(vm.level != 2){
							$state.go('home');
						}
					})
				})
			}
	    });

		vm.createAccount = function(username, password, confirmPassword, firstName, middleName, familyName, birthDate, secretAnswer){
			var secQuestion = document.getElementById("secretQuestion");
			var admin_lvl = document.getElementById("admin_level");
			var textAdminLvl = admin_lvl.options[admin_lvl.selectedIndex].text;
			var textSQuestion = secQuestion.options[secQuestion.selectedIndex].text;
			var today = new Date();
			var logs = firebase.database().ref("activity_logs");
	        var dd = today.getDate();
	        var mm = today.getMonth()+1; //January is 0!
	        var yyyy = today.getFullYear();
	        today = mm + '/' + dd + '/' + yyyy;
	        vm.auth = auth;
	        var auth = Auth;	
	        vm.act_logs = {
				activity_admin: '',
				activity_date: '',
				activity_description: ''
			}

			if(!username || !firstName || !middleName || !familyName || !birthDate || !password || !confirmPassword || !secretAnswer){
				var msg = "";
				if(!username){
					msg += "Username must not be empty. <br>";
				}
				if(!firstName){
					msg += "First Name must not be empty. <br>";
				}
				if(!middleName){
					msg += "Middle Name must not be empty. <br>";
				}
				if(!familyName){
					msg += "Family Name must not be empty. <br>";
				}
				if(!birthDate){
					msg += "Birth Date must not be empty. <br>";
				}
				if(!password){
					msg += "Password must not be empty. <br>";
				}
				if(!confirmPassword){
					msg += "Confirm Password must not be empty. <br>";
				}
				if(!secretAnswer){
					msg += "SecretA nswer must not be empty. <br>";
				}
				swal('Error', msg,'error')
			}else{
				if(password != confirmPassword){
					swal('Error','password and confirm password must match','error')
				}else{
					var verifyFirstName = validateLength(firstName, 40);
					var verifyMiddleName = validateLength(middleName, 40);
					var verifyFamilyName = validateLength(familyName, 40);
					var verifyPassword = validateLength(password, 20);
					var verifySecretAnswer = validateLength(secretAnswer, 20);
					var verifyEmail = validateLength(username, 100);

					if(!verifyFirstName || !verifyMiddleName || !verifyFamilyName || !verifyPassword || !verifySecretAnswer || !verifyEmail){
						var errMsg ="";
						if(!verifyFirstName){
							errMsg += "First Name must be less than 41 characters. <br>";
						}if(!verifyMiddleName){
							errMsg += "Middle Name must be less than 41 characters. <br>";
						}if(!verifyFamilyName){
							errMsg += "Family Name must be less than 41 characters. <br>";
						}if(!verifyPassword){
							errMsg += "Password must be less than 21 characters. <br>";
						}if(!verifySecretAnswer){
							errMsg += "Secret Answer must be less than 21 characters. <br>";
						}if(!verifyEmail){
							errMsg += "Email must be less than 101 characters. <br>";
						}
						swal('Error', errMsg,'error');
					}else{	
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
								admin_level: textAdminLvl,
								admin_secretquestion: textSQuestion,
								admin_secretanswer: secretAnswer,
								admin_status: 'ACTIVE'
							}).then(function(ref){
								vm.auth.$onAuthStateChanged(function(firebaseUser) {
									if(firebaseUser){
										vm.act_logs.activity_admin = firebaseUser.uid;
										vm.act_logs.activity_date = today;
										vm.act_logs.activity_description = firebaseUser.email +" created an account for "+username+" as level "+textAdminLvl+" admin";
										$firebaseArray(logs).$add(vm.act_logs)
										vm.act_logs.activity_admin = '';
										vm.act_logs.activity_date = '';
										vm.act_logs.activity_description = '';
									}
							    });
							});

							//clear all fields
							$('#username').val("");
							$('#password').val("");
							$('#confirmPassword').val("");
							$('#admin_level').val(0);
							$('#firstName').val("");
							$('#middleName').val("");
							$('#familyName').val("");
							$('#birthDate').val("");
							$('#secretQuestion').val(0);
							$('#secretAnswer').val("");

							swal("success",'account is created','success');
						}).catch(function(error) {
							console.error("Error: ", error);
							if(error.code == 'auth/email-already-in-use'){
								swal('error','The email address is already in use by another account.','error');
							}else if(error.code == 'auth/weak-password'){
								swal('error','Password should be at least 6 characters','error');
							}else if(error.code == 'auth/invalid-email'){
								swal('Error','The email address is badly formatted.','error');
							}
						});
					}
				}				
			}
    	}

	    function validateLength(value,limit) {
	    	if(value.length <= limit){
	    		return true;
	    	}
	    	return false;
	    }
	}
})();
