(function() {
	'use strict';

	angular
	.module('app')
	.controller('HomeCtrl', HomeController);

	function HomeController($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray ,NgMap ,Auth) {

        var getlong,getlat;//latitude longitude
        var gen_title,gen_desc;//general news
		var vm = this;
        var auth = Auth;
        vm.auth = auth;
        var ref = firebase.database().ref();
        //for adding to db
        var general_news = $firebaseArray(ref.child('general_news'));
        var road_block_sign = $firebaseArray(ref.child('road_block'));
        var traffic_road_sign = $firebaseArray(ref.child('traffic_road_sign'));
        //=================
        var remarks = '',title = '', DateTS='',DateTE = '', TRStype = '', TRSdesc = '';
        var today = new Date(),todayparsed = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var noParking = '#ed0b0b',noJayWalking = '#0011ff',noStoppingAnytime = '#00ffff',towAwayZone = '#00ff00'
                , noLoadingOrUnloading = '#FF00CE', roadblockcolor = '#000000';
                //roadblock = black, no parking = red, no jaywalking  = blue, no stopping anytime = skyblue, tow away zone = green, 
                //no loading or unloading = violet
        var timestampCompare = 0;
        vm.allShapes = [];//stores geofence paths, colors, key and type if it is traffic road sign or roadblock
        var url ;
        //=============
        var msg = "";
        var infoWindow = null;
        infoWindow = new google.maps.InfoWindow();
        var marker;
        var markersArray = [];
                vm.editRB = {};
        // vm.visible = true;
        // var setofpolygons = [];
        vm.traffic_signs = {
            np: false,
            nj: false,
            nsa: false,
            taz: false,
            nul: false,
            rb: false
        }
        vm.act_logs = {
            activity_admin: '',
            activity_date: '',
            activity_description: ''
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
        updateMaps();
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
                console.log(e.overlay);
                console.log(e.Overlay+":event");
                console.log(e)

                e.setDraggable(true);//to make paths draggable
                e.setEditable(true);//to make paths editable
                var pointMinimum = 0;//minimum of the points
                // setTimeout(function () {
                //     e.setMap(null);
                // }, 60000);
                pointMinimum = e.getPath().getArray().length;       
                if(pointMinimum <= 2){
                    swal("Plotted Points must be greater than two", "You clicked the button!", "error");
                    e.setMap(null);
                }
                else{   
                    e.setMap(null);
                    $('#modalRBorRS').modal('show');//shows modal to choose if road block or road sign
                    $("#roadblock").click(function(){
                     
                        $('#modalRBorRS').modal('hide');
                        $('#modalroadblock').modal('show');

                        document.getElementById("modalRBSaveButton").onclick = function() {RoadBlockVerify()};   
                        // e.setMap(null);
                    });

                    $("#roadsign").click(function(){
                        $('#modalRBorRS').modal('hide');
                        $('#modalTrafficRoadSign').modal('show');

                        document.getElementById("modalTRSSaveButton").onclick = function() {TrafficRoadSignVerify()};
                        // e.setMap(null);
                    }); 
                    //event listener for drag
                    // google.maps.event.addListener(e, 'dragend', function (event) {
                    //     e.getPath().getArray().forEach(function(v, k) {
                    //         console.log(v.lat(), v.lng());
                    //     })
                    // });
                    function RoadBlockAdd(){
                        
                        var coordinates = [];
                        e.getPath().getArray().forEach(function(v, k) {
                           coordinates.push({lat:v.lat(),long:v.lng()});
                           getlat = v.lat();
                           getlong = v.lng();
                        });
                        var geocoder = new google.maps.Geocoder();
                        var latlng = new google.maps.LatLng(getlat, getlong);
                        geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[1]) {
                                    var location = 'near '+results[0].formatted_address;
                                    road_block_sign.$add({ 
                                        rb_name: title,
                                        rb_desc: remarks,
                                        rb_startdatetime: DateTS,
                                        rb_enddatetime: DateTE,
                                        rb_datecreated: today,
                                        rb_status: 'ACTIVE',
                                        rb_coordinates: coordinates,
                                        rb_location: location
                                    }).then(function(ref) {
                                        // $('modalroadblock').modal('hide');
                                        updateMaps();
                                        swal("Success", "New Roadblock Successfully Added!", "success");
                                        activity_log(coordinates[0].lat, coordinates[0].long ,'add');
                                        // setTimeout(function () {
                                        //     swal.close();
                                        //     // $('#modalroadblock').modal('hide');
                                        //     // location.reload();
                                        // }, 3600);
                                        // //$('#modalRBorRS').modal('hide');
                                    });
                                } else {
                                    console.log('Location not found');
                                }
                            } else {
                                console.log('Geocoder failed due to: ' + status);
                            }
                        });
                    }
                    function RoadBlockVerify() {
    
                        remarks = document.getElementById("modalRBDesc").value;
                        title = document.getElementById("modalRBTitle").value;
                        DateTS = document.getElementById("modalRBDateTS").value;
                        DateTE = document.getElementById("modalRBDateTE").value;
                        
                        remarks = remarks.toString();
                        title = title.toString();
                        // DateTS = DateTS.toString();
                        DateTE = DateTE.toString();
                        // if(DateTS){
                            
                            $('#modalRBErrorMsghider').hide();
                            $('#modalReasonErrRB').hide();
                            $('#modalDateStartErrRB').hide();
                            $('#modalDateEndErrRB').hide();
                            
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
                                if(!DateTE || DateTE == ""){
                                    $('#modalDateEndErrRB').show();
                                }
                            }
                            else
                            {
                                // if(Date.parse(DateTS) < todayparsed){
                                //     swal("Error!", "Date started must be latest");
                                // }else{
                                if(Date.parse(DateTE) < todayparsed){
                                    swal("Error!", " Date Ended must be latest");
                                }else{
                                    var getDateTS = DateTS.split('-');
                                    getDateTS = getDateTS[2].split('T');
                                    timestampCompare = DateTE.localeCompare(DateTS);
                                    if(timestampCompare <= 0){
                                        swal("Error!", "Date Time start must not be greater than or equal to Date time end.", "error");
                                    }
                                    else{
                                        $('#modalRBDesc').val("");
                                        $('#modalRBTitle').val("");
                                        $('#modalRBDateTS').val("");
                                        $('#modalRBDateTE').val("");
                                        $('#modalroadblock').modal('hide');
                                        $('#modalRBErrorMsghider').hide();
                                        RoadBlockAdd();
                                    }   
                                }    
                                
                                // }
                            } 
                        // }
                        // }else{
                        //     $('#modalDateStartErrRB').show();
                        //     swal('error','invalid date time started','error');
                        // }
                    }
                    function TrafficRoadSignVerify() {
                        TRStype = document.getElementById("modalTRSType").value;
                        TRSdesc = document.getElementById("modalTRSDesc").value;
                        $('#modalTRSType').val("");
                        $('#modalTRSDesc').val("");
                        $('#modalTrafficRoadSign').modal('hide');
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
                            updateMaps();
                            swal("Success", "New Roadblock Successfully Added!", "success");
                            activity_log(coordinates[0].lat, coordinates[0].long ,'add');
                            GeneralNewsDetails();
                            // $('#modalTrafficRoadSign').modal('hide');
                            // setTimeout(function () {
                            //     // swal.close()s
                            //     // location.reload();
                            // }, 2000);
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

                        var geocoder = new google.maps.Geocoder();
                        var latlng = new google.maps.LatLng(getlat, getlong);
                        geocoder.geocode({ 'latLng': latlng }, function (results, status) {

                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    console.log(results[1].formatted_address+":results1");
                                    console.log(results[0].formatted_address+":results0");
                                    console.log(results[2].formatted_address+":results0");
                                    msg = results[0].formatted_address;
                                    console.log(msg);
                                    var location = 'near '+results[0].formatted_address;
                                    general_news.$add({
                                        gn_title: gen_title,
                                        gn_datecreated: today, 
                                        gn_description: gen_desc,   
                                        gn_lat: getlat,
                                        gn_long: getlong,
                                        gn_location: location
                                    }).then(function(ref) {
                                        
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
            }
            window.setInterval(updateMaps,  60000);
        });
        vm.changepaths = function(event, id, type) {
            infoWindow.close(vm.map);
            var path = [];
            this.getPath().getArray().forEach(function(value,key){
                path.push({lat: value.lat(), long: value.lng()})
            });
            $('#changePath').show();
            var confirm = document.getElementById("changePath").onclick = 'yes';
            $(changePath).click(function(){
                if(type == "TRS") {
                    var count = 0;
                    var update_trs = $firebaseObject(ref.child('traffic_road_sign').child(id));
                    update_trs.road_sign_coordinates = [];
                    path.forEach(function(pathPoly){
                        update_trs.road_sign_coordinates.push({lat: pathPoly.lat, long: pathPoly.long})
                        getlat = pathPoly.lat;
                        getlong = pathPoly.lat;
                    });
                    ref.child('traffic_road_sign').once('value').then(function(snapshot) {
                        count = 0;
                        var countUpdate = 0;
                        snapshot.forEach(function(trs_snapshot) {

                            var trs = trs_snapshot.val();
                            console.log(trs+"trs");
                            console.log(trs.road_sign);
                            var use = trs_snapshot.key;
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
                            if(trs_snapshot.key === id)
                            {      
                                
                                update_trs.road_sign_desc = trs.road_sign_desc;
                                update_trs.road_sign = trs.road_sign;
                                act_log(id, 'edit', type);
                                update_trs.$save().then(function(ref) {
                                    countUpdate++;
                                    if(countUpdate == 1)
                                        updateMaps();
                                    // toastr.success('Path has been updated', 'You Successfully changed')
                                    swal('Success', 'Path is now updated', 'success');
                                }, function(error) {
                                    console.log("Error:", error);
                                });
                                
                            }
                        });
                        
                    });
                }else if(type == "RB"){
                    var update_rb = $firebaseObject(ref.child('road_block').child(id));
                    update_rb.rb_coordinates = [];
                    path.forEach(function(pathPoly){
                        update_rb.rb_coordinates.push({lat: pathPoly.lat, long: pathPoly.long})
                        getlat = pathPoly.lat;
                        getlong = pathPoly.lat;
                    });
                    ref.child('road_block').once('value').then(function(snapshot) {
                        snapshot.forEach(function(rb_snapshot) {
                            console.log(rb_snapshot.key);
                            console.log(id);
                            act_log(id, 'edit', type);
                            if(rb_snapshot.key == id){
                                var rb_value = rb_snapshot.val();
                                update_rb.rb_desc = rb_value.rb_desc;
                                update_rb.rb_enddatetime = rb_value.rb_enddatetime;
                                update_rb.rb_name = rb_value.rb_name;
                                update_rb.rb_startdatetime = rb_value.rb_startdatetime;
                                update_rb.rb_datecreated = today;
                                update_rb.rb_status = rb_value.rb_status;
                                update_rb.$save().then(function(ref) {
                                    updateMaps();
                                    swal('Success', 'Path is now updated', 'success');
                                }, function(error) {
                                    console.log("Error:", error);
                                });
                            }
                        });
                    })
                }
            });
            setTimeout(function () {
                $('#changePath').hide();
            }, 5000);
        };
        vm.click = function(event, id, type) {

            console.log(id+":id")
            $('#deleteButton').show();
            document.getElementById("deleteButton").onclick = function() {deletePoly(id,type)};
            console.log(type);
            if(type == 'RB') {
                $('#editRBButton').show();
                console.log(id+":id")
                console.log(type+"a");
                document.getElementById("editRBButton").onclick = function() {editRBData(id)};
            }
            else{
                $('#editRBButton').hide();
            }
            setTimeout(function () {
                $('#deleteButton').hide();
                $('#editRBButton').hide();
            }, 3600);
            var contentString;
            if(type == 'TRS'){
                var road_s = $firebaseObject(ref.child('traffic_road_sign').child(id));
                road_s.$loaded().then(function(){
                    if(road_s.road_sign === 'No Parking'){
                        contentString = '<b>No Parking</b><br><img src="./assets/signs/NoParking.jpg" width="55" height="85" class="text-center">';
                    }else if(road_s.road_sign === 'No Jaywalking'){
                        contentString = '<b>No Jaywalking</b><br><img src="./assets/signs/NoJaywalking.png" width="55" height="85" class="text-center">';
                    }else if(road_s.road_sign === 'No Stopping Anytime'){
                        contentString = '<b>No Stopping Anytime</b><br><img src="./assets/signs/NoStoppingAnytime.png" width="55" height="85" class="text-center">';
                    }else if(road_s.road_sign === 'Tow Away Zone'){
                        contentString = '<b>Tow Away Zone</b><br><img src="./assets/signs/TowAwayZone.gif" width="55" height="85" class="text-center">';
                    }else if(road_s.road_sign === 'No Loading/Unloading'){
                        contentString = '<b>No Loading/Unloading</b><br><img src="./assets/signs/NoLoadingOrUnloading.gif" width="55" height="85" class="text-center">';
                           
                    }else{
                         // +'<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>'
                            // +'<button type="button" class="btn btn-danger">Delete</button>'
                        // <button id="deleteButton" type="button" class="btn btn-danger" style="display: none;">Delete</button>
                        ;
                    }
                    infoWindow.close(vm.map);
                    infoWindow.setContent(contentString);
                    infoWindow.setPosition(event.latLng);
                    infoWindow.open(vm.map);

                });
            }else{
                var road_b = $firebaseObject(ref.child('road_block').child(id));
                road_b.$loaded().then(function(){

                    var sdt = road_b.rb_startdatetime.split('T');
                    var edt = road_b.rb_enddatetime.split('T');
                    contentString = '<b>Road Block</b><br><br><div>Reason: '+road_b.rb_name+'</div><br><div>Date Created: '+road_b.rb_datecreated+'</div><br><div>Road Block Started: '+moment(road_b.rb_startdatetime).format('LLL')+'</div>'
                    +'<div>Road Block End: '+moment(road_b.rb_enddatetime).format('LLL')+'</div><img src="./assets/signs/RoadBlock.jpg" width="85" height="85" class="text-center">';  
                    infoWindow.close(vm.map);
                    infoWindow.setContent(contentString);
                    infoWindow.setPosition(event.latLng);
                    infoWindow.open(vm.map);
                });
            }
        }
        vm.placeChanged = function(lat, lng) {
            vm.place = this.getPlace();
            vm.map.setCenter(vm.place.geometry.location);
        }
        vm.saveRBdata = function(rbName, rbDesc, rbSDT, rbEDT){ 
            
            // vm.editRB.rb_startdatetime = rbSDT;
            // vm.editRB.rb_enddatetime = rbEDT;
            // modalEditRBDateTS
            // modalEditRBDateTE
            var rbSDT = document.getElementById("modalEditRBDateTS").value;
            var rbEDT = document.getElementById("modalEditRBDateTE").value;
            var rbReason = document.getElementById("modalEditRBTitle").value;
            rbSDT = rbSDT.split(':');
            rbSDT = rbSDT[0] +':'+ rbSDT[1];
            rbEDT = rbEDT.split(':');
            rbEDT = rbEDT[0] +':'+ rbEDT[1];

            vm.editRB.rb_startdatetime = rbSDT;
            vm.editRB.rb_enddatetime = rbEDT;
            if(!rbEDT || !rbSDT || !rbReason){   
                var msg = "";
                if(!rbSDT){
                    msg += "Date and Time Start must not be empty. <br>"
                }
                if(!rbEDT){
                    msg += "Date and Time End must not be empty. <br>";
                }
                if(!rbReason){
                    msg += "Reason of Roadblock must not be empty. <br>";
                }
                swal('Error', msg, 'error');
            }else if(Date.parse(rbEDT) < todayparsed){
                swal('Error','End Date time must be latest','error')
            }else{
                vm.editRB.$save().then(function(obj){
                    $('#modalEditRoadBlock').modal('hide');
                    swal("success","successfully save",'success');
                },function(error){
                    swal("error",error,"error");
                })
            }
        }
        function editRBData(id){
            infoWindow.close(vm.map);
            $('#modalEditRoadBlock').modal('show');
            console.log(id+":asda")
            vm.editRB = $firebaseObject(ref.child('road_block').child(id));

            vm.editRB.$loaded().then(function(){
                vm.editRB.rb_enddatetime = moment(vm.editRB.rb_enddatetime).set({second:0,millisecond:0}).toDate();
                vm.editRB.rb_startdatetime = moment(vm.editRB.rb_startdatetime).set({second:0,millisecond:0}).toDate();  
            });
        }
        function deletePoly(id, type){
            console.log(id);
            $('#modalDeletePath').modal('show');

            $("#modalDelPathConfirmDelete").click(function(){
                $('#modalDeletePath').modal('hide');
                if(type == "TRS")
                {
                    act_log(id, 'delete', type);

                    ref.child('traffic_road_sign/'+id+'/').remove();
                    swal("Success", "Successfully Deleted a geofence!", "success");
                }
                else
                {   
                    act_log(id, 'delete', type);

                    ref.child('road_block/'+id+'/').remove();
                    swal("Success", "Successfully Deleted a geofence!", "success");
                }

            });
        }
        function act_log(id, crud, type){
            if(type === 'TRS'){
                ref.child('traffic_road_sign').once('value').then(function(snapshot) {
                    snapshot.forEach(function(trs_snapshot) {
                        var trs = trs_snapshot.val();
                        if(trs_snapshot.key === id){
                            console.log("nara ko diri");
                            if(typeof trs.road_sign_coordinates == 'object') {
                                activity_log(trs.road_sign_coordinates[0].lat, trs.road_sign_coordinates[0].long, trs.road_sign);
                            }
                        }
                    });
                });
            }else{
                ref.child('road_block').once('value').then(function(snapshot) {
                    snapshot.forEach(function(rb_snapshot) {
                        var rb = rb_snapshot.val();
                        if(rb_snapshot.key === id){
                            if(typeof rb.rb_coordinates == 'object') {
                                activity_log(rb.rb_coordinates[0].lat, rb.rb_coordinates[0].long, 'road block');
                            }
                        }
                    });
                });
            }
            function activity_log(latitude, longitude, category){

                var geocoder = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng(latitude, longitude);
                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            var date = moment(todayparsed).format('LLL');

                            vm.auth.$onAuthStateChanged(function(firebaseUser) {
                                if(firebaseUser){
                                    var logs = firebase.database().ref("activity_logs");
                                    vm.act_logs.activity_admin = firebaseUser.uid;
                                    vm.act_logs.activity_date = date;
                                    vm.act_logs.activity_description = firebaseUser.email +" "+crud +" a "+category+ " geofence near "+results[0].formatted_address;
                                    $firebaseArray(logs).$add(vm.act_logs)
                                    vm.act_logs.activity_admin = '';
                                    vm.act_logs.activity_date = '';
                                    vm.act_logs.activity_description = '';
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
        function clearOverlays() {
            for (var i = 0; i < markersArray.length; i++ ) {
                markersArray[i].setMap(null);
            }
            vm.allShapes = [];
        }
        function updateMaps() {
            clearOverlays();
            updatetrs();//retrieve data from traffic_road_sign
            updaterb();//retrieve data from road_block
        }
        function updatetrs() {
            ref.child('traffic_road_sign').once('value').then(function(snapshot) {
                snapshot.forEach(function(trs_snapshot) {
                    var trs = trs_snapshot.val();
                    var color = '';
                    var paths = [];
                    if(trs.road_sign == 'No Stopping Anytime'){
                        url = './assets/signs/NoStoppingAnytime.png';
                        color = noStoppingAnytime;
                    }
                    else if(trs.road_sign == 'No Jaywalking'){
                        url = './assets/signs/NoJaywalking.png';
                        color = noJayWalking;
                    }
                    else if(trs.road_sign == 'Tow Away Zone'){
                        url = './assets/signs/TowAwayZone.gif';
                        color = towAwayZone;
                    }
                    else if(trs.road_sign == 'No Parking'){
                        url = './assets/signs/NoParking.jpg';
                        color = noParking;
                    }
                    else if(trs.road_sign == 'No Loading/Unloading'){
                        url = './assets/signs/NoLoadingOrUnloading.gif';
                        color = noLoadingOrUnloading;
                    }

                    if(typeof trs.road_sign_coordinates == 'object') {
                        trs.road_sign_coordinates.forEach(function(coordinate) {
                            paths.push([coordinate.lat, coordinate.long]);
                            getlat = coordinate.lat;
                            getlong = coordinate.long;
                        });
                    }

                    vm.allShapes.push({
                        id: trs_snapshot.key,
                        name: 'polygon',
                        color: color,
                        paths: paths,
                        type: 'TRS'
                    });
                    var icon = {
                        url: url, // url
                        // scaled size = The size of the entire image after scaling, if any. Use this property to stretch/shrink an image or a sprite.
                        scaledSize: new google.maps.Size(30, 30), // instead of size
                        origin: new google.maps.Point(0,0), // origin
                        anchor: new google.maps.Point(0, 0) // anchor
                    };
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(getlat, getlong),
                        map: vm.map,
                        icon: icon
                    });

                    markersArray.push(marker);
                });
            });
        }
        function updaterb(){
            ref.child('road_block').once('value').then(function(snapshot) {
                snapshot.forEach(function(rb_snapshot) {
                    var rb = rb_snapshot.val();
                    var color = '';
                    var paths = [];
                    color = roadblockcolor;
                    var now = Date.now();

                    var cutoff = now - 2 * 60 * 60 * 1000;
                    cutoff =  moment(cutoff).format();   

                    var cutoff = cutoff.split(":");
                    var timecutoff=cutoff[0]+':'+cutoff[1];

                    url = './assets/signs/RoadBlock.jpg';
                    if(typeof rb.rb_coordinates == 'object') {
                        rb.rb_coordinates.forEach(function(coordinate) {
                            paths.push([coordinate.lat, coordinate.long]);
                            getlat = coordinate.lat;
                            getlong = coordinate.long;
                        });
                    }
                    if(Date.parse(rb.rb_enddatetime) < now){
                        var update_rb = $firebaseObject(ref.child('road_block').child(rb_snapshot.key));
                        update_rb.rb_datecreated = rb.rb_datecreated;
                        update_rb.rb_desc = rb.rb_desc;
                        update_rb.rb_enddatetime = rb.rb_enddatetime;
                        update_rb.rb_name = rb.rb_name;
                        update_rb.rb_startdatetime = rb.rb_startdatetime;
                        update_rb.rb_status = 'INACTIVE';
                        update_rb.rb_location = rb.rb_location;
                        update_rb.rb_coordinates = rb.rb_coordinates;
                        update_rb.$save().then(function(ref) {
                            // toastr.success('error','Path has been deleted', 'You Successfully changed')
                        }, function(error) {
                            console.log("Error:", error);
                        });
                    }else if(Date.parse(rb.rb_startdatetime) > now){
                        var update_rb = $firebaseObject(ref.child('road_block').child(rb_snapshot.key));
                        update_rb.rb_datecreated = rb.rb_datecreated;
                        update_rb.rb_desc = rb.rb_desc;
                        update_rb.rb_enddatetime = rb.rb_enddatetime;
                        update_rb.rb_name = rb.rb_name;
                        update_rb.rb_startdatetime = rb.rb_startdatetime;
                        update_rb.rb_status = 'INACTIVE';
                        update_rb.rb_location = rb.rb_location;
                        update_rb.rb_coordinates = rb.rb_coordinates;
                        update_rb.$save().then(function(ref) {
                            // toastr.success('error','Path has been deleted', 'You Successfully changed')
                        }, function(error) {
                            console.log("Error:", error);
                        });

                    }else{
                        if(rb.rb_status == 'INACTIVE'){
                            var update_rb = $firebaseObject(ref.child('road_block').child(rb_snapshot.key));
                            update_rb.rb_datecreated = rb.rb_datecreated;
                            update_rb.rb_desc = rb.rb_desc;
                            update_rb.rb_enddatetime = rb.rb_enddatetime;
                            update_rb.rb_name = rb.rb_name;
                            update_rb.rb_startdatetime = rb.rb_startdatetime;
                            update_rb.rb_status = 'ACTIVE';
                            update_rb.rb_location = rb.rb_location;
                            update_rb.rb_coordinates = rb.rb_coordinates;
                            update_rb.$save().then(function(ref) {
                                // toastr.success('error','Path has been deleted', 'You Successfully changed')
                            }, function(error) {
                                console.log("Error:", error);
                            });
                        }
                        vm.allShapes.push({
                            id: rb_snapshot.key,
                            name: 'polygon',
                            color: color,
                            paths: paths,
                            type: 'RB'
                        });
                        var icon = {
                            url: url, // url
                            // scaled size = The size of the entire image after scaling, if any. Use this property to stretch/shrink an image or a sprite.
                            scaledSize: new google.maps.Size(30, 30), 
                            origin: new google.maps.Point(0,0), // origin
                            anchor: new google.maps.Point(0, 0) // anchor
                        };
                        marker = new google.maps.Marker({
                            position: new google.maps.LatLng(getlat, getlong),
                            map: vm.map,
                            icon: icon
                        });
                        markersArray.push(marker);
                    }
                });
            });
        }

    }
})();
