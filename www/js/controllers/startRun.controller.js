angular.module('RUN')
    .controller('StartRunCtrl', function ($scope, $interval, $timeout, $cordovaGeolocation, $state, $stateParams, dbUtility, mtrToMileFilter, $localStorage, $ionicLoading) {
        console.log($stateParams);
        var vm = this;
        var options = {
            timeout: 1000,
            maximumAge: 0,
            enableHighAccuracy: true // may cause errors if true
        };
        var runMap;
        var marker;
        var intervRef;
        var prevLocation;
        var dist;
        var watch;
        var totalTime = 0;
        vm.distance = 0;
        vm.speed = 0;
        vm.timer = 0;
        vm.calories = 0;
        var timerInterval;
        var locArr = [];
        var runPath;
        var uid = firebase.auth().currentUser.uid;
        var directionsService = new google.maps.DirectionsService();
        var startDate = new Date();
        vm.stopRunClicked = false;
        var userDetails = $localStorage.userDetails;
        var zoomLevel = 16;
        var curRunId = $stateParams.scheduleRunRecord.scheduleRunId;
        vm.updateMapRealTime = updateMapRealTime;
        function updateMapRealTime(isFirst) {
            $scope.$on("$destroy", function () {
                firebase.database().ref('/users/' + uid).update({ activeRunId: 0 });
                dbUtility.removeUserLocation(uid);
                if (timerInterval) {
                    $interval.cancel(timerInterval);;
                }
                if (watch) {
                    navigator.geolocation.clearWatch(watch);
                }
            });
            navigator.geolocation.getCurrentPosition(function (position) {
                try {
                    console.log('A');
                    locArr.push(formatLoc(position));
                    redrawLine();
                    // firebase.database().ref('/users/' + uid).update({activeRunId:curRunId});
                    // dbUtility.setCurrentLocation(uid, [position.coords.latitude, position.coords.longitude])
                    var latLang = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    if (isFirst) {
                        prevLocation = latLang;
                    }
                    console.log('C');
                    runMap = new google.maps.Map(document.getElementById('runMap'), {
                        zoom: zoomLevel,
                        center: latLang,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        clickableIcons: false
                    });
                    if (marker) {
                        marker.setMap(null);
                    }
                    marker = new google.maps.Marker({
                        map: runMap,
                        animation: google.maps.Animation.BOUNCE,
                        position: latLang,
                        icon: "run_marker.png"
                    });
                    console.log('D');
                }
                catch (ex) {
                    console.log('exception raised');
                    console.log(ex);
                }

            }, function (err) {
					console.log(err);
				},options);
        }
        vm.startRun = function () {
            zoomLevel = 18;
            if (runMap)
                runMap.setZoom(18);
            if (angular.isUndefined(timerInterval)) {
                timerInterval = $interval(function () {
                    totalTime += 1;
                    vm.timer = Math.floor(totalTime / 3600) + ":" +
                        Math.floor(totalTime / 60 % 60) + ":" +
                        Math.floor(totalTime % 60);
                }, 1000);
            }
            watch = navigator.geolocation.watchPosition(function (position) {
                locArr.push(formatLoc(position));
                redrawLine();
                // dbUtility.setCurrentLocation(uid, [position.coords.latitude, position.coords.longitude]);
                var latLang = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                runMap.setCenter(latLang);
                if (prevLocation && latLang) {
                    var request = {
                        origin: prevLocation,
                        destination: latLang,
                        travelMode: google.maps.TravelMode.WALKING
                    };
                    directionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            dist = response.routes[0].legs[0].distance.value;
                            $timeout(function () {
                                vm.distance = vm.distance + dist;
                                vm.calories = calcCalories();
                                vm.speed = calcSpeed(vm.distance,totalTime);
                            })
                        } else {
                            console.log('path not found');
                        }
                    });
                    // dist = google.maps.geometry.spherical.computeDistanceBetween(prevLocation, latLang);
                }
                prevLocation = latLang;
                if (marker) {
                    marker.setMap(null);
                }
                marker = new google.maps.Marker({
                    map: runMap,
                    animation: google.maps.Animation.BOUNCE,
                    position: latLang,
                    icon: "run_marker.png"
                });

            }, function (err) {
					console.log(err);
				},options);
            // watch = $cordovaGeolocation.watchPosition(options);
            // watch.then(
            //     null,
            //     function (err) {
            //         // error
            //     },
            //     function (position) {

            //     });

        }
        function calcSpeed(distance,totalTime){
            var mileDist = vm.distance * 0.00062137;
            var timeMin = (totalTime / 60);
            var speed = Math.ceil(mileDist / (timeMin / 60));
            return speed;
            // firebase.database().ref('/users/' + uid).update({activeRunId:value});
        }
        function formatLoc(position) {
            return {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
        }
        vm.pauseRun = function () {
            zoomLevel = 16;
            if (runMap)
                runMap.setZoom(16);
            if (watch)
                navigator.geolocation.clearWatch(watch);
            $interval.cancel(timerInterval);
            timerInterval = undefined;
        }
        function calcCalories() {
            var mileDist = vm.distance * 0.00062137;
            var cal = 0;
            var timeMin = (totalTime / 60);
            if (userDetails && userDetails.height && userDetails.weight && userDetails.age) {
                // var bmrOffset = (userDetails.gender === "Male") ? 5 : -161;
                // var bmr = 10 * userDetails.weight + 6.25 * userDetails.height - 5 * userDetails.age + bmrOffset;
                var speed = calcSpeed(vm.distance,totalTime);
                var met = 6;
                if (speed >= 6 && speed < 8) {
                    met = 10;
                } else if (speed >= 8 && speed < 10) {
                    met = 13.5;
                } else if (speed >= 10) {
                    met = 16;
                }
                cal = ((met * 3.5 * 0.453592 * userDetails.weight) / 200) * timeMin; // (METs x 3.5 x body weight in kg)/200 = calories/minute
                // cal = (bmr) * (met / 24) * timeHr;
            } else {
                cal = parseFloat(mileDist) * 30;
            }
            if (cal > 0) {
                return parseFloat(cal).toFixed(2);
            } else {
                return 0;
            }
        }
        function redrawLine() {
            if (runPath)
                runPath.setMap(null);

            runPath = new google.maps.Polyline({
                path: locArr,
                geodesic: true,
                strokeColor: '#3366ff',
                strokeOpacity: 1.0,
                strokeWeight: 6
            });

            runPath.setMap(runMap);
            console.log('drawing line...')
        }
        vm.stopRun = function ($event) {
            $ionicLoading.show();
            firebase.database().ref('/users/' + uid).update({ activeRunId: 0 });
            navigator.geolocation.clearWatch(watch);
            $interval.cancel(timerInterval);
            vm.stopRunClicked = true;
            timerInterval = undefined;
            var mileDist = vm.distance * 0.00062137;
            var timeHr = (totalTime / 3600);
            var speed = Math.round(mileDist / timeHr);
            var runLog = {
                'dateTime': startDate,
                'timer': vm.timer,
                'calories': vm.calories,
                'distance': mtrToMileFilter(vm.distance) + ' Miles',
                'scRunId': curRunId,
                'speed': speed
            }
            dbUtility.removeUserLocation(uid);
            firebase.database().ref('/scheduleRun/' + curRunId).once('value', function (scRunSnp) {
                if (uid === scRunSnp.val().uid) {
                    dbUtility.removeFromJoinedRun(uid, curRunId, true);
                } else {
                    dbUtility.removeFromJoinedRun(uid, curRunId, false);
                }
            })
            firebase.database().ref('/scheduleRun/' + curRunId + '/leaderboard').push(uid);
            var refKey = firebase.database().ref('/runningLog/' + uid).push().key;
            firebase.database().ref('/runningLog/' + uid + '/' + refKey).update(runLog, function () {
                // var refScKey = firebase.database().ref('/scheduleRun/' + curRunId + '/isActive');
                // refScKey.set(false, function () {
                $timeout(function () {
                    firebase.database().ref('/runningLog/' + uid).once('value', function (runLogs) {
                        var runLogsList = runLogs.val();
                        if (runLogsList) {
                            var avgSpeed = 0;
                            for (var k in runLogsList) {
                                avgSpeed = parseFloat(runLogsList[k].speed) + parseFloat(avgSpeed);
                            }
                            avgSpeed = parseFloat(avgSpeed / Object.keys(runLogsList).length).toFixed(2);
                        }
                        avgSpeed = avgSpeed.toString() + " Miles/Hr"
                        var speedRef = firebase.database().ref('/users/' + uid + '/speed');
                        speedRef.set(avgSpeed, function () {
                            $ionicLoading.hide();
                            $state.go('app.leaderboard', { runId: curRunId });
                        })
                    });
                }, 500)
                // });
            });

        }
    });
