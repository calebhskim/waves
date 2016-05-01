var SpotifyWebApi = require('spotify-web-api-node');
var async = require('async');
var match = module.exports = {};

var spotifyApi = new SpotifyWebApi({
  clientId : 'c2674de31ff64b34a165298139a5ddfb',
  clientSecret : 'c4294447a0f349a0bdeceb70e7489000'
});

match.match_access_tokens = function(token1, token2, final_callback) {
    async.map([token1, token2], single_token_lookup, function(err, results) {
        if (err) throw err; 

        match_placeholder(results[0].tracks, results[0].artists, results[1].tracks, results[1].artists, function(err, res) {
            console.log("match probability is this much");
            console.log(res);
            if (err) final_callback(err);

            final_callback(null, res);
        });

    });
};


match_placeholder = function(p1_track, p1_artist, p2_track, p2_artist, callback) {
    console.log("here we are!");
    callback(null, "50%");
};


// results come back as {tracks: [objects], artists: [objects]}
match.single_token_lookup = function(code, final_callback) {
    spotifyApi.setAccessToken(code);
    async.parallel({
        tracks: function(callback) {
            spotifyApi.getMyTopTracks({"limit":50}).then(function(data) {
                //data.body.items.map(function(x) { console.log(x.name); });
                callback(data.body.items);
            }, function(err) {
                console.log('Something went wrong with getting tracks!', err);
            });
        },
        artists: function(callback) { 
            spotifyApi.getMyTopArtists({"limit":50}).then(function(data) {
                //data.body.items.map(function(x) { console.log(x.name); });
                callback(data.body.items);
            }, function(err) {
                console.log('Something went wrong with getting artists!', err);
            });
        }
    },
    function(err, results) {
        if (err) final_callback(err);

        final_callback(results);
    });
};
