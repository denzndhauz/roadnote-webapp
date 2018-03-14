(function() {
	'use strict';

	angular
	.module('app')
	.controller('HomeCtrl', HomeController);

	function HomeController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray ,NgMap) {
        var getlong,getlat;//latitude longitude
        var gen_title,gen_desc;//general news
		var vm = this;
        var infoWindow = new google.maps.InfoWindow();
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
        //=============
        var msg = "";
        var msg1 = "";
        vm.traffic_signs = {
            np: false,
            nj: false,
            nsa: false,
            taz: false,
            nul: false,
            rb: false
        }
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
                    }
                    else
                    {
                        $('#modalTRSErrorMsghider').hide();
                        TrafficRoadSignAdd();
                    }
                }
                function TrafficRoadSignAdd() {
                    var coordinates = [];
                    var latloc,longloc;

                    console.log(TRStype,TRSdesc)
                    
                    e.getPath().getArray().forEach(function(v, k) {
                       coordinates.push({lat:v.lat(),long:v.lng()});
                       latloc = v.lat();
                       longloc = v.lng();
                    });
                    traffic_road_sign.$add({ 
                        road_sign: TRStype, 
                        road_sign_desc: TRSdesc,
                        road_sign_coordinates:coordinates
                    }).then(function(ref) {
                        var id = ref.key;
                        convertLatLngToAddress(latloc, longloc, id);
                        swal("Success", "New Roadblock Successfully Added!", "success")
                        GeneralNewsDetails();
                        setTimeout(function () {
                            // swal.close()
                            // location.reload();
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
        // Since this polygon has only one path, we can call getPath()
        // to return the MVCArray of LatLngs.

        $firebaseObject(ref.child('road_block').child(id));
        
        var test = $firebaseObject(ref.child('traffic_road_sign').child(id));
        test.$loaded().then(function(){
            var contentString;
            console.log(test+":test");
            console.log(test.road_sign+":road_sign");
            if(type == 'TRS'){
                if(test.road_sign === 'No Parking'){
                    var span = document.createElement('span');
                    console.log("nara ko diri");
                    contentString = '<img src="./assets/signs/NoLoadingOrUnloading.gif" width="55" height="85" class="text-center">';
                    console.log(contentString+":content");
                    // contentString += '<img src="./assets/signs/NoParking.jpg" width="55" height="85" class="text-center">';
                    
                }else if(test.road_sign === 'No JayWalking'){
                    contentString = '<img src="./assets/signs/NoJaywalking.png" width="55" height="85" class="text-center">';
                }else if(test.road_sign === 'No Stopping Anytime'){
                    contentString = '<img src="./assets/signs/NoStoppingAnytime.png" width="55" height="85" class="text-center">';
                }else if(test.road_sign === 'Tow Away Zone'){
                    contentString = '<img src="./assets/signs/TowAwayZone.gif" width="55" height="85" class="text-center">';
                }else if(test.road_sign === 'No Loading/Unloading'){
                    contentString = '<img src="./assets/signs/NoLoadingOrUnloading.gif" width="55" height="85" class="text-center">';
                }
            }
             infoWindow.setContent(contentString);

            infoWindow.setPosition(event.latLng);
            infoWindow.open(vm.map);
        });

        // if(type === 'No Parking'){
        //     console.log("nara ko diri");
        //     contentString += '<img src="./assets/signs/NoParking.jpg" width="55" height="85" class="text-center">'
        // }else if(type === 'No JayWalking'){
        //     contentString += '<img src="./assets/signs/NoJaywalking.png" width="55" height="85" class="text-center">'
        // }else if(type === 'No Stopping Anytime'){
        //     contentString += '<img src="./assets/signs/NoStoppingAnytime.png" width="55" height="85" class="text-center">'
        // }else if(type === 'Tow Away Zone'){
        //     contentString += '<img src="./assets/signs/TowAwayZone.gif" width="55" height="85" class="text-center">'
        // }else if(type === 'No Loading/Unloading'){
        //     contentString += '<img src="./assets/signs/NoLoadingOrUnloading.gif" width="55" height="85" class="text-center">'
        // }


        // // Iterate over the vertices.
        // for (var i =0; i < vertices.getLength(); i++) {
        //   var xy = vertices.getAt(i);
        //   contentString += '<br>' + 'Coordinate ' + i + ':<br>' + xy.lat() + ',' +
        //       xy.lng();
        // }
        // Replace the info window's content and position.
       



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
//=======================================
     vm.showArrays = function(event) {
        
    }


//=====================================
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
        vm.map.setCenter(vm.place.geometry.location);
    }
    function convertLatLngToAddress(lat, lng, id){
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder.geocode({ 'latLng': latlng }, function (results, status) {
            //later naka

            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    console.log(results[1].formatted_address+":results1");
                    console.log(results[0].formatted_address+":results0");
                    console.log(results[2].formatted_address+":results0");
                    msg = results[0];;
                    var trs_add = $firebaseObject(ref.child('traffic_road_sign').child(id));

                    ref.child('traffic_road_sign').once('value').then(function(snapshot){
                        var trs_val = snapshot.val();
                        console.log(id+":id")
                         console.log(snapshot.key+":snapshot.key")
                        if(id == snapshot.key){
                            trs_add.road_sign = trs_val.road_sign;
                            trs_add.road_sign_desc = trs_val.road_sign_desc;
                            trs_val.road_sign_coordinates.forEach(function(coordinate) {
                                paths.push([coordinate.lat, coordinate.long]);
                            });
                            trs_add.road_sign_location = results[0].formatted_address;

                            trs_add.$save().then(function(ref) {
                                toastr.success('Date is now added to history', 'You Successfully plotted geofence');
                            }, function(error) {
                                console.log("Error:", error);
                            });
                        }
                    });


                } else {
                    console.log('Location not found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    }
})();
