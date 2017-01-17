angular.module('RUN')
	.controller('ProfileCtrl', function($scope, $cordovaCamera, $localStorage,$ionicPopup,$timeout, dbUtility,$ionicLoading) {
		var vm = this;
    var myPopUp={};
    $ionicLoading.show();
		vm.items=$localStorage.userDetails;
		//vm.items=$localStorage.userDetails;
    vm.items.dateOfBirth = new Date(vm.items.dob);
    vm.usrImg = $localStorage.userDetails.photoUrl;
    var uid = firebase.auth().currentUser.uid;
    if(!vm.usrImg){
      firebase.database().ref('/defaultProfileImg').once('value', function (imgSnap) {
        $timeout(function(){
          vm.usrImg = imgSnap.val();
        })
      });
    }
    $ionicLoading.hide();

    //default img if not present

		vm.editProfileImage = function(type){
      myPopUp.close();
			var options = {
	            quality : 75,
	            destinationType : Camera.DestinationType.DATA_URL,
	            sourceType :type=='cam'?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
	            allowEdit : false,
	            encodingType: Camera.EncodingType.JPEG,
	            popoverOptions: CameraPopoverOptions,
	            saveToPhotoAlbum: false
        	};

        $cordovaCamera.getPicture(options).then(function(imageData) {
        	vm.usrImg = "data:image/jpeg;base64,"+imageData;
          var userObj = firebase.auth().currentUser;
          userObj.updateProfile({
              photoURL: vm.usrImg
          }).then(function() {
            firebase.database().ref('users/' + uid + "/" + "photoURL").set(vm.usrImg);
          });

            // syncArray.$add({image: imageData}).then(function() {
            //     alert("Image has been uploaded");
            // });
        }, function(error) {
        });
		  }
        vm.showPopup = function() {
          vm.data = {}
          vm.setDefault = function () {
            $scope.$onClose({ test: 'hello' });
          };

          myPopUp=$ionicPopup.show({
            template: '',
            scope: $scope,
            templateUrl:'templates/photoOption.html',
            onTap: function(e) { return; }
          });
          myPopUp.then(function(res) {
          }, function(err) {
          }, function(msg) {
          });


        };
	});
