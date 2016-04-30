var express = require('express');
var SpotifyWebApi = require('spotify-web-api-node');
var app = express();



var spotifyApi = new SpotifyWebApi({
  clientId : 'fcecfc72172e4cd267473117a17cbd4d',
  clientSecret : 'a6338157c9bb5ac9c71924cb2940e1a7',
  redirectUri : 'http://www.example.com/callback'
});

app.get('/', function (req, res) {
      res.send('Hello World!');
});


app.listen(3000, function () {
      console.log('Example app listening on port 3000!');
});
