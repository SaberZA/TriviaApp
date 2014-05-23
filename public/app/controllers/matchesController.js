/**
 * Created by Steven on 2014-05-20.
 */


app.controller('matchesController',function($scope) {
    $scope.upcomingMatches = {};


    $scope.getUpcomingDotaMatches = function() {
        $.ajax({
            url: '/upcomingMatches',
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
            data: '{matches: true}',
            type: 'POST',
            jsonpCallback: 'callback', // this is not relevant to the POST anymore
            success: function (data) {
                $scope.upcomingMatches = data['upcomingMatches'];
                $scope.upcomingMatches.forEach(function(match){
                    match.team1Classes = '';
                    match.Team1Players.forEach(function(player){
                        match.team1Classes += player + ' ';
                    });
                    match.team1Classes = match.team1Classes.trim();

                    match.team2Classes = '';
                    match.Team2Players.forEach(function(player){
                        match.team2Classes += player + ' ';
                    });
                    match.team2Classes = match.team2Classes.trim();
                });
                debugger;
                $scope.$apply();
                loadPlayerTags();
            },
            error: function (xhr, status, error) {
                alert('Error: ' + error.message);
            }
        });
    };
    $scope.getUpcomingDotaMatches();
});

function loadPlayerTags(){
    $("div[ng-class~='steve']").append("&nbsp<button class='btn-xs btn-success'>Steve</button>");
    $("div[ng-class~='jarrod']").append("&nbsp<button class='btn-xs btn-warning'>Jarrod</button>");
    $("div[ng-class~='wayne']").append("&nbsp<button class='btn-xs btn-primary'>Wayne</button>");
    $("div[ng-class~='daryl']").append("&nbsp<button class='btn-xs btn-danger'>Daryl</button>");
    $("div[ng-class~='james']").append("&nbsp<button class='btn-xs btn-info'>James</button>");
    $("div[ng-class~='johan']").append("&nbsp<button class='btn-xs btn-johan'>Johan</button>");
    $("div[ng-class~='specialK']").append("&nbsp<button class='btn-xs btn-k'>specialK</button>");
};

