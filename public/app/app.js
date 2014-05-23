/**
 * Created by Steven on 2014-05-18.
 */
var app = angular.module('app', ['ngResource', 'ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/submissions', {templateUrl: '/partials/wowSubmissions', controller: 'submissionsController'})
        .when('/dotaMatches',{ templateUrl: '/partials/upcomingMatches',controller: 'matchesController'})
        .when('/',{ templateUrl: '/partials/main',controller: 'appController'})

        ;
});

//app.controller('submissionsController'
//    ,function submissionsController($scope){
//    $scope.submissions = {
//        headers: [],
//        results: []
//    };
//
//    $scope.getAllSubmissions = function() {
//        $.ajax({
//            url: '/submissions',
//            dataType: "json",
//            contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
//            data: JSON.stringify($scope.submissions),
//            type: 'POST',
//            jsonpCallback: 'callback', // this is not relevant to the POST anymore
//            success: function (data) {
//                alert('Success!');
//            },
//            error: function (xhr, status, error) {
//                alert('Error: ' + error.message);
//            }
//        });
//    };
//
//    $scope.getAllSubmissions();
//    });