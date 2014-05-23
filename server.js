/**
 * Created by Steven on 2014-05-17.
 */
var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    format = require('util').format,
    request = require('request'),
    xpath = require('xpath'),
    cheerio = require('cheerio'),
    dom = require('xmldom').DOMParser;
var app = express();



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
    var matchesJson = {};
    console.log(new Date() + 'Client requested Dota Matches');
    var dbPlayers = [];

    MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
        if (err) throw err;
        var collection = db.collection('players');
        var players = ["steve","jarrod","wayne","daryl","james","johan","specialK"];

        players.forEach(function(player) {
            collection.findOne({name: player}, function (err, doc) {
                dbPlayers.push(doc);
            });
        });
    });

    request('http://www.gosugamers.net/dota2', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body, {
                normalizeWhitespace: true
            });

            var matchDomTeam1 = $('#gb-matches > tbody > tr > td > a > span.opp.opp1 > span:nth-child(2)');
            var matchDomTeam2 = $('#gb-matches > tbody > tr > td > a > span.opp.opp2 > span:nth-child(2)');
            var matchDomTime = $('#gb-matches > tbody > tr > td.status > span');
            var matchDomLink = $('#gb-matches > tbody > tr > td > a');

            var listTeam1 = new Array();
            var listTeam2 = new Array();
            var listTime = new Array();
            var listLink = new Array();


            var matches = {};
            matches.upcomingMatches = new Array();
            for (var index = 0; index < matchDomTeam1.length; index++) {
                var listTeam1Players = new Array();
                var listTeam2Players = new Array();

                listTeam1.push(matchDomTeam1[index].children[0].data);
                var team1 = listTeam1[index];
                dbPlayers.forEach(function(player){
                    if(contains(player.teams,team1)){
                        listTeam1Players.push(player.name);
                    }
                });
                listTeam2.push(matchDomTeam2[index].children[0].data);
                var team2 = listTeam2[index];
                dbPlayers.forEach(function(player){
                    if(contains(player.teams,team2)){
                        listTeam2Players.push(player.name);
                    }
                });
                listTime.push(matchDomTime[index].children[0].data);
                listLink.push('http://www.gosugamers.net' + matchDomLink[index].attribs.href);

                var game = {
                    Team1: team1,
                    Team2: team2,
                    Time: listTime[index],
                    Link: listLink[index],
                    Team1Players: listTeam1Players,
                    Team2Players: listTeam2Players
                };
                console.log(game);
                matches.upcomingMatches.push(game);
            }
            res.send(matches);
        }
    });
});



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

function loadPlayers(matches,callback){

    MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
        if(err) throw err;

        var collection = db.collection('players');
        var players = ["steve"];
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
    callback(matches);
};

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] == obj) {
            return true;
        }
    }
    return false;
};