/**
 * Created by Steven on 2014-05-18.
 */
'use strict';

app.controller('submissionsController'
    ,function submissionsController($scope){
    $scope.submissions = {
        results: [],
        headers: []
    };

    $scope.getAllSubmissions = function() {
        $.ajax({
            url: '/submissions',
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
            data: JSON.stringify($scope.submissions),
            type: 'POST',
            jsonpCallback: 'callback', // this is not relevant to the POST anymore
            success: function (data) {
                for (var index = 0; index < data.length; ++index) {
                    var result = data[index];
                    delete result['_id'];
                }
                $scope.submissions.results = data;

                for (var index = 0; index < data.length; ++index) {

                };
                $scope.submissions.headers = Object.keys(data[2]);
                debugger;
                $scope.$apply();
            },
            error: function (xhr, status, error) {
                alert('Error: ' + error.message);
            }
        });
    };

    $scope.getAllSubmissions();
    });