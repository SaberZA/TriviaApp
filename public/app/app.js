/**
 * Created by Steven on 2014-05-18.
 */
var app = angular.module('app', ['ngResource', 'ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/',{ templateUrl: '/partials/main',controller: 'appController'});
});


var publicAddress = 'http://saberza.blogdns.com:1337';
app.controller('appController',function($scope,$sce){
    $scope.trivia = {
        heading: 'Welcome to WoW Trivia!',
        places: [
            {id: '1', file: '1.mp3', answer: '', serverFile: "/media/wowPlaces/1.mp3"},
            {id: '2', file: '2.mp3', answer: '', serverFile: "/media/wowPlaces/2.mp3"},
            {id: '3', file: '3.mp3', answer: '', serverFile: "/media/wowPlaces/3.mp3"},
            {id: '4', file: '4.mp3', answer: '', serverFile: "/media/wowPlaces/4.mp3"},
            {id: '5', file: '5.mp3', answer: '', serverFile: "/media/wowPlaces/5.mp3"},
            {id: '6', file: '6.mp3', answer: '', serverFile: "/media/wowPlaces/6.mp3"},
            {id: '7', file: '7.mp3', answer: '', serverFile: "/media/wowPlaces/7.mp3"},
            {id: '8', file: '8.mp3', answer: '', serverFile: "/media/wowPlaces/8.mp3"},
            {id: '9', file: '9.mp3', answer: '', serverFile: "/media/wowPlaces/9.mp3"}
        ],
        user: ''
    };

    $scope.submit = function () {
        var options = {top:0, left:'40%'};
        var spinner = new Spinner(options).spin();
        var target = document.getElementById('submitLoader');
        target.appendChild(spinner.el);
        $.ajax({
            url: '/submit',
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
            data: JSON.stringify($scope.trivia),
            type: 'POST',
            jsonpCallback: 'callback', // this is not relevant to the POST anymore
            success: function (data) {
                spinner.stop();
                alert('Success!');
            },
            error: function (xhr, status, error) {
                spinner.stop();
                alert('Error: ' + error.message);
            }
        });
    };
});

