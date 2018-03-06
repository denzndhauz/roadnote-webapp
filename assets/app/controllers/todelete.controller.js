(function() {
	'use strict';

	angular
	.module('app')
	.controller('ToDelCtrl', ToDeleteController);

	function ToDeleteController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, $firebaseStorage, NgMap) {
		var ref = firebase.database().ref();
		var road_block_sign = $firebaseArray(ref.child('road_block'));
		var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        // var min = today.getMinutes();
        // var hh = today.getHour();
        var roadblockcolor = '#fbff16';
        console.log(today);
        var vm = this;
       	vm.allShapes = [];
        // dd + 1;
        // if(dd<10) {
        //     dd = '0'+dd
        // } 
        // if(mm<10) {
        //     mm = '0'+mm
        // } 
        //retrieve data from road_block

        var now = Date.now();
        console.log(now);
        var cutoff = now - 2 * 60 * 60 * 1000;
        cutoff =  moment(cutoff).format();   
        console.log(cutoff);
        var cutoff = cutoff.split(":");
        var timecutoff=cutoff[0]+':'+cutoff[1];
        console.log(timecutoff)

        // var autoDelete = firebase.database().ref('/roadblock');
        // var old = autoDelete.orderByChild('rb_enddatetime').endAt(timecutoff);
        // var listener = old.on('child_added', function(snapshot) {
        //     var roadblock = snapshot.val();
        //     console.log("i reach here");
        //     toastr.error('System auto delete '+roadblock);
        //     snapshot.ref.remove();
        // });

        ref.child('road_block').once('value').then(function(snapshot) {
            snapshot.forEach(function(userSnapshot) {
                var rb = userSnapshot.val();
                var color = '';
                var paths = [];
                color = roadblockcolor;
                //check what type is rb_coordinates in firebase
                console.log(rb.rb_enddatetime)
                if(rb.rb_enddatetime > timecutoff){
                    console.log(rb.rb_enddatetime+"rb endtime")
                    console.log(timecutoff+"cut off")
                    console.log("i reach here");
                    toastr.error('System auto delete roadblock');
                    snapshot.ref.remove();
                    ref.child('roadblock/'+snapshot.key+'/').remove();
                }else{
                    if(typeof rb.rb_coordinates == 'object') {
                        rb.rb_coordinates.forEach(function(coordinate) {
                            paths.push([coordinate.lat, coordinate.long]);
                        });
                    }
                    vm.allShapes.push({
                        id: userSnapshot.key,
                        name: 'polygon',
                        color: color,
                        paths: paths,
                        type: 'RB',
                        rb_datecreated: rb.rb_datecreated,
                        rb_desc: rb.rb_desc,
                        rb_enddatetime: rb.rb_enddatetime,
                        rb_name: rb.name,
                        rb_startdatetime: rb.strartdatetime
                    });
                }
                
            });
        });
  

	NgMap.getMap().then(function(map) {
          // init(map);
        var cebu = {
            lat: 10.3383039,
            lng: 123.911486 
        }
        var latlng = new google.maps.LatLng(cebu.lat, cebu.lng);
        map.setCenter(latlng);
        map.setZoom(16);
    });

	}
})();