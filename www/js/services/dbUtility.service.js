angular.module('RUN')
	.factory('dbUtility', function ($state, $timeout, $ionicHistory) {
		var firebaseRef = firebase.database().ref().push();
		var geoFire = new GeoFire(firebaseRef);
		var requestStatus = {
			pending: 0,
			accepted: 1,
			rejected: 2,
			myRequest: 3
		}
		// var firebaseRef= new Firebase("https://popping-torch-4767.firebaseio.com/");
		var geoFire = new GeoFire(firebase.database().ref().child("_geofire"));
		return {
			writeData: writeData,
			readData: readData,
			saveScheduleRun: saveScheduleRun,
			setCurrentLocation: setCurrentLocation,
			getRunnersAround: getRunnersAround,
			clearLocation: clearLocation,
			getGeoFireInstance: getGeoFireInstance,
			removeUserLocation: removeUserLocation,
			getRequestCode: getRequestCode,
			removeFromJoinedRun:removeFromJoinedRun
		}
		function getRequestCode() {
			return requestStatus;
		}
		function writeData(path, uid, obj) {
			var ret = firebase.database().ref(path + uid).set(obj);
		}
		function removeUserLocation(uid) {
			var pro = geoFire.remove(uid);
		}
		function getGeoFireInstance() {
			return geoFire;
			// return geoFire;
		}
		function readData(path, uid) {
			if (uid) {
				path = path + uid
			}
			return firebase.database().ref(path).once('value')
		}
		function updateData(uid) {
			// update json
		}
		function saveScheduleRun(uid, obj, geoLoc) {
			var refKey = firebase.database().ref('scheduleRun').push().key;
			console.log('ref key 1');
			console.log(refKey)
			firebase.database().ref('scheduleRun/' + refKey).update(obj, function () {
				saveJoinedRun(uid, refKey);
				console.log('ref key 2')
				console.log(refKey)
				var pro = geoFire.set(refKey, geoLoc).then(function () {
					console.log('location set');
				}).catch(function (error) {
					console.log('loc set err');
				});
			});
		}
		function removeFromJoinedRun(uid,curRunId,removeGeo){
			firebase.database().ref('/joinedRun/' + uid).once('value', function (joinSnp) {
                var joinRun = joinSnp.val();
                for (var k in joinRun)
                    if (joinRun[k] === curRunId) {
                        firebase.database().ref('/joinedRun/' + uid + '/' + k).set(null);
                        break;
                    }
            })
			if(removeGeo && geoFire){
				geoFire.remove(curRunId);
			}
		}
		function saveJoinedRun(uid, obj) {
			firebase.database().ref('joinedRun/' + uid).push(obj, function () {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.home', { openAccordin: 'open' });
			});
		}
		function setCurrentLocation(uid, location, runId) {
			console.log('updating l...');
			console.log(geoFire);
			var pro = geoFire.set(uid, location).then(function () {
				console.log('location set');
			}).catch(function (error) {
				console.log('loc set err');
			});
			// var pro = geoFire.set(uid, location).then(function () {
			// 	console.log('set location');
			// }).catch(function (err) {
			// 	console.log(err);
			// });
			console.log(pro);
			return pro;
		}
		function getRunnersAround(location) {
			var geoQuery = geoFire.query({
				center: location,
				radius: 1.609 //kilometers
			});
			geoQuery.on("key_entered", function (key, location, distance) {
				alert("Bicycle shop " + key + " found at " + location + " (" + distance + " km away)");
			});
			geoQuery.on("key_exited", function (key, location, distance) {
				alert("Bicycle shop " + key + " left query to " + location + " (" + distance + " km away)");
			});
		}
		function clearLocation(uid) {
			firebaseRef.child(uid).remove();
		}
	});
