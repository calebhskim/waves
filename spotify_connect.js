var SpotifyWebApi = require('spotify-web-api-node');
var async = require('async');
var match = require('./match');
var spotify_connect = module.exports = {};

var spotifyApi = new SpotifyWebApi({
  clientId : '2fba170ea0a347e5b4a745949bb47e8f',
  clientSecret : 'c31edf15faaa4df789de7586d955855d'
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

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

spotify_connect.related_artists = function(p1_artists, p2_artists, callback) {
    async.map([p1_artists, p2_artists], function(item1, map1_callback) {
        async.map(item1, function(item2, map2_callback) {
            spotifyApi.getArtistRelatedArtists(item2.id).then(function(data) {
                var top6 = [];
                for (var i = 0; i < 6 && i < data.body.artists.length; i++) {
                    top6.push(data.body.artists[i]);
                }

                map2_callback(null, top6.map(function(x) { return x.id; }));
            }, function(err) {
                done(err);
            });
        }, function(err, res) {
            if (err) map1_callback(err);

            flat = [].concat.apply([], res);

            uniqueArray = uniq(flat.concat(item1.map(function(x) { return x.id; })));

            map1_callback(null, uniqueArray);
        });
    }, function(err, res) {
        if (err) callback(err);

        callback(null, res);
    });
};


spotify_connect.getArtists = function(artists, success, fail) {
    spotifyApi.getArtists(artists)
      .then(success, fail); 
}

var jsonfile = require('jsonfile');
var file1 = 'lukas_artists.json';
var file2 = 'caleb_artists.json';

//spotify_connect.related_artists(jsonfile.readFileSync(file1), jsonfile.readFileSync(file2), function(err, res) { 
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
var code1 = 'BQAn9yxO-_tvXKueJ4kpf4nv_bU4VbjJRIBTBZqqzH9KfYivmnwWDCrLUDokJHJysKg9-xBXCGhelXFv1RMwQogzotLFRzEKQ9sT5nIxC9qSHJvE8syiLkL35gcjtj0GUpZEIZZ2OxPV6tqO_ChOC2lUeLC10juMcOvwqYLOI1yWQw';

var code2 = 'BQB0yWPQfTafPZgfzqKPVSpzrlm-IiHVibNj06cVrXfajjFYNTK-sBFMyyBu3RLLNTeJLPOjFc4Ax2jahzA3x7DbucH-Iisf3xc2-RLP6YXRS0GejN9VNsVtNph5ESkBDuXMebv_QOJboz09BWns54_5VA-7OGsEHwlQyOxzXN4Ys3tw6A';

//spotify_connect.multi_token_lookup(code1, code2, function(err, res) {
//    console.log(res);
//});
