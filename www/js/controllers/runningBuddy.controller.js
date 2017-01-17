angular.module('RUN')
	.controller('RunningBuddyCtrl', function ($scope, dbUtility, $cordovaGeolocation, $state, shareData) {
		var vm = this;
		var zoomLevel = 8;
		var selfMarker;
		vm.keyAr = [];
		var geoQuery;
		var markerObj = {};
		var watch;
		var zIndex = 100;
		var uid = firebase.auth().currentUser.uid;
		var allowedRunDelay = shareData.getData('allowedRunDelay');
		// var geoFire = dbUtility.getGeoFireInstance();
		var options = {
			timeout: 1000,
			maximumAge: 0,
			enableHighAccuracy: true // may cause errors if true
		};
		vm.initRunningBuddy = initRunningBuddy;
		$scope.$on("$destroy", function () {
			if (watch) {
				navigator.geolocation.clearWatch(watch);
			}
		});
		function initRunningBuddy() {
			navigator.geolocation.getCurrentPosition(function (position) {
				var latLang = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				nearByMap = new google.maps.Map(document.getElementById('nearByMap'), {
					zoom: zoomLevel,
					center: latLang,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					clickableIcons: false
				});
				selfMarker = new google.maps.Marker({
					map: nearByMap,
					animation: google.maps.Animation.BOUNCE,
					position: latLang,
					icon: "run_marker.png",
					zIndex: 50
				});
				geoQuery = dbUtility.getGeoFireInstance().query({
					center: [position.coords.latitude, position.coords.longitude],
					radius: 1000
				});
				var readyGeoQ = geoQuery.on("ready", function () {
					console.log('ready called');
				});
				console.log(readyGeoQ);
				var keyEnter = geoQuery.on("key_entered", function (key, location) {
					var item = { key: key, location: location };
					console.log('key entered on directive controller=');
					createMarker(item);
				});
				var keyEnter = geoQuery.on("key_moved", function (key, location) {
					var item = { key: key, location: location };
					console.log('key entered on directive controller=');
					createMarker(item);
				});
				var keyExit = geoQuery.on("key_exited", function (key, location) {
					if (markerObj[key]) {
						markerObj[key].setMap(null);
					}
				});
				initContinousWatchBuddy();

			}, function (err) {
					console.log(err);
				}, options)
		}
		function initContinousWatchBuddy() {
			console.log('init');
			watch = navigator.geolocation.watchPosition(function (position) {
				var latLang = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				nearByMap.setCenter(latLang);
				if (selfMarker) {
					selfMarker.setMap(null);
				}
				selfMarker = new google.maps.Marker({
					map: nearByMap,
					animation: google.maps.Animation.BOUNCE,
					position: latLang,
					icon: "run_marker.png",
					zIndex: 50
				});
				console.log([position.coords.latitude, position.coords.longitude]);

				geoQuery.updateCriteria({
					center: [position.coords.latitude, position.coords.longitude]
				});
			}, function (err) {
					console.log(err);
				},options);
			// watch = $cordovaGeolocation.watchPosition(options);
			// watch.then(
			// 	null,
			// 	function (err) {
			// 		// error
			// 	},
			// 	function (position) {

			// 	}
			// );
		}
		function createMarker(runner) {
			firebase.database().ref('scheduleRun/' + runner.key).once('value', function (scRunSnp) {
				var scRun = scRunSnp.val();
				var scheduledTime = scRun.scheduledTime;
				var presentTime = (new Date().getTime() - allowedRunDelay);
				var timeDifference = scheduledTime - presentTime;
				if (scheduledTime > 0 && timeDifference > 0) {
					console.log('createing marker');
					var location = new google.maps.LatLng(runner.location[0], runner.location[1]);
					var key = runner.key;
					if (location.length == 0)
						return;
					if (markerObj[key]) {
						markerObj[key].setMap(null);
					}
					zIndex++;
					markerObj[key] = new google.maps.Marker({
						map: nearByMap,
						position: location,
						zIndex: zIndex
					});
					var markerClickEv = function () {
						// firebase.database().ref('/users/' + key + '/activeRunId').once('value',function(scRunSnp){
						$state.go('app.runnerInfo', { 'key': key });
						// })
					}
					// //adding click
					google.maps.event.addListener(markerObj[key], 'click', markerClickEv);
					// firebase.database().ref('/scheduleRun/' + key).once('value', function (scRunObjSnap) {
					// 	var scRunObj = scRunObjSnap.val();
					// 	console.log('register click');
					// 	console.log(scRunObj);

					// })
					// var info = new google.maps.InfoWindow({
					// 	content: content
					// });
				} else {
					dbUtility.removeFromJoinedRun(uid, scRunSnp.key, true);
				}
			});
		}
	});