'use strict';
var triviaApp = angular.module('triviaApp', []);

triviaApp.factory("validateUrl",function($sce){
    return {
        getValidUrl:function(url){
            return $sce.trustAsResourceUrl(url)
        }
    };
});