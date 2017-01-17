// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('RUN', ['ionic', 'ngStorage', 'ngCordova', 'ngCordovaOauth'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        cache: false,
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'lc'

      })
      .state('signup', {
        url: '/signup',
        cache: false,
        templateUrl: 'templates/signup.html',
        controller: 'LoginCtrl',
        controllerAs: 'lc'

      })
      .state('userinfo', {
        url: '/userinfo',
        cache: false,
        templateUrl: 'templates/userInfo.html',
        controller: 'LoginCtrl',
        controllerAs: 'lc'

      })
      .state('app', {
        url: '/app',
        cache: false,
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl',
        controllerAs: 'ac'
      })

      .state('app.home', {
        url: '/home',
        cache: false,
        params: {
          openAccordin: null
        },
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl',
            controllerAs: 'hc'
          }
        }
      })
      .state('app.runninglog', {
        url: '/runninglog',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/runningLog.html',
            controller: 'runLogCtrl',
            controllerAs: 'rlc'
          }
        }
      })
      .state('app.logDetails', {
        url: '/logDetails',
        cache: false,
        params: {
          runlog: null
        },
        views: {
          'menuContent': {
            templateUrl: 'templates/logDetails.html',
            controller: 'logDetailsCtrl',
            controllerAs: 'ldc'
          }
        }
      })
      .state('app.runrequest', {
      url: '/runrequest',
      cache: false,
      params: {
        scheduleType: null
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/runRequest.html',
          controller: 'runRequestCtrl',
          controllerAs: 'rr'
        }
      }
    })
      .state('app.profile', {
        url: '/profile',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl',
            controllerAs: 'pc'
          }
        }
      })
      .state('app.startrun', {
        url: '/startrun',
        cache: false,
        params: {
          scheduleRunRecord: null
        },
        views: {
          'menuContent': {
            templateUrl: 'templates/startRun.html',
            controller: 'StartRunCtrl',
            controllerAs: 'rc'
          }
        }
      })
      .state('app.schedulerun', {
        url: '/schedulerun',
        cache: false,
        params: {
          scheduleType: null
        },
        views: {
          'menuContent': {
            templateUrl: 'templates/schedulerun.html',
            controller: 'ScheduleRunCtrl',
            controllerAs: 'sc'
          }
        }
      })

      .state('app.leaderboard', {
        url: '/leaderboard',
        params:{
          runId: null
        },
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/leaderboard.html',
            controller: 'LeaderboardCtrl',
            controllerAs: 'lbc'
          }
        }
      })

      .state('app.runnerInfo', {
        url: '/runnerInfo',
        params:{
          'key' : null
        },
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/runnerInfo.html',
            controller: 'RunnerInfoCtrl',
            controllerAs: 'ric'
          }
        }
      })
      .state('app.notifications', {
        url: '/notifications',
        params:{
          'isFirstLoad':null
        },
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/notifications.html',
            controller: 'NotificationsCtrl',
            controllerAs: 'nc'
          }
        }
      })
      .state('app.runningbuddy', {
        url: '/runningbuddy',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/runningbuddy.html',
            controller: 'RunningBuddyCtrl',
            controllerAs: 'rbc'
          }
        }
      })

      .state('app.virtualrun', {
        url: '/virtualrun',
        cache: false,
        params: {
          scheduleType: null
        },
        views: {
          'menuContent': {
            templateUrl: 'templates/virtualrun.html',
            controller: 'ScheduleRunCtrl',
            controllerAs: 'sc'
          }
        }
      })
      ;
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });
