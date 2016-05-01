var SpotifyWebApi = require('spotify-web-api-node');
var async = require('async');
var match = require('./match');
var spotify_connect = module.exports = {};

var spotifyApi = new SpotifyWebApi({
  clientId : 'c2674de31ff64b34a165298139a5ddfb',
  clientSecret : 'c4294447a0f349a0bdeceb70e7489000'
});

spotify_connect.multi_token_lookup = function(token1, token2, final_callback) {
    async.map([token1, token2], spotify_connect.single_token_lookup, function(err, results) {
        if (err) throw err; 

        match.match(results[0].tracks, results[0].artists, results[1].tracks, results[1].artists, function(err, res) {
            if (err) final_callback(err);

            final_callback(null, res);
        });
    });
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


spotify_connect.related_artists = function(p1_artists, p2_artists, callback) {
    async.map([p1_artists, p2_artists], function(item1, map1_callback) {
        async.map(item1, function(item2, map2_callback) {
            spotifyApi.getArtistRelatedArtists(item2.id).then(function(data) {
                console.log("found stuff");
                console.log(data.body.artists);

                for (var i = 0; i < 3 && i < data.body.artists.length; i++) {
                    //save away the 3 things
                }
                data.body.artists.map(function(x) { 

                map2_callback(null, data);
            }, function(err) {
                done(err);
            });
        }, function(err, res) {
            if (null) map1_callback(err);

            map1_callback(null, res);
        });
    }, function(err, res) {
        console.log("done with everything");
        console.log(res);
        callback(null, res);
    });
});
};

var jsonfile = require('jsonfile');
var file1 = 'lukas_artists.json';
var file2 = 'caleb_artists.json';


//spotify_connect.related_artists(jsonfile.readFileSync(file1), jsonfile.readFileSync(file2), function(err, res) { 
//    console.log("got out");
//});

// code to test
var code1 = 'BQAn9yxO-_tvXKueJ4kpf4nv_bU4VbjJRIBTBZqqzH9KfYivmnwWDCrLUDokJHJysKg9-xBXCGhelXFv1RMwQogzotLFRzEKQ9sT5nIxC9qSHJvE8syiLkL35gcjtj0GUpZEIZZ2OxPV6tqO_ChOC2lUeLC10juMcOvwqYLOI1yWQw';

var code2 = 'BQB0yWPQfTafPZgfzqKPVSpzrlm-IiHVibNj06cVrXfajjFYNTK-sBFMyyBu3RLLNTeJLPOjFc4Ax2jahzA3x7DbucH-Iisf3xc2-RLP6YXRS0GejN9VNsVtNph5ESkBDuXMebv_QOJboz09BWns54_5VA-7OGsEHwlQyOxzXN4Ys3tw6A';

//spotify_connect.multi_token_lookup(code1, code2, function(err, res) {
//    console.log(res);
//});
