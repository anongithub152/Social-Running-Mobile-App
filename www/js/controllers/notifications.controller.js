angular.module('RUN')
    .controller('NotificationsCtrl', function ($scope, dbUtility, $timeout, $ionicLoading, $state, $stateParams) {
        var vm = this;
        var uid = firebase.auth().currentUser.uid;
        vm.keyName = [];
        vm.groups = [];
        $ionicLoading.show();
        vm.defaultImg = '';
        var reqCode = dbUtility.getRequestCode();
        console.log('/userNotifications/' + uid);
        var l = Object.keys(reqCode).length;
        vm.fninitNotificaion = fninitNotificaion;
        vm.notificationAction = function (notification, status) {
            vm.disableBtn = true;
            if (status === 4) {
                //seen flag
                firebase.database().ref('/userNotifications/' + uid + '/' + notification.status + '/' + notification.notificationId).remove().then(function () {
                    vm.groups = [];
                    vm.fninitNotificaion();
                });
            } else {
                if (status === 'accepted') {
                    if (notification.runType === 'virtualRun') {
                        var scdRunRef = firebase.database().ref('/joinedRun/' + notification.To.uid).push().key;
                        firebase.database().ref('/joinedRun/' + notification.To.uid + '/' + scdRunRef).set(notification.runId);
                    } else {
                        var scdRunRef = firebase.database().ref('/joinedRun/' + notification.From.uid).push().key;
                        firebase.database().ref('/joinedRun/' + notification.From.uid + '/' + scdRunRef).set(notification.runId);
                    }
                }
                var notificationObj = {
                    status: reqCode[status],
                    updated: new Date().getTime()
                };

                firebase.database().ref('/notificaitons/' + notification.notificationId).update(notificationObj).then(function () {
                    firebase.database().ref('/userNotifications/' + notification.From.uid + '/3/' + notification.notificationId + '/updatedOn').set(new Date().getTime());
                    var userNotifRef = firebase.database().ref('/userNotifications/' + uid + '/' + notification.status + '/' + notification.notificationId);
                    userNotifRef.once('value', function (notfSnap) {
                        var notificaiton = notfSnap.val();
                        firebase.database().ref('/userNotifications/' + uid + '/' + reqCode[status] + '/' + notification.notificationId).set(notificaiton).then(function () {
                            vm.groups = [];
                            vm.fninitNotificaion();

                        });
                        userNotifRef.remove();
                    })
                });
            }
        }
        firebase.database().ref('/defaultProfileImg').on('value', function (imgSnap) {
            $timeout(function () {
                vm.defaultImg = imgSnap.val();
            })
        });
        vm.onContrlInit = function () {
            firebase.database().ref('/userNotifications/' + uid)
                .on('value', function () {
                    console.log('value cahnge called')
                    fninitNotificaion();
                })
        }
        function fninitNotificaion() {
            vm.groups = [];
            for (var key in reqCode) {
                vm.groups.push({
                    items: [],
                    name: key,
                    keyId: reqCode[key]
                });
            }
            for (var key in reqCode) {
                firebase.database().ref('/userNotifications/' + uid + '/' + reqCode[key])
                    .orderByChild('createdOn')
                    .limitToLast(10)
                    .once('value', function (notifySnap) {
                        updateNotifications(notifySnap);
                    });
            }
            $ionicLoading.hide();
        }
        function updateNotifications(notificationSnap) {
            var isInitApp = true;
            notificationSnap.forEach(function (notificationSnp) {
                notificationIds = notificationSnp.val();
                firebase.database().ref('/notificaitons/' + notificationIds.id)
                    .once('value', function (detSnap) {
                        var notiDetails = detSnap.val();
                        // notiDetails.notificationId = notificationIds.id;
                        firebase.database().ref('/scheduleRun/' + notiDetails.runId).once('value', function (runSnap) {
                            notiDetails.runDetails = runSnap.val();
                            firebase.database().ref('/users/' + notiDetails.to).once('value', function (userToSnap) {
                                notiDetails.To = userToSnap.val();
                                notiDetails.To.uid = userToSnap.key;
                                firebase.database().ref('/users/' + notiDetails.from).once('value', function (userFromSnap) {
                                    notiDetails.From = userFromSnap.val();
                                    notiDetails.From.uid = userFromSnap.key;
                                    for (var i = 0; i < l; i++) {
                                        if (notiDetails.From.uid === uid) {
                                            notiDetails.OrgStatus = notiDetails.status;
                                            notiDetails.status = 4;
                                            $timeout(function () {
                                                chkAndAdd(vm.groups[reqCode['myRequest']].items, notiDetails)
                                                // vm.groups[reqCode['myRequest']].items.push(notiDetails);
                                            })
                                            console.log(vm.groups[i]);
                                            break;
                                        } else if (vm.groups[i].keyId === notiDetails.status) {
                                            $timeout(function () {
                                                chkAndAdd(vm.groups[i].items,notiDetails)
                                                // vm.groups[i].items.push(notiDetails);
                                            })
                                            console.log(vm.groups[i]);
                                            break;
                                        }
                                    }
                                });
                            });
                        });
                    })
            });
        }
        function chkAndAdd(NotifArr, notifObj){
            //check if object already present update else insert
            var arrObj = filterArray(NotifArr, notifObj);
            if(arrObj){
                arrObj = notifObj;
            }else{
                NotifArr.push(notifObj);
            }
        }
        function filterArray(NotifArr,notifObj){
            var l = NotifArr.length;
            for(var i=0;i<l;i++){
                if(NotifArr[i].notificationId === notifObj.notificationId){
                    return NotifArr[i];
                }
            }
            return null;
        }
        vm.toggleGroup = function (group) {
            if (vm.isGroupShown(group)) {
                vm.shownGroup = null;
            } else {
                vm.shownGroup = group;
            }
        };
        vm.isGroupShown = function (group) {
            return vm.shownGroup === group;
        };

        vm.onSwipeLeft = function () {
            alert();
        }
    });
