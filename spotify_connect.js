var SpotifyWebApi = require('spotify-web-api-node');
var async = require('async');
var spotify_connect = module.exports = {};

var spotifyApi = new SpotifyWebApi({
  clientId : '2fba170ea0a347e5b4a745949bb47e8f',
  clientSecret : 'c31edf15faaa4df789de7586d955855d'
});

spotify_connect.multi_token_lookup = function(token1, token2, final_callback) {
    async.map([token1, token2], spotify_connect.single_token_lookup, function(err, results) {
        if (err) throw err; 

        match_placeholder(results[0].tracks, results[0].artists, results[1].tracks, results[1].artists, function(err, res) {
            if (err) final_callback(err);

            final_callback(null, res);
        });

    });
};

match_placeholder = function(p1_track, p1_artist, p2_track, p2_artist, callback) {
    console.log("doing the matching algo!");
    callback(null, "50%");
};

// results come back as {tracks: [objects], artists: [objects]}
spotify_connect.single_token_lookup = function(code, final_callback) {
    spotifyApi.setAccessToken(code);
    async.parallel({
        tracks: function(callback) {
            spotifyApi.getMyTopTracks({"limit":50}).then(function(data) {
                //data.body.items.map(function(x) { console.log(x.name); });
                spotifyApi.getAudioFeaturesForTracks(
                        data.body.items.map(function(x) { return x.id; }))
                    .then(function(features) {
                        for (var i = 0; i < data.body.items.length; i++) {
                            data.body.items[i].features = features.body.audio_features[i];
                        }

                        callback(null, data.body.items);
                    }, function(err) {
                        console.log("something went wrong with feature lookup", err);
                    });
            }, function(err) {
                console.log('Something went wrong with getting tracks!', err);
            });
        },
        artists: function(callback) { 
            spotifyApi.getMyTopArtists({"limit":50}).then(function(data) {
                //data.body.items.map(function(x) { console.log(x.name); });
                callback(null, data.body.items);
            }, function(err) {
                console.log('Something went wrong with getting artists!', err);
            });
        }
    },
    function(err, results) {
        if (err) final_callback(err);

        final_callback(null, results);
    });
};


// code to test
var code1 = 'BQCAW436CpMMtRaADv5Z2riwen7cXe_tL6_j121d7mTulawbyU2RYKQZ13nRouGMzCW4zavK1mPJ933vsgZi626cQGr5lbPhg0vLuNJjqTMh1Vn3Bmgv8IpU6rUAGd37-jLl1HKTwbm-zob3pZvFwrGmYtjlNC3HhEttwR0RXac4h2S9Jiwpn5LnjYtpJo3C8Q';

// spotify_connect.single_token_lookup(code1, function(err, res) {
//     console.log(res.tracks);
// });
