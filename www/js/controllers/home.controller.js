angular.module('RUN')
	.controller('HomeCtrl', function ($scope, $localStorage, dbUtility, $timeout, $stateParams, $state, $rootScope, $ionicPlatform, $cordovaLocalNotification, $filter, shareData, $ionicPopup, $ionicHistory,$ionicLoading) {
		var vm = this;
		var notificationId;
    $ionicLoading.show();
		var uid = firebase.auth().currentUser.uid;
		var runReminder = shareData.getData('runReminder');
		var allowedRunDelay = shareData.getData('allowedRunDelay');
		var runReminder = shareData.getData('runReminder');
		vm.toggleList = false;
		var userDetails = $localStorage.userDetails;
		var geoFire = dbUtility.getGeoFireInstance();
		vm.initHome = function () {
			console.log('run init');
			$ionicHistory.clearHistory();
			if (!(userDetails.gender && userDetails.dob && userDetails.age && userDetails.height && userDetails.weight)) {
				$state.go('userinfo');
			}
			if ($stateParams && $stateParams.openAccordin && $stateParams.openAccordin == 'open') {
				vm.toggleList = true;
			}
			// var result = dbUtility.readData('/scheduleRun');
			vm.runListArr = [];
			// $ionicPlatform.ready(function () {
			firebase.database().ref('/joinedRun/' + uid).once('value', function (userSnap) {
				vm.runListArr = [];
				var joinedRuns = userSnap.val();
				console.log(joinedRuns)
				vm.joinedRuns = joinedRuns;
				if (joinedRuns) {
					$timeout(function () {
						getJoinedRuns(joinedRuns);
					}, 500);
				}
			});
      $ionicLoading.hide();
			// });
		}
		function getJoinedRuns(joinedRuns) {
			try {
				if (window.cordova) {
					if ($cordovaLocalNotification && $cordovaLocalNotification.hasPermission) {
						$cordovaLocalNotification.hasPermission($scope).then(function (isGranted) {
							console.log('permission is granted=' + isGranted);
							if (isGranted) {
								$cordovaLocalNotification.clearAll($scope).then(function () {
									getFilteredScheduledRuns(joinedRuns, true);
								});
							} else {
								$cordovaLocalNotification.registerPermission($scope).then(function (isGranted) {
									console.log('permission is granted after register=' + isGranted);
									if (isGranted) {
										$cordovaLocalNotification.clearAll($scope).then(function () {
											getFilteredScheduledRuns(joinedRuns, true);
										});
									} else {
										getFilteredScheduledRuns(joinedRuns, false);
									}
								})
							}
						});
					} else {
						getFilteredScheduledRuns(joinedRuns, false);
					}

				} else {
					getFilteredScheduledRuns(joinedRuns, false);
				}
			} catch (err) {
				console.log('Exception occured');
				getFilteredScheduledRuns(joinedRuns, false);
			}

      $ionicLoading.hide();
		}

		function getFilteredScheduledRuns(joinedRuns, registerNotification) {
			var scRunAr = [];
			notificationId = 0;
			for (var key in joinedRuns) {
				if (joinedRuns[key]) {
					firebase.database().ref('/scheduleRun/' + joinedRuns[key]).once('value', function (scRuns) {
						var scRunObj = scRuns.val();
						if (scRunObj && scRunObj.isActive && scRunObj.isActive.toString() !== 'false') {
							var scheduledTime = scRunObj.scheduledTime;
							var presentTime = (new Date().getTime() - allowedRunDelay);
							var timeDifference = scheduledTime - presentTime;
							scRunObj.scheduleRunId = scRuns.key;
							scRunObj.notificationId = notificationId++;
							$timeout(function () {
								if (scheduledTime > 0 && timeDifference > 0) {
									scRunObj.dispDate = new Date(parseInt(scRunObj.scheduledTime));
									vm.runListArr.push(scRunObj);
									if ((timeDifference < runReminder) && registerNotification) {
										scheduleRunNotification(scRunObj);
									}
								} else {
									firebase.database().ref('joinedRun/' + uid + '/' + scRuns.key).set(null);
									if(geoFire)
										geoFire.remove(scRuns.key);
								}
							});
						}
					});
				}
			}

		}

		function scheduleRunNotification(scRunObj) {
			$ionicPlatform.ready(function () {
				$scope.scheduleDelayedNotification = function (scRunObjlo) {
					console.log('scheduling notification event');
					//schedule nottification only working on android
					// $cordovaLocalNotification.schedule({
					// 	id: scRunObj.notificationId,
					// 	title: "Scheduled Run at " + $filter('date')(scRunObj.time, 'h:mma'),
					// 	text: 'Location: ' + scRunObj.address,
					// 	at: new Date(new Date(scRunObj.time).getTime - runReminder)
					// }).then(function (result) {
					// 	// ...
					// 	console.log('schld notificaiton result id= ');
					// });
					// }
				};
				document.addEventListener("deviceready", function (scRunObjlo) {
					console.log('dev ready called');
					$scope.scheduleDelayedNotification(scRunObjlo);
				});
			});
		}

		vm.fnGoToStart = function (run) {
			if (run.scheduledTime <= (new Date().getTime())) {
				firebase.database().ref('/users/' + uid).update({ activeRunId: run.scheduleRunId });
				$state.go('app.startrun', { scheduleRunRecord: run });
			} else {
				var alertPopup = $ionicPopup.alert({
					title: 'Schedule Run',
					template: 'Run is yet to start.',
					cssClass: 'alertBoxSR'
				});
			}
		}
		vm.shownGroup;
		vm.isGroupShown = function (group) {
			if (group.length > 0) {
				return vm.shownGroup === group;
			}
		};
		vm.toggleGroup = function (group) {
			if (vm.isGroupShown(group)) {
				vm.shownGroup = null;
			} else {
				vm.shownGroup = group;
			}
		};

		// function getScheduledRuns() {
		// 	result.then(function (data) {
		// 		console.log(data.val());
		// 		var runlist = data.val();
		// 		for (var key in runlist) {
		// 			runListArr.push(runlist[key]);
		// 		}
		// 		$timeout(function () {
		// 			vm.scheduleRuns = runListArr;
		// 		});
		// 	});
		// }
	});

