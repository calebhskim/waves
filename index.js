var express = require('express');
var parser = require('body-parser');
var request = require('request');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var spcon = require('./spotify_connect');

var client_id = '2fba170ea0a347e5b4a745949bb47e8f';
var client_secret = 'c31edf15faaa4df789de7586d955855d';
var redirect_uri = 'http://0.0.0.0:3000/callback';

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

/**
    Generates a random string containing numbers and letters
    @param {number} length: The length of the string
    @return {string} The generated string
*/
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

var datamap = {};

app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views/');
app.use(express.static(__dirname + '/public'))
   .use(parser.json())
   .use(parser.urlencoded({
      extended: true
   }))
   .use(cookieParser());

app.get('/', function (req, res) {
    res.render('index.pug');
});

app.get('/login', function (req, res) {
   // Update datamap with my information
   console.log("Request params: ");
   console.log(isEmptyObject(req.query));
   var state = generateRandomString(16);
   res.cookie(stateKey, state);
   
   if (isEmptyObject(req.query)) {
      datamap[state] = {
         "client1": {},
         "client2": {}
      };
   }
   else {
      datamap[state] = req.query.clientid;
   }

   var scope = 'user-read-private user-top-read';
   res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
   }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  // if (state === null || state !== storedState) {
  //   res.redirect('/#' +
  //     querystring.stringify({
  //       error: 'state_mismatch'
  //     }));
  // } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
         console.log(datamap);
         var access_token = body.access_token, refresh_token = body.refresh_token;
         var share = "http://0.0.0.0:3000/login";
         console.log("datamap conditional");
         console.log(state);
         console.log(datamap[state]['client1']);
         if (datamap[state]['client1'] === undefined) {
            datamap[datamap[state]]['client2']['token'] = access_token;
         }
         else {
            datamap[state]['client1']['token'] = access_token;
            share = share + "?clientid=" + state;
         }
         console.log(datamap);
         var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
         };

         // use the access token to access the Spotify Web API
         request.get(options, function(error, response, body) {
            console.log(body);
         });

         // we can also pass the token to the browser to make requests from there
         res.redirect('/#' +
            querystring.stringify({
               access_token: access_token,
               refresh_token: refresh_token,
               share_url: share,
               state: state
            }));
         } else {
         res.redirect('/#' +
            querystring.stringify({
            error: 'invalid_token'
         }));
      }
    });
  //}
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/token', function (req, res) {
   console.log("Get token:");
   console.log(req.query.number);
   if (req.query.number === 1) {
      res.send(datamap[req.query.clientid]);
   }
   else {
      res.send(datamap[datamap[req.query.clientid]]);
   }
});

app.get('/percent', function (req, res) {
   console.log("Tokens to query");
   console.log(req.query);
   spcon.multi_token_lookup(req.query.token1.token, req.query.token2.token, function (n, r) {
      console.log("percentage");
      console.log(r);
      res.send({"percent": r});
   });
});

var server = app.listen(3000, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Waves app listening at http://%s:%s", host, port)
});
