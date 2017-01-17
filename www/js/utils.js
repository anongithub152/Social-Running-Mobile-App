//utils.js
//This class contains helper utilities responsible for features such as popups and loading indicators in your application.
//Popup CSS can be styled in css/style.css by editing .loading and .spinner svg css classes.
//You can define your own popup templates here, but to keep this file minimal, I made this class as simple as possible.

angular.module('RUN').factory('Utils', function($ionicLoading, $timeout) {
  var messageDuration = 3000; //Set duration of messages in milliseconds. 3000 = 3 seconds.
  var loadingStyle = "ripple"; //For the list of available spinner styles, refer to: http://ionicframework.com/docs/api/directive/ionSpinner/.
  var promise; //Promise returned by message to automatically close the popup after messageDuration.
  var Utils = {
    //Shows a loading indicator with desired loadingStyle. Usually called when controller is retrieving and fetching data.
    show: function() {
      $ionicLoading.show({
        template: '<ion-spinner icon=' + loadingStyle + '></ion-spinner>'
      });
    },
    //Hides loading indicator. Usually called when controller is done retrieving and processing the data fetched.
    hide: function() {
      $ionicLoading.hide();
    },
    //Shows a popup with the icon and message. Usually called when an information or error message should be shown to the user.
    //Popup is automatically hidden after messageDuration has elapsed. Popup can be abruptly closed by tapping on the popup.
    //For the list of icons refer to http://ionicons.com.
    message: function(icon, message) {
      $ionicLoading.show({
        template:
        '<div onClick="closeMessage()">' +
        '<h1><i class="icon ' + icon + '"></i></h1>' +
        '<p>' + message + '</p>' +
        '</div>',
        scope: this
      });
      promise = $timeout(function() {
        $ionicLoading.hide();
      }, messageDuration);
      return promise;
    }
  };

  //Function to abruptly close the popup before messageDuration has elapsed.
  closeMessage = function() {
    $timeout.cancel(promise);
    $ionicLoading.hide();
  };

  return Utils;
});
