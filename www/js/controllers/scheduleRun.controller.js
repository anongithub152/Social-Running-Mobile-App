angular.module('RUN')
	.controller('ScheduleRunCtrl', function ($scope, dbUtility, $http, $state, LoginService, $filter, $stateParams,$ionicLoading,$ionicHistory) {
		var vm = this;
		vm.schRunObj = {};
		var uid = firebase.auth().currentUser.uid;
		var reqCode = dbUtility.getRequestCode();
		vm.minDate = $filter('date')(new Date(), 'yyyy-MM-dd');
		vm.disableActionBtn = false;
    vm.markerSelected='';
		vm.virtualSchRunObj = {
			time: '',
			timeZone: '',
			distance: '',
			runnerId: ''
		}
		vm.disavleScheduleBtn = true;
		if ($stateParams.scheduleType == 'regular') {
			vm.scheduleType = true;
			vm.titleName = 'Schedule Run';

			var formMap;
			var marker;
			var currentLocation;
			vm.schRunObj.date = new Date(new Date().setHours(0, 0, 0, 0));
			var api = "http://maps.googleapis.com/maps/api/geocode/json?latlng=";
			vm.initMap = initMap;
			var geoLoc = [0, 0];
			var options = {
				format: 'mm/dd/yyyy hh:ii',
				autoclose: true
			};
			//add marker for current user location
			function addCurrentLocMarker(pos) {
				if (marker) {
					marker.setMap(null);
				}
				marker = new google.maps.Marker({
					map: formMap,
					animation: google.maps.Animation.BOUNCE,
					position: pos
				});
        vm.markerSelected=marker;
				//content

				// var address = (vm.schRunObj.address) ? getfullAddress(vm.schRunObj.address) : "address not found";
				// var content = "<h3>Scheduled Run</h3></br><h4>Time:" + vm.schRunObj.time + "</br>Miles:" + vm.schRunObj.miles + "</br>Address:" + address + "</h4>";

				// bindInfoClick(marker, content);
			}
			//get full address from array
			function getfullAddress(addressArr) {
				if (addressArr.data && addressArr.data.status === "OK" && addressArr.data.results.length > 0) {
					var addrResult = addressArr.data.results;
					return addressArr.data.results[0].formatted_address;
				} else {
					return "";
				}
			}
			//bind click event and show text on marker on map
			// function bindInfoClick(marker, content) {
			// 	//adding info
			// 	var info = new google.maps.InfoWindow({
			// 		content: content
			// 	});

			// 	//adding click
			// 	google.maps.event.addListener(marker, 'click', function () {
			// 		info.open(formMap, marker);
			// 	});

			// }
			//init map
			function initMap() {
				var options = { enableHighAccuracy: true };
				navigator.geolocation.getCurrentPosition(function (position) {
					formMap = new google.maps.Map(document.getElementById('formMap'), {
						zoom: 16,
						center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						clickableIcons: false
					});
					google.maps.event.addListener(formMap, "click", function (event) {
						currentLocation = event.latLng;
						addCurrentLocMarker(currentLocation);
						geoLoc = [currentLocation.lat(), currentLocation.lng()]
						var url = api + currentLocation.lat() + "," + currentLocation.lng();
						$http.get(url).then(function (data) {
							vm.schRunObj.address = getfullAddress(data);
							vm.schRunObj.lat = currentLocation.lat();
							vm.schRunObj.lng = currentLocation.lng();
						}, function () {
							vm.schRunObj.address = null;
						})
					});
				}, function (err) {
					console.log(err);
				}, options);
			}
			//on schedule click
			vm.schedule = function () {
        $ionicLoading.show();
				var userId = firebase.auth().currentUser.uid;
				vm.schRunObj.uid = userId;
				if (vm.schRunObj.date && vm.schRunObj.time && vm.schRunObj.distance && vm.schRunObj.speed && vm.markerSelected) {
					vm.schRunObj.date.setHours(vm.schRunObj.time.getHours(), vm.schRunObj.time.getMinutes(), 0, 0)
					var date = Date.parse(vm.schRunObj.date);
					vm.schRunObj.scheduledTime = date;
					vm.schRunObj.isActive = true;
					dbUtility.saveScheduleRun(userId, angular.copy(vm.schRunObj), geoLoc);
					vm.schRunObj = {};
				}
				else {
					LoginService.showPopUpErr('auth/all-fields');
				}

			}
		}
		else {
			vm.titleName = 'Schedule Virtual Run';
			vm.scheduleType = false;
			vm.fnSubmitVirtualRun = function () {
        $ionicLoading.show();
				//find if email id is present
				firebase.database().ref('/users/').orderByChild('emailId').equalTo(vm.virtualSchRunObj.runnerId).once('value', function (usrSnp) {
					var userSelected = usrSnp.val();
					if (userSelected) {
						if (vm.virtualSchRunObj.time && vm.virtualSchRunObj.timeZone && vm.virtualSchRunObj.distance && vm.virtualSchRunObj.runnerId) {
							vm.disableActionBtn = true;
							for (key in userSelected) {
								addVirtualRun(userSelected[key]);
								break;
							}
						} else {
							LoginService.showPopUpErr('auth/all-fields');
						}
					} else {
						LoginService.showPopUpErr('auth/email-not-found');
					}
				})
        $ionicLoading.hide();
			}
			function addVirtualRun(userSelected) {
        $ionicLoading.show();
				var time = (new Date().getTime()).toString();
				var refKey = firebase.database().ref('scheduleRun').push().key;
				vm.virtualSchRunObj.scheduledTime = time;
				vm.virtualSchRunObj.isActive = true;
				firebase.database().ref('scheduleRun/' + refKey).update(vm.virtualSchRunObj, function () {
					firebase.database().ref('joinedRun/' + uid).push(refKey, function () {
						//set notification
						var notificationId = firebase.database().ref('/notificaitons/').push().key;
						var requestObj = {
							from: uid,
							to: userSelected.uid,
							runId: refKey,
							runType: 'virtualRun',
							isActive: true,
							status: reqCode.pending,
							createdOn: time,
							updated: time,
							notificationId: notificationId
						}
						firebase.database().ref('/notificaitons/' + notificationId).set(requestObj).then(function () {
							var userNotif = {
								id: notificationId,
								seen: false,
								createdOn: time,
								statusCode: reqCode.pending
							}
							var userNotifSelf = {
								id: notificationId,
								seen: false,
								createdOn: time,
								statusCode: reqCode.myRequest
							}
							firebase.database().ref('/userNotifications/' + uid + '/' + reqCode.myRequest + '/' + notificationId).set(userNotifSelf);
							firebase.database().ref('/userNotifications/' + userSelected.uid + '/' + reqCode.pending + '/' + notificationId).set(userNotif);
							$state.go('app.home', { openAccordin: 'open' });
              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $ionicLoading.hide();
						});
					});
				});
			}
		}
	});
