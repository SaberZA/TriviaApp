/**
 * Created by Steven on 2014-05-17.
 */
var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    format = require('util').format,
    request = require('request'),
    wait = require('wait.for'),
    async = require('async'),
    moment = require('moment'),
    cheerio = require('cheerio');
var app = express();

var ENABLE_PROFILES = true;
var matches = {};
matches.upcomingMatches = new Array();

loadAllDotaMatches();
loadPlayers();

setInterval(function() {
    loadAllDotaMatches();
    loadPlayers();
},(1000 * 60) * 10);


app.set('views', __dirname + '/server/views');
app.set('view engine','jade');

app.use('/media',express.static(__dirname + '/public/media'));
app.use(express.static(__dirname + '/public'));

app.post('/submissions', function(req,res){
    var body = '';

    req.on('data', function(chunk) {
        body += chunk.toString();
    });
    req.on('end', function() {
        MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
            if(err) throw err;

            var collection = db.collection('triviaWowPlaces');
            collection.find().toArray(function(err, docs) {
                res.send(docs);
                db.close();
            });
        });


    });
});



app.post('/upcomingMatches',function(req,res){

    console.log(new Date() + 'Client requested Dota Matches - '+matches.upcomingMatches.length);
    var dbPlayers = [];

    if(ENABLE_PROFILES) {
        MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
            if (err) throw err;
            var collection = db.collection('players');
            var players = ["steve","jarrod","wayne","daryl","james","johan","k"];

            players.forEach(function(player) {
                collection.findOne({name: player}, function (err, doc) {
                    dbPlayers.push(doc);
                });
            });
        });
    }

    matches.upcomingMatches = matches.upcomingMatches.sort(function(a,b) {
        if(a.FixedSeconds > b.FixedSeconds) return 1;
        if(a.FixedSeconds < b.FixedSeconds) return -1;
        return 0;
    });

    res.send(matches);
});

function loadSingleDotaMatchPage(uri) {
    request(uri, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body, {
                normalizeWhitespace: true
            });
            var matchDomTeam1 = $('#col1 > div:nth-child(2) > div > table > tbody > tr > td > a > span.opp.opp1 > span:nth-child(1)');
            var matchDomTeam2 = $('#col1 > div:nth-child(2) > div > table > tbody > tr > td > a > span.opp.opp2 > span:nth-child(2)');
            var matchDomTime = $('#col1 > div:nth-child(2) > div > table > tbody > tr > td.type-specific > span');
            var matchDomLink = $('#col1 > div:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > a');

            var listTeam1 = new Array();
            var listTeam2 = new Array();
            var listTime = new Array();
            var listLink = new Array();

            matches.upcomingMatches = new Array();
            for (var index = 0; index < matchDomTeam1.length; index++) {
                var listTeam1Players = new Array();
                var listTeam2Players = new Array();

                listTeam1.push(matchDomTeam1[index].children[0].data.trim());
                var team1 = listTeam1[index];
                listTeam2.push(matchDomTeam2[index].children[0].data.trim());
                var team2 = listTeam2[index];
                listTime.push(matchDomTime[index].children[0].data.trim());
                listLink.push('http://www.gosugamers.net' + matchDomLink[index].attribs.href);

                var game = {
                    Team1: team1,
                    Team2: team2,
                    Time: listTime[index],
                    Link: listLink[index],
                    Team1Players: listTeam1Players,
                    Team2Players: listTeam2Players
                };
                matches.upcomingMatches.push(game);
            }
        }
    });
}
function getAllDotaMatches(callback) {
    matches = {};
    for (var i = 1; i < 4; i++) {
        var uri = 'http://www.gosugamers.net/dota2/gosubet?u-page=' + i;
        wait.for(loadSingleDotaMatchPage, uri);
//        if(i==3){
//            callback();
//        }
    }
    callback();
}


app.post('/submit', function(req, res) {
    var body = '';

    req.on('data', function(chunk) {
        body += chunk.toString();
    });
    req.on('end', function() {
        var trivia = JSON.parse(body);
        var triviaAnswers = {
            UserName: trivia.user,
            Answer1: trivia.places[0].answer,
            Answer2: trivia.places[1].answer,
            Answer3: trivia.places[2].answer,
            Answer4: trivia.places[3].answer,
            Answer5: trivia.places[4].answer,
            Answer6: trivia.places[5].answer,
            Answer7: trivia.places[6].answer,
            Answer8: trivia.places[7].answer,
            Answer9: trivia.places[8].answer
        };

        console.log(new Date() + ' - ' + trivia.user);

        MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
            if(err) throw err;

            var collection = db.collection('triviaWowPlaces');
            collection.insert(triviaAnswers, function(err, docs) {
                collection.count(function(err, count) {
                    console.log(format("count = %s", count));
                    db.close();
                });
            });
        });

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : '*'});
        res.end(JSON.stringify({ a: 1 }));
    });

});

app.get('/partials/:partialPath',function(req,res){
    res.render('partials/' + req.params.partialPath);
});

app.get('*',function(req,res){
    res.render('index');
});

var port = 1337;
app.listen(port);
console.log("server listening on "+ port + "...");



function getSeconds(liveIn) {
    //20h 15m
    //24s
    //15m 24s
    //1d 19h
    //2d 24s
    //1w 2d

    var fixedDate = moment();
    var seconds = 0;
    var minutes = 0;
    var hours = 0;
    var days = 0;
    var weeks = 0;

    var timeElements = liveIn.trim().split(' ');
    timeElements.forEach(function(element){
        if(endsWith(element,'s')) {
            seconds = parseInt(element.split('s')[0]);
        }

        if(endsWith(element,'m')) {
            minutes = parseInt(element.split('m')[0]);
        }

        if(endsWith(element,'h')) {
            hours = parseInt(element.split('h')[0]);
        }

        if(endsWith(element,'d')) {
            days = parseInt(element.split('d')[0]);
        }

        if(endsWith(element,'w')) {
            weeks = parseInt(element.split('w')[0]);
        }
    });
//    console.log(seconds + ' - ' + minutes + ' - ' +hours + ' - ' +days + ' - ' +weeks);
    fixedDate.add('s', seconds);
    fixedDate.add('m', minutes);
    fixedDate.add('h', hours);
    fixedDate.add('d', days);
    fixedDate.add('w', weeks);
    //console.log(fixedDate.format('LLL'));

    var minuteSeconds = 60;
    var hourSeconds = minuteSeconds * 60;
    var daySeconds = hourSeconds * 24;
    var weekSeconds = daySeconds * 7;

    var fixedSeconds = seconds + (minutes * minuteSeconds) + (hours * hourSeconds) + (days * daySeconds) + (weeks * weekSeconds);
//    console.log(fixedSeconds);
    return  fixedSeconds;
//    return fixedDate.format('LLL');
}
function loadSingleMatchPage(i) {
    var uri = 'http://www.gosugamers.net/dota2/gosubet?u-page=' + i;

    request(uri, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body, {
                normalizeWhitespace: true
            });
            var matchDomTeam1 = $('#col1 > div:nth-child(2) > div > table > tbody > tr > td > a > span.opp.opp1 > span:nth-child(1)');
            var matchDomTeam2 = $('#col1 > div:nth-child(2) > div > table > tbody > tr > td > a > span.opp.opp2 > span:nth-child(2)');
            var matchDomTime = $('#col1 > div:nth-child(2) > div > table > tbody > tr > td.type-specific > span');
            var matchDomLink = $('#col1 > div:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > a');

            var listTeam1 = new Array();
            var listTeam2 = new Array();
            var listTime = new Array();
            var listLink = new Array();

            for (var index = 0; index < matchDomTeam1.length; index++) {
                var listTeam1Players = new Array();
                var listTeam2Players = new Array();

                listTeam1.push(matchDomTeam1[index].children[0].data.trim());
                var team1 = listTeam1[index];
                listTeam2.push(matchDomTeam2[index].children[0].data.trim());
                var team2 = listTeam2[index];
                listTime.push(matchDomTime[index].children[0].data.trim());
                listLink.push('http://www.gosugamers.net' + matchDomLink[index].attribs.href);

                var fixedSeconds = getSeconds(matchDomTime[index].children[0].data);

                var game = {
                    Team1: team1,
                    Team2: team2,
                    Time: listTime[index],
                    Link: listLink[index],
                    Team1Players: listTeam1Players,
                    Team2Players: listTeam2Players,
                    FixedSeconds: fixedSeconds
                };
                matches.upcomingMatches.push(game);
            }
        }
    });
}
function loadAllDotaMatches() {
    var pages = [1,2,3,4];
    matches.upcomingMatches = new Array();
    async.eachSeries(pages, function(pageNumber, callback) {
        console.log('Processing page: '+pageNumber);
        loadSingleMatchPage(pageNumber);
        callback();

    }, function(err){

        if( err ) {
            console.log('failed to process page');
        } else {
            console.log('All pages have been processed successfully');
        }
    });




//    for (var i = 0; i < 4; i++) {
//        var uri = loadSingleMatchPage(i);
//    }
}

var cachedPlayers = new Array();


function loadPlayers(){
    setTimeout(function() {
        console.log('Foo');
        MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
            if(err) throw err;

            var collection = db.collection('players');
            var players = ["steve","jarrod","james","johan","wayne","daryl","specialK"];
            console.log(matches.upcomingMatches.length);
            players.forEach(function(player) {
                collection.findOne({name: player}, function(err, doc) {
                    matches.upcomingMatches.forEach(function(match){
                        if(contains(doc.teams,match.Team1)){
                            match.Team1Players.push(player);
                        };
                        if(contains(doc.teams,match.Team2)){
                            match.Team2Players.push(player);
                        };
                    });
                });
            });
        });
    }, 4000);

//    callback(matches);
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] == obj) {
            return true;
        }
    }
    return false;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}