var async = require('async');
var match = require('../models/match');
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
//var code1 = 'BQBp751DwweJwo3OqZ3CEqq7LTutzsOCuoradS8jvDxktrY7_UhvRpmjvX37i_9zlDuWdtDluRXTdSGS3T0eLaNyJHIOwtWibKDrlHT-4Gxp0XQkq5nKQKVA5Ygrc8JghnCprHWzQpmB0ZRDgVJoukA0e9x1xoNWvR0-hYR5Ol_RtNvZ5A';
//
//var code2 = 'BQBY9satDwmlwIvtsN51N5jLJgZXlXIhFYwRUzx4KvYZ0eNvVvR3A9LVwkksjMrDyjs1q7AMFMjhMuMXKHuYnCmHhCEcZcaSv2GVWPAY4a6H9pasz3jJDQa115IocWgGtQdkPp47539WsGZEkR0MmeW__y5loC6bregjIV0C8dqNjFXffw';
//
//spotify_token.multi_token_lookup(code1, code2, function(err, res) {
//    if (err) { throw(err); }
//    console.log(res);
//});
