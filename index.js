var express = require('express');
var app = express();
var parser = require('body-parser');

app.set('view engine', 'pug');

app.set('views', __dirname + '/public/views/');
app.use('/', express.static(__dirname + '/public'));
app.use(parser.json());
app.use(parser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    res.render('index.pug');
});

var server = app.listen(3000, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Waves app listening at http://%s:%s", host, port)
});
