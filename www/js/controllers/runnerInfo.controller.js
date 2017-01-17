angular.module('RUN')
    .controller('RunnerInfoCtrl', function ($scope, $stateParams, dbUtility, $timeout, $ionicLoading) {
        var vm = this;
        var userKey = $stateParams.key;
        vm.runInfo;
        var uid = firebase.auth().currentUser.uid;
        var reqCode = dbUtility.getRequestCode();
        vm.disableJoin = false;
        vm.defaultImg;
        firebase.database().ref('/defaultProfileImg').once('value', function (imgSnap) {
            vm.defaultImg = imgSnap.val();
        });
        console.log(vm.schRunId);
        $ionicLoading.show();
        firebase.database().ref('scheduleRun/' + userKey).once('value', function (scRunSnp) {
            $timeout(function () {
                vm.runInfo = scRunSnp.val();
                firebase.database().ref('/users/' + vm.runInfo.uid).once('value', function (runUserSnp) {
                    var runOrgUser = runUserSnp.val();
                    $timeout(function () {
                        vm.runInfo.photoURL = runOrgUser.photoURL;
                        vm.runInfo.name = runOrgUser.name;
                    });
                });
            });
            $ionicLoading.hide();
        })
        vm.joinRun = function () {
            var time = new Date().getTime();
            if (vm.runInfo) {
                vm.disableJoin = true;
                var notificationId = firebase.database().ref('/notificaitons/').push().key;
                var requestObj = {
                    from: uid,
                    to: vm.runInfo.uid,
                    runId: userKey,
                    runType: 'scheduleRun',
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
                    firebase.database().ref('/userNotifications/' + vm.runInfo.uid + '/' + reqCode.pending + '/' + notificationId).set(userNotif);
                });

            }
        }
    });