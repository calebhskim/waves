//var jsonfile = require('jsonfile');
var match = module.exports = {};
var spcred = require('./spotify_cred');
var async = require('async');


//l_tracks = jsonfile.readFileSync('lukas_tracks.json');
//l_artists = jsonfile.readFileSync('lukas_artists.json');
//c_tracks = jsonfile.readFileSync('caleb_tracks.json');
//c_artists = jsonfile.readFileSync('caleb_artists.json');

freq_count = function(arr) {
    hash = {};

    for (var i in arr) {
        if (arr[i] in hash) {
            hash[arr[i]] += 1;
        } else {
            hash[arr[i]] = 1;
        }
    }
    return hash;
};
    
expose_id = function(x) {
    return x.id;
};

match.match = function(p1_track, p1_artist, p2_track, p2_artist, callback) {
    //setting up ID arrays 
    var p1_track_id = [], p1_artist_id = [], p2_track_id = [], p2_artist_id = [];

    p1_track_id = p1_track.map(expose_id);
    p1_artist_id = p1_artist.map(expose_id);
    p2_track_id = p2_track.map(expose_id);
    p2_artist_id = p2_artist.map(expose_id);

    //finding commonalities
    var common_tracks = [], common_artists = [];
    var total_tp = 0, tp = 0, total_ap = 0, ap = 0; 

    for (i = 0; i < p1_track.length; i++){

        var p2t_index = p2_track_id.indexOf(p1_track_id[i]);
        var rank1 = Math.floor((i / 10));

        if (p2t_index > -1){
            common_tracks.push(p1_track[i].id);
            var rank2 = Math.floor((p2t_index / 10));
            if (rank2 == rank1){
                tp += (Math.floor((p1_track.length / 10)) - rank2);
                total_tp += (Math.floor((p1_track.length / 10)) - rank2);
            } else if (rank2 < rank1){
                total_tp += (Math.floor((p1_track.length / 10)) - rank2);
            } else {
                total_tp += (Math.floor((p1_track.length / 10)) - rank1);
            }
        }
    }

    for (i = 0; i < p1_artist.length; i++){
        var p2a_index = p2_artist_id.indexOf(p1_artist_id[i]);

        if (p2a_index > -1){
            common_artists.push(p1_artist[i].id);
            var rank2 = Math.floor((p2a_index / 10));
            if (rank2 == rank1){
                ap += (Math.floor((p1_artist.length / 10)) - rank2);
                total_ap += (Math.floor((p1_artist.length / 10)) - rank2);
            } else if (rank2 < rank1){
                total_ap += (Math.floor((p1_artist.length / 10)) - rank2);
            } else {
                total_ap += (Math.floor((p1_artist.length / 10)) - rank1);
            }
        }
    }

    //checks for corners
    var track_points = 0, artist_points = 0;

    if (common_tracks.length != 0){
        if ((tp == 0) && (total_tp == 0)){
            total_tp = 1;
            tp = 1;
        }
        track_points = (tp/total_tp);
    }

    if (common_artists.length != 0){
        if ((ap == 0) && (total_ap == 0)){
            total_ap = 1;
            ap = 1;
        }
        console.log("ap ??? ",ap, "  total_ap", total_ap);
        artist_points = (ap/total_ap);
    }

    var p1_genres = [].concat.apply([], p1_artist.map(function(x) { return x.genres; }));
    var p2_genres = [].concat.apply([], p2_artist.map(function(x) { return x.genres; }));

    p1_hash = freq_count(p1_genres);
    p2_hash = freq_count(p2_genres);

    genre_under = Math.min(p1_genres.length, p2_genres.length);

    key = Object.keys(p1_hash);
    genre_overall = 0;

    for (var i = 0; i < key.length; i++) {
        if (key[i] in p1_hash && key[i] in p2_hash) {
            genre_overall += Math.min(p1_hash[key[i]], p2_hash[key[i]]);
        }
    } 

    related_artists(p1_artist, p2_artist, function(err, res) {
        if (err) callback(err);

        related_intersect_length = Math.max(Math.min(res[0].length, res[1].length), 1);
        related_intersect = res[0].filter(function(n) {
            return res[1].indexOf(n) != -1;
        });

        var common_track_res = common_tracks.length/p1_track.length;
        var common_artists_res = common_artists.length/p1_artist.length;
        var related_res = related_intersect.length / related_intersect_length;
        var genre_res = genre_overall / genre_under;
        console.log("match results:");
        console.log("common tracks:", common_track_res); 
        console.log("track points:", track_points); 
        console.log("common artists:", common_artists_res); 
        console.log("artist points:", artist_points); 
        console.log("related artists:", related_res); 
        console.log("related artists:", related_res); 

        var compatibility = (common_track_res)*(0.25) + track_points*(0.05) + 
            (common_artists_res)*(0.25) + artist_points*(0.05) +
            (related_res)*(0.07) + 
            (genre_res)*(0.33);
		
		var top3_artists = [];
		for (var i = 0; i < 3 && i < common_artists.length; i++) {
			top3_artists.push(common_artists[i]);
        }

        getArtists(top3_artists,
                function(data) {
                    var artists_with_imgs = data.body.artists.map(function(x) { return {"name":x.name, "image": x.images[0].url}; });
                    callback(null, {"percent":compatibility, "common_artists":artists_with_imgs}); 
                }, function(err) {
                    console.log("failed");
                    console.error(err);
                    callback(err);
                });
	});
};

getArtists = function(artists, success, fail) {
    spcred.spotifyApi.getArtists(artists)
      .then(success, fail); 
};

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

related_artists = function(p1_artists, p2_artists, callback) {
    async.mapSeries([p1_artists.slice(0,10), p2_artists.slice(0,10)], function(item1, map1_callback) {
        async.map(item1, function(item2, map2_callback) {
            spcred.spotifyApi.getArtistRelatedArtists(item2.id).then(function(data) {

                map2_callback(null, data.body.artists.slice(0,5).map(function(x) { return x.id; }));
            }, function(err) {
                map2_callback(err);
            });
        }, function(err, res) {
            if (err) map1_callback(err);

            flat = [].concat.apply([], res);


            uniqueArray = uniq(flat.concat(item1.map(function(x) { return x.id; })));

            map1_callback(null, uniqueArray);
        });
    }, function(err, result) {
        if (err) callback(err);

        callback(null, result);
    });
};
