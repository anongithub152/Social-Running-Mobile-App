//login.js

angular.module('RUN')
  .service('LoginService', function (Utils, $state, $timeout, $localStorage, dbUtility) {
    //Set the following data depending on your social login app.
    var data = {
      facebookAppId: "1121788661233266",
      googleWebClientId: "86899339460-kqrko1uuhu9a532l9f0jdhf9tgnp8b00.apps.googleusercontent.com",
      twitterKey: "054c7TzPjzhgMura9CLJw7A4V",
      twitterSecret: "bWDGHxHGJa641RtptWniM7IpmDGEEVh8jbYhJzo7VNKUTdqk9Q",
      isGuest: false
    };
    //Set the following to your route names for loginPage and homePage.
    //This will call $state.go() function with the route name you provided.
    var routes = {
      loginRoute: 'login', //Page to route to for your login.
      homeRoute: 'app.home' //Page to route to after successful login/authentication.
    };
    var defaultImg = "";
    var self = this;
    //Customize errorMessages.
    var errorMessage = {
      icon: "ion-alert-circled", //Visit http://ionicons.com for the complete list.
      accountExists: "Sorry, but an account with the same credential already exists. Please check your account and try again.",
      emailExists: "Sorry, but an account with that email already exists. Please check your email and try again.",
      weakPassword: "Sorry, but you provided a weak password. Please enter a stronger password and try again.",
      invalidEmail: "Sorry, but we are not able to find a user with that email. Please check your email and try again.",
      invalidCredential: "Sorry, but we are not able to log you in with that credential. Please check your account and try again.",
      notAllowed: "Sorry, but this operation is not allowed. Please contact support and try again.",
      userDisabled: "Sorry, but your account has been suspended. Please contact support and try again.",
      notFound: "Sorry, but we are not able to find a user with the following credential. Please check your account and try again.",
      wrongPassword: "Sorry, but the password you entered is incorrect. Please check your password and try again.",
      errorLogin: "Sorry, but we encountered an error logging you in. Please try again later.",
      errorLogout: "Sorry, but we encountered an error logging you out. Please try again later.",
      alreadyLinked: "Sorry, but this account was already linked. Please contact support and try again.",
      credentialUsed: "Sorry, but another user is already using this credential. Please login with a different credential.",
      noCredential: "Please enter credentials.",
      fillFields: "Please enter all the details",
      noemail: "Please enter a valid E-mail ID.",
      emailNotFound: "Email ID of Runner not found. Sorry can't send a request."
    };
    //Customize successMessages.
    var successMessage = {
      icon: "ion-android-done", //Visit http://ionicons.com for the complete list.
      accountCreated: "Congratulations! Your account has been created. Logging in.",
      passwordReset: "Yay! A password reset link has been sent to: "
    };
    var showError = function (error) {
      switch (error) {
        case 'auth/account-exists-with-different-credential':
          Utils.message(errorMessage.icon, errorMessage.accountExists);
          break;
        case 'auth/invalid-email':
          Utils.message(errorMessage.icon, errorMessage.invalidEmail);
          break;
        case 'auth/invalid-credential':
          Utils.message(errorMessage.icon, errorMessage.invalidCredential);
          break;
        case 'auth/operation-not-allowed':
          Utils.message(errorMessage.icon, errorMessage.notAllowed);
          break;
        case 'auth/user-disabled':
          Utils.message(errorMessage.icon, errorMessage.userDisabled);
          break;
        case 'auth/user-not-found':
          Utils.message(errorMessage.icon, errorMessage.notFound);
          break;
        case 'auth/wrong-password':
          Utils.message(errorMessage.icon, errorMessage.wrongPassword);
          break;
        case 'auth/error-logout':
          Utils.message(errorMessage.icon, errorMessage.errorLogout);
          break;
        case 'auth/provider-already-linked':
          Utils.message(errorMessage.icon, errorMessage.alreadyLinked);
          break;
        case 'auth/credential-already-in-use':
          Utils.message(errorMessage.icon, errorMessage.credentialUsed);
          break;
        case 'auth/email-already-in-use':
          Utils.message(errorMessage.icon, errorMessage.emailExists);
          break;
        case 'auth/weak-password':
          Utils.message(errorMessage.icon, errorMessage.weakPassword);
          break;
        case 'auth/no-credential':
          Utils.message(errorMessage.icon, errorMessage.noCredential);
          break;
        case 'auth/all-fields':
          Utils.message(errorMessage.icon, errorMessage.fillFields);
          break;
        case 'auth/no-email':
          Utils.message(errorMessage.icon, errorMessage.noemail);
          break;
        case 'auth/email-not-found':
          Utils.message(errorMessage.icon, errorMessage.emailNotFound);
          break;
        default:
          Utils.message(errorMessage.icon, errorMessage.errorLogin);
          break;
      }
    };
    function sendPasswordResetLink() {

    }
    function GoToHomePage(user) {
      if (user) {
        firebase.database().ref('/users/' + user.uid).on('value', function (data) {
          var userProfile = data.val();
          if (!(userProfile && userProfile.gender && userProfile.age && userProfile.height && userProfile.weight && userProfile.dob && userProfile.speed)) {
            $state.go('userinfo');
          } else {
            // User is signed in.
            var userDetails = {
              name: user.displayName,
              email: user.email,
              photoUrl: user.photoURL,
              gender: userProfile.gender,
              age: userProfile.age,
              height: userProfile.height,
              weight: userProfile.weight,
              dob: userProfile.dob,
              speedMile: userProfile.speed
            }
            $localStorage.userDetails = userDetails;
            $state.go(routes.homeRoute);
          }
        });
      } else {
        $state.go(routes.loginRoute);
      }
    }
    function loginSuccessful() {
      firebase.auth().onAuthStateChanged(function (user) {
        GoToHomePage(user);
      });
    }
    this.showPopUpErr = showError;
    this.relogin = function () {
      if ($localStorage.loginCredential) {
        Utils.show();
        var credential;
        switch ($localStorage.loginCredential.provider) {
          case 'password':
            console.log("Relogging in with Firebase");
            credential = firebase.auth.EmailAuthProvider.credential($localStorage.loginCredential.Db, $localStorage.loginCredential.Dc);
            break;
          case 'facebook.com':
            console.log("Relogging in with Facebook");
            credential = firebase.auth.FacebookAuthProvider.credential($localStorage.loginCredential.accessToken);
            break;
          case 'google.com':
            console.log("Relogging in with Google");
            credential = firebase.auth.GoogleAuthProvider.credential($localStorage.loginCredential.idToken, $localStorage.loginCredential.accessToken);
            break;
          case 'twitter.com':
            console.log("Relogging in with Twitter");
            credential = firebase.auth.TwitterAuthProvider.credential($localStorage.loginCredential.accessToken, $localStorage.loginCredential.secret);
            break;
          default:
            break;
        }
        firebase.auth().signInWithCredential(credential)
          .then(function (response) {
            Utils.hide();
            loginSuccessful();
          })
          .catch(function (error) {
            var error = error.code;
            showError(error);
          });
      }
    };
    this.isGuest = function () {
      return data.isGuest;
    };
    this.getFacebookAppId = function () {
      return data.facebookAppId;
    };
    this.getGoogleWebClientId = function () {
      return data.googleWebClientId;
    };
    this.getTwitterKey = function () {
      return data.twitterKey;
    };
    this.getTwitterSecret = function () {
      return data.twitterSecret;
    };
    this.createFirebaseUser = function (user) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(function (userObj) {
          dbUtility.writeData('users/', userObj.uid, {
            "speed": "0 Miles/Hr",
            "gender": user.gender,
            "dob": user.dob.getTime(),
            "age": user.age,
            "height": user.height,
            "weight": user.weight,
            "photoURL": defaultImg,
            "name": user.displayName,
            "emailId": user.email,
            "uid": userObj.uid
          });
          //after user is created add hid display name
          userObj.updateProfile({
            displayName: user.displayName
          }).then(function () {
            // Update successful.
            // var credential = firebase.auth.EmailAuthProvider.credential(user.email, user.password);
            // $localStorage.loginCredential = credential;
            $timeout(function () {
              data.isGuest = false;
            });
            Utils.message(successMessage.icon, successMessage.accountCreated)
              .then(function () {
                self.sendPasswordResetEmail(user.email);
              })
              .catch(function () {
                self.sendPasswordResetEmail(user.email);
              });
          }, function (error) {
            // An error happened.
            var error = error.code;
            showError(error);
          });
        })
        .catch(function (error) {
          var error = error.code;
          showError(error);
        });
    };
    this.saveUserInfo = function (user) {
      var usrid = firebase.auth().currentUser.uid
      var userObj = $localStorage.userDetails;
      dataToSend = {
        "speed": "0 Miles/Hr",
        "gender": user.gender,
        "dob": user.dob.getTime(),
        "age": user.age,
        "height": user.height,
        "weight": user.weight,
        "photoURL": defaultImg,
        "name": user.displayName
      };
      firebase.database().ref('users/' + usrid).update(dataToSend, function () {
        userObj.updateProfile({
          displayName: user.displayName
        }).then(function () {
          GoToHomePage(user);
        }, function () {
          $state.go(routes.loginRoute);
        })
      });
      // dbUtility.writeData('users/', usrid, {
      //   "speed": "0 Miles/Hr",
      //   "gender": user.gender,
      //   "dob": user.dob.getTime(),
      //   "age": user.age,
      //   "height": user.height,
      //   "weight": user.weight,
      //   "photoURL": defaultImg,
      //   "name": user.displayName
      // }).then(function () {

      // }, function () {
      //   $state.go(routes.loginRoute);
      // }).catch(function (error) {
      //   var error = error.code;
      //   showError(error);
      // });
    }
    this.loginWithFirebase = function (user) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(function (response) {
          var credential = firebase.auth.EmailAuthProvider.credential(user.email, user.password);
          $localStorage.loginCredential = credential;
          $timeout(function () {
            data.isGuest = false;
          });
          Utils.hide();
          loginSuccessful();
        })
        .catch(function (error) {
          var error = error.code;
          showError(error);
        });
    };
    this.sendPasswordResetEmail = function (email) {
      firebase.auth().sendPasswordResetEmail(email)
        .then(function () {
          Utils.message(successMessage.icon, successMessage.passwordReset + email)
            .then(function () {
              $state.go(routes.loginRoute);
            })
            .catch(function () {
              $state.go(routes.loginRoute);
            });
        })
        .catch(function (error) {
          var error = error.code;
          showError(error);
        });
    };
    this.loginAsGuest = function () {
      firebase.auth().signInAnonymously()
        .then(function (response) {
          $timeout(function () {
            data.isGuest = true;
          });
          Utils.hide();
          loginSuccessful();
        })
        .catch(function (error) {
          var error = error.code;
          showError(error);
        });
    };
    this.logout = function () {
      if (firebase.auth()) {
        firebase.auth().signOut().then(function () {
          delete $localStorage.loginCredential;
          Utils.hide();
          $state.go(routes.loginRoute);
        }, function (error) {
          showError('auth/error-logout');
        });
      } else {
        Utils.hide();
        $state.go(routes.loginRoute);
      }
    };
    this.loginWithCredential = function (credential) {
      try {
        if (firebase.auth().currentUser.isAnonymous) {
          firebase.auth().currentUser.link(credential).then(function () {
            Utils.hide();
            $timeout(function () {
              data.isGuest = false;
            });
            $localStorage.loginCredential = credential;
          }, function (error) {
            var error = error.code;
            showError(error);
          });
        }
      } catch (error) {
        firebase.auth().signInWithCredential(credential)
          .then(function (response) {
            $localStorage.loginCredential = credential;
            Utils.hide();
            $timeout(function () {
              data.isGuest = false;
            });
            loginSuccessful();
          })
          .catch(function (error) {
            var error = error.code;
            showError(error);
          });
      }
    };
  })
  .directive('registerFirebase', function (LoginService, Utils) {
    return {
      restrict: 'A',
      scope: true,
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          if ($scope.user && $scope.user.email && $scope.user.dob && $scope.user.gender && $scope.user.age && $scope.user.height && $scope.user.weight && $scope.user.displayName) {
            console.log("Firebase Register");
            Utils.show();
            $scope.user.password = Math.random().toString(36).slice(-8);
            LoginService.createFirebaseUser($scope.user);
          } else {
            console.log('invalid');
            LoginService.showPopUpErr('auth/no-credential');
          }
        });
      }
    }
  })
  .directive('userInformationFirebase', function (LoginService, Utils) {
    return {
      restrict: 'A',
      scope: true,
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          if ($scope.user && $scope.user.dob && $scope.user.gender && $scope.user.age && $scope.user.height && $scope.user.weight && $scope.user.displayName) {
            console.log("Firebase info user");
            Utils.show();
            LoginService.saveUserInfo($scope.user);
          } else {
            console.log('invalid');
            LoginService.showPopUpErr('auth/all-fields');
          }
        });
      }
    }
  })
  .directive('firebaseLogin', function (LoginService, Utils) {
    return {
      restrict: 'A',
      scope: true,
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          if ($scope.user && $scope.user.email && $scope.user.password) {
            console.log("Firebase Login");
            Utils.show();
            LoginService.loginWithFirebase($scope.user);
          } else {
            console.log('invalid');
            LoginService.showPopUpErr('auth/no-credential');
          }
        });
      }
    }
  })
  .directive('resetPassword', function (LoginService, Utils) {
    return {
      restrict: 'A',
      scope: true,
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          if ($scope.user.email) {
            console.log("Firebase Password Reset");
            Utils.show();
            LoginService.sendPasswordResetEmail($scope.user.email);
          } else {
            console.log('invalid');
            LoginService.showPopUpErr('auth/no-email');
          }
        });
      }
    }
  })
  .directive('guestLogin', function (LoginService, Utils) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          console.log("Guest Login");
          Utils.show();
          LoginService.loginAsGuest();
        });
      }
    }
  })
  .directive('logout', function (LoginService, Utils) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          console.log("Logout");
          Utils.show();
          LoginService.logout();
        });
      }
    }
  })
  .directive('facebookLogin', function (LoginService, Utils, $cordovaOauth) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          console.log("Facebook Login");
          Utils.show();
          $cordovaOauth.facebook(LoginService.getFacebookAppId(), ["public_profile", "email"]).then(function (response) {
            var credential = firebase.auth.FacebookAuthProvider.credential(response.access_token);
            LoginService.loginWithCredential(credential);
          }, function (error) {
            Utils.hide();
          });
        });
      }
    }
  })
  .directive('googleLogin', function (LoginService, Utils, $cordovaOauth) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          console.log("Google Login");
          Utils.show();
          $cordovaOauth.google(LoginService.getGoogleWebClientId(), ["https://www.googleapis.com/auth/userinfo.email"]).then(function (response) {
            var credential = firebase.auth.GoogleAuthProvider.credential(response.id_token,
              response.access_token);
            LoginService.loginWithCredential(credential);
          }, function (error) {
            Utils.hide();
          });
        });
      }
    }
  })
  .directive('twitterLogin', function (LoginService, Utils, $cordovaOauth) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $element.bind('click', function () {
          console.log("Twitter Login");
          Utils.show();
          $cordovaOauth.twitter(LoginService.getTwitterKey(), LoginService.getTwitterSecret()).then(function (response) {
            var credential = firebase.auth.TwitterAuthProvider.credential(response.oauth_token,
              response.oauth_token_secret);
            LoginService.loginWithCredential(credential);
          }, function (error) {
            Utils.hide();
          });
        });
      }
    }
  });
