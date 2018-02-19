(function() {
	'use strict';

	angular
	.module('app')
	.controller('HomeCtrl', HomeController);

	function HomeController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray ,NgMap) {

		var vm = this;
        var ref = firebase.database().ref();
        var desc = '',title = '', DateTS='',DateTE = '';
        vm.onMapOverlayCompleted = function(e) {


            e.setDraggable(true);
            e.setEditable(true);
            $('#modalRBorRS').modal('show');
            $("#roadblock").click(function(){
                console.log("na click nako");
                $('#modalRBorRS').modal('toggle');
                $('#modalroadblock').modal('show');

                document.getElementById("modalRBSaveButton").onclick = function() {RoadBlockVerify()};
                document.getElementById("modalTRSErrorMsg").onclick = function() {TrafficRoadSignVerify()};    

                function RoadBlockAdd(){
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();

                    if(dd<10) {
                        dd = '0'+dd
                    } 

                    if(mm<10) {
                        mm = '0'+mm
                    } 

                    today = mm + '/' + dd + '/' + yyyy;

                    var road_block_sign = $firebaseArray(ref.child('road_block'));

                    road_block_sign.$add({ 
                        rbs_name: title,
                        rbs_desc: desc,
                        rbs_startdatetime: DateTS,
                        rbs_enddatetime: DateTE,
                        rbs_datecreated: today,
                        rbs_status: 'ACTIVE'
                    }).then(function(ref) {
                        var id = ref.key;

                        var rbs_latlong = $firebaseArray(ref);
                        var getlong,getlat;

                        e.getPath().getArray().forEach(function(v, k) {

                            // vm.latlang.lat = v.lat();
                            getlat = v.lat();
                            getlong = v.lng();

                            rbs_latlong.$add({ lat: getlat, long: getlong }).then(function(ref) {
                              // var id = ref.key();
                              console.log("added record with id " + id);
                              rbs_latlong.$indexFor(id); // returns location in the array
                          });

                        })
                        swal("Success", "New Roadblock Successfully Added!", "success")
                        // location.reload();
                        
                        setTimeout(function () {
                            location.reload();
                        }, 2000);
                        $('#modalRBorRS').modal('hide');
                    }); 
                }

                function RoadBlockVerify() {

                    desc = document.getElementById("modalRBDesc").value;
                    title = document.getElementById("modalRBTitle").value;
                    DateTS = document.getElementById("modalRBDateTS").value;
                    DateTE = document.getElementById("modalRBDateTE").value;
                    desc = desc.toString();
                    title = title.toString();
                    DateTS = DateTS.toString();
                    DateTE = DateTE.toString();

                    if(desc == '' || title=='' || DateTS == '' || DateTE == ''){
                        $('#modalRBErrorMsg').show();
                    }
                    else
                    {
                        $('#modalRBErrorMsg').hide();
                        RoadBlockAdd();
                    }
                }
                function RoadBlockVerify() {

                }
            });

            $("#roadsign").click(function(){
                $('#modalRBorRS').modal('toggle');
                $('#modalTrafficRoadSign').modal('show');
            });

            //var ref = firebase.database().ref();
            var traffic_road_sign = $firebaseArray(ref.child('traffic_road_sign'));
            // var latlang;

            var temp = "tetetemp";
            traffic_road_sign.$add({ 
                road_sign_desc: temp,
                road_sign: "1", 
            }).then(function(ref) {
                var id = ref.key;

                var trs_latlong = $firebaseArray(ref);
                var getlong,getlat;

                e.getPath().getArray().forEach(function(v, k) {

                    // vm.latlang.lat = v.lat();
                    getlat = v.lat();
                    getlong = v.lng();

                    trs_latlong.$add({ lat: getlat, long: getlong }).then(function(ref) {
                      // var id = ref.key();
                      console.log("added record with id " + id);
                      trs_latlong.$indexFor(id); // returns location in the array
                  });

                })
            }); 

            google.maps.event.addListener(e, 'dragend', function (event) {
                e.getPath().getArray().forEach(function(v, k) {
                    console.log(v.lat(), v.lng());
                })
            });
        }


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




