(function() {
	'use strict';

	angular
	.module('app')
	.controller('HomeCtrl', HomeController);

	function HomeController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray ,NgMap) {
        var getlong,getlat;//latitude longitude
        var gen_title,gen_desc;//general news
		var vm = this;
        vm.traffic_signs = {
            np: false,
            nj: false,
            nsa: false,
            taz: false,
            nul: false,
            rb: false
        }
        var ref = firebase.database().ref();
        var general_news = $firebaseArray(ref.child('general_news'));
        var road_block_sign = $firebaseArray(ref.child('road_block'));
        var traffic_road_sign = $firebaseArray(ref.child('traffic_road_sign'));
        var remarks = '',title = '', DateTS='',DateTE = '', TRStype = '', TRSdesc = '';
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var noParking = '#ed0b0b',noJayWalking = '#0011ff',noStoppingAnytime = '#00ffff',towAwayZone = '#00ff00'
                , noLoadingOrUnloading = '#FF00CE', roadblockcolor = '#000000';
                //roadblock = black, no parking = red, no jaywalking  = blue, no stopping anytime = skyblue, tow away zone = green, 
                //no loading or unloading = violet
        var updateRoad_sign,timestampCompare = 0,year;
        if(dd<10) {
            dd = '0'+dd
        } 
        if(mm<10) {
            mm = '0'+mm
        } 
        today = mm + '/' + dd + '/' + yyyy;

        vm.toggleTrafficSigns = toggleTrafficSigns;
        function toggleTrafficSigns(type) {
            vm.traffic_signs[type] = !vm.traffic_signs[type];
        }

    //==================================================================

        vm.allShapes = [];//stores geofence paths, colors, key and type if it is traffic road sign or roadblock
        //retrieve data from traffic_road_sign
        ref.child('traffic_road_sign').once('value').then(function(snapshot) {
            snapshot.forEach(function(userSnapshot) {
                var trs = userSnapshot.val();
                var color = '';
                var paths = [];
                if(trs.road_sign == 'No Stopping Anytime')
                    color = noStoppingAnytime;
                else if(trs.road_sign == 'No Jaywalking')
                    color = noJayWalking;
                else if(trs.road_sign == 'Tow Away Zone')
                    color = towAwayZone;
                else if(trs.road_sign == 'No Parking')
                    color = noParking;
                else if(trs.road_sign == 'No Loading/Unloading')
                    color = noLoadingOrUnloading;

                if(typeof trs.road_sign_coordinates == 'object') {
                    trs.road_sign_coordinates.forEach(function(coordinate) {
                        paths.push([coordinate.lat, coordinate.long]);
                    });
                }

                vm.allShapes.push({
                    id: userSnapshot.key,
                    name: 'polygon',
                    color: color,
                    paths: paths,
                    type: 'TRS',
                    
                });
            });
        });
        //retrieve data from road_block
        ref.child('road_block').orderByChild('rb_status').equalTo('ACTIVE').once('value').then(function(snapshot) {
            snapshot.forEach(function(userSnapshot) {
                var rb = userSnapshot.val();
                var color = '';
                var paths = [];
                color = roadblockcolor;

                var now = Date.now();
                console.log(now+":now");
                var cutoff = now - 2 * 60 * 60 * 1000;
                cutoff =  moment(cutoff).format();   
                console.log(cutoff);
                var cutoff = cutoff.split(":");
                var timecutoff=cutoff[0]+':'+cutoff[1];
                if(now < Date.parse(rb.rb_enddatetime))
                    console.log("wajajahahh");
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
                });
            });
        });

  //==========================================================
    NgMap.getMap().then(function(map) {
        vm.map = map;

        var cebu = {
            lat: 10.3383039,
            lng: 123.911486 
        }
        vm.addLine = function() {
            vm.map.shapes.polygon.setMap(vm.map);
        }
        
        var latlng = new google.maps.LatLng(cebu.lat, cebu.lng);
        map.setCenter(latlng);
        map.setZoom(16);

        vm.onMapOverlayCompleted = function(e) {

            e.setDraggable(true);//to make paths draggable
            e.setEditable(true);//to make paths editable
            var pointMinimum = 0;//minimum of the points
            
            e.getPath().getArray().forEach(function(v, k) {
                pointMinimum++;       
            });
            if(pointMinimum <= 2){
                swal("Plotted Points must be greater than two", "You clicked the button!", "error");
            }
            else{

                $('#modalRBorRS').modal('show');//shows modal to choose if road block or road sign
                $("#roadblock").click(function(){
                 
                    $('#modalRBorRS').modal('toggle');
                    $('#modalroadblock').modal('show');

                    document.getElementById("modalRBSaveButton").onclick = function() {RoadBlockVerify()};
                    // document.getElementById("modalTRSErrorMsg").onclick = function() {TrafficRoadSignVerify()};    

                });

                $("#roadsign").click(function(){
                    $('#modalRBorRS').modal('toggle');
                    $('#modalTrafficRoadSign').modal('show');

                    document.getElementById("modalTRSSaveButton").onclick = function() {TrafficRoadSignVerify()};
                    // document.getElementById("modalTRSErrorMsg").onclick = function() {TrafficRoadSignVerify()};    

                }); 
                //event listener for drag
                google.maps.event.addListener(e, 'dragend', function (event) {
                    e.getPath().getArray().forEach(function(v, k) {
                        console.log(v.lat(), v.lng());
                    })
                });
                function RoadBlockAdd(){
                    
                    var coordinates = [];
                    e.getPath().getArray().forEach(function(v, k) {
                       coordinates.push({lat:v.lat(),long:v.lng()});
                    });

                    road_block_sign.$add({ 
                        rb_name: title,
                        rb_desc: remarks,
                        rb_startdatetime: DateTS,
                        rb_enddatetime: DateTE,
                        rb_datecreated: today,
                        rb_status: 'ACTIVE',
                        rb_coordinates: coordinates
                    }).then(function(ref) {
                        swal("Success", "New Roadblock Successfully Added!", "success")
                        // location.reload();
                        GeneralNewsDetails();
                        setTimeout(function () {
                            swal.close()
                            // location.reload();
                        }, 2000);
                        $('#modalRBorRS').modal('hide');
                    });
                    
                }
                function RoadBlockVerify() {

                    remarks = document.getElementById("modalRBDesc").value;
                    title = document.getElementById("modalRBTitle").value;
                    DateTS = document.getElementById("modalRBDateTS").value;
                    DateTE = document.getElementById("modalRBDateTE").value;
                    remarks = remarks.toString();
                    title = title.toString();
                    DateTS = DateTS.toString();
                    DateTE = DateTE.toString();
                    var getDateTS = DateTS.split('-');
                    getDateTS = getDateTS[2].split('T');
                    console.log(getDateTS[0]);
                    timestampCompare = DateTE.localeCompare(DateTS);

                    //==============================================
                    console.log(DateTE+":date");

                    //=============================================

                    $('#modalRBErrorMsghider').hide();
                    $('#modalReasonErrRB').hide();
                    $('#modalDateStartErrRB').hide();
                    $('#modalDateEndErrRB').hide();
                    //remarks is not necessary
                    // !remarks || 
                    console.log(title+":title");
                    console.log(DateTS+":DateTS");
                    console.log(DateTE+":DateTE");

                    if(!title || DateTS == "" || DateTE == "" ){
                        $('#modalRBErrorMsghider').show();
                        // if(!desc){
                        //     $('#nameErrAdd').show();
                        // }
                        if(!title){
                            $('#modalReasonErrRB').show();
                        }
                        if(!DateTS){
                            $('#modalDateStartErrRB').show();
                        }
                        if(!DateTE){
                            $('#modalDateEndErrRB').show();
                        }
                    }
                    else
                    {
                        if(timestampCompare <= 0){
                            swal("Error!", "Date Time start must not be greater than or equal to Date time end.", "error");
                        }

                        else{
                            $('#modalRBErrorMsghider').hide();
                            RoadBlockAdd();
                        }    
                    }
                }
                function TrafficRoadSignVerify() {
                    TRStype = document.getElementById("modalTRSType").value;
                    TRSdesc = document.getElementById("modalTRSDesc").value;

                    if(!TRStype || !TRSdesc){
                        $('#modalTRSErrorMsghider').show();
                        // document.getElementById('modalTRSErrorMsg').value = "waaaaaaaa";
                    }
                    else
                    {
                        $('#modalTRSErrorMsghider').hide();
                        TrafficRoadSignAdd();
                    }
                }
                function TrafficRoadSignAdd() {
                    //var ref = firebase.database().ref();
                    var coordinates = [];
                    console.log(TRStype,TRSdesc)
                    
                    e.getPath().getArray().forEach(function(v, k) {
                       coordinates.push({lat:v.lat(),long:v.lng()});
                    });

                    traffic_road_sign.$add({ 
                        road_sign: TRStype, 
                        road_sign_desc: TRSdesc,
                        road_sign_coordinates:coordinates
                    }).then(function(ref) {
                        var id = ref.key;
                        swal("Success", "New Roadblock Successfully Added!", "success")
                        GeneralNewsDetails();
                        setTimeout(function () {
                            swal.close()
                            location.reload();
                        }, 2000);
                    });
                    
                }
                function GeneralNewsDetails(){

                    if(TRStype){
                        gen_title = "new " + TRStype; 
                    }else{
                        gen_title = "new Roadblock";
                    }
                    if(remarks){
                        gen_desc = remarks;
                    }else{
                        gen_desc = TRSdesc;
                    }
                    e.getPath().getArray().forEach(function(v, k) {
                        getlong = v.lng();
                        getlat = v.lat();
                    })
                    GeneralNewsAdd();
                }
                function GeneralNewsAdd(){
                    general_news.$add({
                        gn_title: gen_title,
                        gn_datecreated: today, 
                        gn_description: gen_desc,   
                        gn_lat: getlat,
                        gn_long: getlong
                    }).then(function(ref) {
              
                    });
                }
            }
        }
    });
    vm.changepaths = function(event, id, type) {
        //gn_title = Edited
        console.log(event);
        event.editable = "true";
        event.draggable = "true";
        if(type == "TRS")
        {
            var update_trs = $firebaseObject(ref.child('traffic_road_sign').child(id));
            
            update_trs.road_sign_coordinates = [];
            this.getPath().getArray().forEach(function(value,key){
                update_trs.road_sign_coordinates.push({lat: value.lat(), long: value.lng()})
                getlat = value.lat();
                getlong = value.lng();
            });
            ref.child('traffic_road_sign').once('value').then(function(snapshot) {
                snapshot.forEach(function(userSnapshot) {
                    var trs = userSnapshot.val();
                    var use = userSnapshot.key;
                    
                    var color = '';
                    var paths = [];
                    
                    console.log(userSnapshot.val().key+"aw");                
                    if(trs.road_sign == 'No Stopping Anytime')
                        color = noStoppingAnytime;
                    else if(trs.road_sign == 'No Jaywalking')
                        color = noJayWalking;
                    else if(trs.road_sign == 'Tow Away Zone')
                        color = towAwayZone;
                    else if(trs.road_sign == 'No Parking')
                        color = noParking;
                    else if(trs.road_sign == 'No Loading/Unloading')
                        color = noLoadingOrUnloading;
                    if(userSnapshot.key == id)
                    {      
                        update_trs.road_sign_desc = trs.road_sign_desc;
                        update_trs.road_sign = trs.road_sign;

                        update_trs.$save().then(function(ref) {
                            toastr.success('Path has been updated', 'You Successfully changed')
                        }, function(error) {
                            console.log("Error:", error);
                        });
                    }
                });
                
            });
        }else if(type == "RB"){
            var update_rb = $firebaseObject(ref.child('road_block').child(id));
            update_rb.rb_coordinates = [];
            this.getPath().getArray().forEach(function(value,key){
                update_rb.rb_coordinates.push({lat: value.lat(),long: value.lng()})
            });
            ref.child('road_block').once('value').then(function(snapshot) {
                snapshot.forEach(function(userSnapshot) {
                    console.log(userSnapshot.key);
                    console.log(id);
                    if(userSnapshot.key == id){
                        var rb_value = userSnapshot.val();
                        update_rb.rb_desc = rb_value.rb_desc;
                        update_rb.rb_enddatetime = rb_value.rb_enddatetime;
                        update_rb.rb_name = rb_value.rb_name;
                        update_rb.rb_startdatetime = rb_value.rb_startdatetime;
                        update_rb.rb_datecreated = today;
                        update_rb.rb_status = rb_value.rb_status;
                        update_rb.$save().then(function(ref) {
                            toastr.success('Path has been updated', 'You Successfully changed')
                        }, function(error) {
                            console.log("Error:", error);
                        });
                    }
                });
            })
        }

    };
    vm.click = function(event, id, type) {
        console.log('aw');
        $('#deleteButton').show();
        document.getElementById("deleteButton").onclick = function() {deletePoly(id,type)};
        if(type == 'RB') {
            $('#editRBButton').show();
            document.getElementById("editRBButton").onclick = function() {editRBData(id)};
        }
        else{
            $('#editRBButton').hide();
        }
        setTimeout(function () {
            $('#deleteButton').hide();
            $('#editRBButton').hide();
        }, 3600);
    }

    vm.editRB = {};
    function editRBData(id){
        $('#modalEditroadblock').modal('show');
        vm.editRB = $firebaseObject(ref.child('road_block').child(id));

        vm.editRB.$loaded().then(function(){
            vm.editRB.rb_enddatetime = moment(vm.editRB.rb_enddatetime).set({second:0,millisecond:0}).toDate();
            vm.editRB.rb_startdatetime = moment(vm.editRB.rb_startdatetime).set({second:0,millisecond:0}).toDate();  
        });
    }
    vm.saveRBdata = function(){ 
        vm.editRB.$save().then(function(obj){
            $('#modalEditroadblock').modal('hide');
            swal("success","successfully save",'success');
        },function(error){
            swal("error",error,"error");
        })
    }
    function deletePoly(id, type){
        console.log(id);
        $('#modalDeletePath').modal('show');

        $("#modalDelPathConfirmDelete").click(function(){
            console.log("na click ko");
            $('#modalDeletePath').modal('toggle');
            if(type == "TRS")
            {
                ref.child('traffic_road_sign/'+id+'/').remove();
                toastr.error('You Successfully Deleted the geofence!')
            }
            else
            {
                ref.child('road_block/'+id+'/').remove();
                toastr.error('You Successfully Deleted the geofence!')
            }
        });
    }
    vm.placeChanged = function() {
        vm.place = this.getPlace();
        console.log(vm.place);
        console.log('location', vm.place.geometry.location);
        vm.map.setCenter(vm.place.geometry.location);
    }
}
})();

 // if(type == "TRS")
        // {
        //     var update_trs = $firebaseObject(ref.child('traffic_road_sign').child(id));
        //     update_trs.road_sign_coordinates = [];
        //     this.getPath().getArray().forEach(function(value,key){
        //         update_trs.road_sign_coordinates.push({lat: value.lat(),long: value.lng()})
        //     });
        //     update_trs.$save().then(function(ref) {
        //         console.log(ref.$id);
        //         toastr.success('Path has been updated', 'Arman Arco changed')
        //     }, function(error) {
        //         console.log("Error:", error);
        //     });;
        // }
       // vm.allSha[0].color = 'bogo';
        // vm.allSha[0].paths[0,0] = 500;
        // vm.allSha[0].paths[0,1] = 400;
        // console.log(vm.allSha[0].paths[0,0]+"arr");
        // console.log(vm.allSha[0].paths[0,1]+"arr");
        // var road_block_sign_plot = $firebaseArray(ref.child('road_block'));

        // road_block_sign_plot.on("")

           //this on is to retrieve all the data
       
           //this on is to retrieve all the data
  
        // var ref = database.ref('traffic_road_sign');

   // vm.allShapes = [
        //     {color:"#FF0000", name: "polygon", paths: [[41.74,-73.18],[40.64,-74.18],[40.84,-74.08],[40.74,-74.18]]},
        //     {color:"#000000",name: "polygon", paths: [[42.74,-74.18],[40.64,-74.18],[40.84,-74.08],[40.74,-74.18]]},
        //     {color:"#777777",name: "polygon", paths: [[43.74,-75.18],[41.64,-74.18],[40.84,-74.08],[40.74,-74.18]]}
        // ];

    //gotData(ref);

       // console.log(FirebaseDatabase.getInstance().getReference());

        // ref.on('value',gotData, errData);

        // function gotData(data){
        // var traffic_road_sign = data.val();
        // var keys = Object.keys(traffic_road_sign);
        // console.log(keys);
        //     for(var i = 0; i < keys.length; i++){
        //       var k = keys[i];
        //       var road_sign = traffic_road_sign[k].road_sign;
        //       console.log(k+':keys'+road_sign);
        //       console.log(road_sign+":wawaawww");
        //     }
        // }

        // function errData(err){
        //     console.log('Error!');
        //     console.log(err);
        // }
        // var usersRef = firebase.database().ref('road_block').child(key);
        // console.log(usersRef);
        // console.log(usersRef.key);
        //var adaRef = usersRef.child($key);




// ref.once('value', function(snapshot) {
//   snapshot.forEach(function(childSnapshot) {
//     var childKey = childSnapshot.key;
//     var childData = childSnapshot.val();
//     // ...
//   });
// });
  //       //this on is to retrieve all the data
  //     var database = firebase.database();
  //     var ref = database.ref('traffic_road_sign');
  //     ref.on('value',gotData, errData);

  // function gotData(data){
  //   var traffic_road_sign = data.val();
  //   var keys = Object.keys(traffic_road_sign);
  //   console.log(keys);
  //   for(var i = 0; i < keys.length; i++){
  //     var key2 = Object.keys(traffic_road_sign[k].road_sign_coordinates);
  //     var k = keys[i];
  //     console.log(k+':keys');
  //     //console.log(traffic_road_sign[k].road_sign_coordinates.keys);
  //     console.log(key2);
  //   }
  // }

  // function errData(err){
  //   console.log('Error!');
  //   console.log(err);
  // }


 // vm.traffic_road_sign = {
            //   road_sign: '',
            //   road_sign_desc: '',
            //   road_coor_length: ''
            // }

        //=====================================
/*
ref.child("traffic_road_sign").on("value", function(snapshot) {
          limit = snapshot.numChildren();
            
        })
    //this on is to retrieve all the data
      var database = firebase.database();
      var ref = database.ref('traffic_road_sign');
      ref.on('value',gotData, errData);

  function gotData(data){
    var traffic_road_sign = data.val();
    var keys = Object.keys(traffic_road_sign);
    console.log(keys);
    for(var i = 0; i < keys.length; i++){
      var k = keys[i];
      console.log(k+':keys \n'+traffic_road_sign[k]+'')
    }
  }

  function errData(err){
    console.log('Error!');
    console.log(err);
  }

  */
// =============================
      // arry.push([v.lat(), v.lng()]);
                //   console.log(v.lat(), v.lng());
                  // v.lat(), v.lng()
                  // arry[v]   


        // var latlang = $firebaseArray(ref.child('traffic_road_sign').child(id));
        // latlang.$add({ lat: "1" }).then(function(ref) {
        //   var id = ref.key;
        //   console.log("added record with id " + id);
        //   // latlang.$indexFor(id); // returns location in the array
        // });



      // e.getPath().getArray().forEach(function(v, k) {

      //   lat.push(v.lat());
      //   long.push(v.lng());
      //   console.log(lat[limit],long[limit]);
      //   limit +=1;
      //   // arry.push([v.lat(), v.lng()]);
      //   //   console.log(v.lat(), v.lng());
      //     // v.lat(), v.lng()
      //     // arry[v]   
      // })


    // //the only global variable
    // function init(map){

    //    ref.child("messages").on("value", function(snapshot) {
    //       console.log("There are "+snapshot.traffic_road_sign()+" messages");
    //     })


    //     var PS = null;

    //     google.maps.event.addDomListener(window, "load", function () {


    //       //we will center the map here
    //       var vancouver = {
    //           lat: 10.3383039,
    //           lng: 123.911486 
    //       }

    //       //granville island coordinates.
    //       //you should be fetching your coordinates from your server
    //       var granville_coords = [
    //             {lat: 49.27158485202591, lng: -123.13729763031006},
    //             {lat: 49.27277488695786, lng: -123.13691139221191},
    //             {lat: 49.27316689217891, lng: -123.13613891601562},
    //             {lat: 49.27319489243262, lng: -123.13474416732788},
    //             {lat: 49.27248088099777, lng: -123.13384294509888},
    //             {lat: 49.2696667352996,  lng: -123.13049554824829},
    //             {lat: 49.268546632648494,lng: -123.13055992126465},
    //             {lat: 49.268350612069995,lng: -123.13066720962524},
    //             {lat: 49.2684906268484,  lng: -123.13146114349365},
    //             {lat: 49.268546632648494,lng: -123.13249111175537},
    //             {lat: 49.26888266611402, lng: -123.13347816467285},
    //             {lat: 49.26889666745873, lng: -123.13401460647583},
    //             {lat: 49.2706328034105,  lng: -123.1368041038513 }
    //       ];

    //       //coordinates of blocks just east of burrard.
    //       var burrard_coords = [
    //         {lat: 49.267972570183545, lng: -123.145751953125},
    //         {lat: 49.2679445669656,   lng: -123.14085960388184},
    //         {lat: 49.27032478374826,  lng: -123.14077377319336},
    //         {lat: 49.27138884351881,  lng: -123.14176082611084},
    //         {lat: 49.27309689147504,  lng: -123.14356327056885},
    //         {lat: 49.27267688516586,  lng: -123.14467906951904},
    //         {lat: 49.27152884967477,  lng: -123.14553737640381},
    //         {lat: 49.269834748503946, lng: -123.1459450721740}
    //       ];
    //       var latlng = new google.maps.LatLng(vancouver.lat, vancouver.lng);
    //       map.setCenter(latlng);
    //       map.setZoom(16);



    //       //this style is easier on the eyes than the default black.
    //       //BADASS and COFFEE hex to the rescue.
    //       var polystyle = {
    //           strokeColor: '#BADA55',
    //           strokeOpacity: 0.8,
    //           strokeWeight: 2,
    //           fillColor: '#C0FFEE',
    //           fillOpacity: 0.35
    //       }

    //       //options for granville polygon.
    //       //SNAPABLE = TRUE
    //       var poly1_opts = $.extend({
    //           paths: granville_coords,
    //           map: map,
    //           snapable: true
    //       }, polystyle);

    //       //options for burrard polygon
    //       //SNAPABLE not present (false)
    //       var poly2_opts = $.extend({
    //         paths: burrard_coords,
    //         map: map,
    //         snapable: true
    //       }, polystyle);

    //       //let's make the polygons  
    //       var granville = new google.maps.Polygon(poly1_opts);
    //       var burrard   = new google.maps.Polygon(poly2_opts);

    //       /*
    //           For demo purposes, lets just put two gmaps Polys into the polygon array.
    //           For your application purposes, you would populate this array with
    //           all of the polygons you want to snap to - likely driven from the DB.
    //       */
    //      var polygons = [granville, burrard];

    //       /*
    //         Now, we make the SnapManager.
    //         See http://stackoverflow.com/a/33338065/568884 for API
    //         Will be transferred to Github soon.
    //       */

    //       var PS = PolySnapper({
    //           map: map,
    //           marker: new google.maps.Marker(),
    //           threshold: 20,
    //           keyRequired: false,
    //           polygons: polygons,
    //           polystyle: polystyle,
    //           hidePOI: true,
    //           onEnabled: function(){
    //         console.log("enabled")
    //           },
    //           onDisabled: function(){
    //         console.log("disabled")
    //           }
    //       });

    //       //add the buttons initial state on top of the map.
    //       //renderCpanel(false);


    //       PS.polygon().getPath().getArray().forEach(function(v, k) {
    //           console.log(v.lat(), v.lng());
    //       }) 

    //     });



    //     // PS.polygon().getPath().getArray().forEach(function(v, k) {
    //     //     console.log(v.lat(), v.lng());
    //     // }) 

    //     // //when user clicks log poly button, pull the poly out of the manager and console.log it.
    //     // $(document).on("click", "#query", function(){
    //     //    console.log( PS.poly().getPath().getArray() );
    //     // });

    //     // //just a small render function to re-draw the buttons whenever the enabled state is flipped on and off.
    //     // function renderCpanel(drawing){

    //     //     var t = $("#control-panel").html();
    //     //     var html = _.template(t, {drawing: drawing});
    //     //     $("#cp-wrap").html(html);

    //     // }

    //     // //attach the click handlers to the button. #cp-wrap is never added or removed
    //     // //from the DOM, so its safe to bind the listeners to it.
    //     // $("#cp-wrap").on("click", "button", function(){
    //     //   console.log("hi");
    //     //     var action = $(this).data("action");

    //     //     if     (action == 'new')  PS.enable();
    //     //   else if(action == 'query')  {
    //     //     PS.polygon().getPath().getArray().forEach(function(v, k) {
    //     //               console.log(v.lat(), v.lng())
    //     //           }) 
    //     //   }
    //     //     else                PS.disable();

    //     //     renderCpanel( (action == 'new')  );    
    //     // });
    //     console.log("dog");
    // }
    // console.log("cat");





