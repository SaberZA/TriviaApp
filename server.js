/**
 * Created by Steven on 2014-05-17.
 */

var express = require('express'),
    stylus = require('stylus');

var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str,path) {
    return stylus(str).set('filename',path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine','jade');
app.use(stylus.middleware(
    {
       src: __dirname + '/public',
        compile: compile
    }
));
app.use(express.static(__dirname + '/public'));

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
        }

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

var port = 8000;
app.listen(port);
console.log("server listening on "+ port + "...");