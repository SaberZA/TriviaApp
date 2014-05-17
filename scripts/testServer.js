/**
 * Created by Steven on 2014-05-16.
 */
var express = require('express');

var app = express();


var DEFAULT_PORT = 8000;
app.set('view engine', 'ejs');

app.get('/app', function(req, res) {
    res.render('../app/index.html')
});


app.listen(DEFAULT_PORT);