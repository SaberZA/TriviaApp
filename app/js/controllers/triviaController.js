'use strict';

/* Controllers */
var publicAddress = 'http://saberza.blogdns.com:1337';
triviaApp.controller('triviaController',
    function appController($scope, validateUrl){
        var sound = new Howl({
            urls: ['']
        });

        $scope.trivia = {
            heading: 'Welcome to WoW Trivia!',
            places: [
                {id: '1', file: '1.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/1.mp3")},
                {id: '2', file: '2.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/2.mp3")},
                {id: '3', file: '3.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/3.mp3")},
                {id: '4', file: '4.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/4.mp3")},
                {id: '5', file: '5.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/5.mp3")},
                {id: '6', file: '6.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/6.mp3")},
                {id: '7', file: '7.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/7.mp3")},
                {id: '8', file: '8.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/8.mp3")},
                {id: '9', file: '9.mp3', answer: '', serverFile: validateUrl.getValidUrl("http://saberza.blogdns.com:1337/audio/9.mp3")}
            ],
            user: ''
        };

        $scope.trustAudioLink = function(place) {
            return  'http://saberza.blogdns.com:1337/audio/1.mp3';
        };

        $scope.submit = function() {
            $.ajax({
                url: publicAddress,
                dataType: "json",
                contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
                data: JSON.stringify($scope.trivia),
                type: 'POST',
                jsonpCallback: 'callback', // this is not relevant to the POST anymore
                success: function (data) {
                    alert('Success!');
                },
                error: function (xhr, status, error) {
                    alert('Error: ' + error.message);
                }
            });
        };

        $scope.play = function(place) {
            sound.stop();
            var filePath = ('../../media/wowPlaces/'+place.file);
//            var filePath = ('/app/media/wowPlaces/' + place.file);
            sound = new Howl({
                urls: [ filePath]
            }).play();
        };

        $scope.stop = function(place) {
            sound.stop();
        }
    }
);