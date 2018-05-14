(function() {
	'use strict';

	angular
	.module('app')
	.controller('ActLogsContrl', ActivityLogsController);

	function ActivityLogsController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage, Auth) {
		var vm = this;
		var ref = firebase.database().ref();
		var temp = $firebaseArray(ref.child('activity_logs'));
		vm.auth = Auth;
		vm.act_log = temp;

		vm.auth.$onAuthStateChanged(function(firebaseUser) {
			if(firebaseUser){
				ref.child('admin_profile').orderByChild('admin_username').equalTo(firebaseUser.email).once('value').then(function(snapshot) {
					snapshot.forEach(function(admin_snapshot) {
						var admin_val = admin_snapshot.val()
						vm.level = admin_val.admin_level;
						if(vm.level != 2){
		                  $state.go('home');
		                }
					})
				})
			}
	    });
	}
})();
