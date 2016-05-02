var async = require('async');
var match = require('./match');
var spcred = require('./spotify_cred');
var spotify_token = module.exports = {};


spotify_token.multi_token_lookup = function(token1, token2, final_callback) {
    async.map([token1, token2], spotify_token.single_token_lookup, function(err, results) {
        if (err) final_callback(err); 

        match.match(results[0].tracks, results[0].artists, results[1].tracks, results[1].artists, function(err, res) {
            if (err) final_callback(err);

            final_callback(null, res);
        });
    });
};

// results come back as {tracks: [objects], artists: [objects]}
spotify_token.single_token_lookup = function(code, final_callback) {
    spcred.spotifyApi.setAccessToken(code);
    async.parallel({
        tracks: function(callback) {
            spcred.spotifyApi.getMyTopTracks({"limit":50}).then(function(data) {
                //data.body.items.map(function(x) { console.log(x.name); });
                spcred.spotifyApi.getAudioFeaturesForTracks(
                        data.body.items.map(function(x) { return x.id; }))
                    .then(function(features) {
                        for (var i = 0; i < data.body.items.length; i++) {
                            data.body.items[i].features = features.body.audio_features[i];
                        }

                        callback(null, data.body.items);
                    }, function(err) {
                        console.log("something went wrong with feature lookup", err);
                        callback(err);
                    });
            }, function(err) {
                console.log('Something went wrong with getting tracks!', err);
                callback(err);
            });
        },
        artists: function(callback) { 
            spcred.spotifyApi.getMyTopArtists({"limit":50}).then(function(data) {
                //data.body.items.map(function(x) { console.log(x.name); });
                callback(null, data.body.items);
            }, function(err) {
                console.log('Something went wrong with getting artists!', err);
                callback(err);
            });
        }
    },
    function(err, results) {
        if (err) final_callback(err);

        final_callback(null, results);
    });
};

// all just testing!!!

//var jsonfile = require('jsonfile');
//var file1 = 'lukas_artists.json';
//var file2 = 'caleb_artists.json';

//spotify_token.related_artists(jsonfile.readFileSync(file1), jsonfile.readFileSync(file2), function(err, res) { 
//	intersect_length = Math.min(res[0].length, res[1].length);
//
//	intersect = res[0].filter(function(n) {
//		return res[1].indexOf(n) != -1;
//	});
//
//	console.log("related intersection");
//	console.log(intersect.length / intersect_length);
//});

// code to test
var code1 = 'BQDk9jF0jVi9LCx3v1-pPYRlmLPlwmFGdQAQsZPy8gbzadFfBV8Ls_bDWl8EpcOqwc6Yk9IMv0O4iiUQt-JIl-I8ycALAVhb-rLwzVrPKX5O8l0jKDiqBs3nJFL0TMM2cTvtc7GKti3E4fDw32OMzGYW9o10ug6KSQsDvQX549O7IFcwkw';

var code2 = 'BQD27UvnUs4rtOdAUnCKO8AKJGqRAy5esx2nhvC1EgoLmA6LEIjGXIPZDMwe9H-2VwaCCllK9phUm1zvz18eE7Uxj94nzBrpXZCnwZwLxEn4wNWdkrR_pOujyS-n04PCnvzNzNCAnlz5jSld3kDUtrWccQgjYQWZTCHCjmIj9sYwx2Bo_A';

spotify_token.multi_token_lookup(code1, code2, function(err, res) {
    if (err) { throw(err); }
    console.log(res);
});
