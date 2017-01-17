angular.module('RUN')
	.controller('LeaderboardCtrl', function ($scope, $timeout, $stateParams,$ionicLoading) {
		var vm = this;
		vm.runningLogs = [];
		var runAr = [];
    $ionicLoading.show();
		vm.defaultImg = "";
		var runId = $stateParams.runId
		firebase.database().ref('/defaultProfileImg').on('value', function (imgSnap) {
			$timeout(function () {
				vm.defaultImg = imgSnap.val();
			})
		});
		if (runId) {
			//get legend for perticular run
			firebase.database().ref('/scheduleRun/' + runId + '/leaderboard').orderByKey().on('value',function(runLegSnp){
				runAr = [];
				runLegSnp.forEach(function (user) {
					console.log(user.key);
					firebase.database().ref('/users/' + user.val()).once('value',function(usrSnp){
						runAr.unshift(usrSnp.val());
					})
				});
				$timeout(function () {
					vm.runningLogs = runAr;
          $ionicLoading.hide();
				})
			})

		} else {
			firebase.database().ref('users').orderByChild('speed').limitToLast(5).on('value', function (userSnap) {
				runAr = [];
				userSnap.forEach(function (user) {
					console.log(user.key)
					runAr.unshift(user.val());
				});
				$timeout(function () {
					vm.runningLogs = runAr;
          $ionicLoading.hide();
				})
			});

		}
	});
