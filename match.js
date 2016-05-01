var jsonfile = require('jsonfile');
var match = module.exports = {};
var spotify_connect = require('./spotify_connect');

l_tracks = jsonfile.readFileSync('lukas_tracks.json');
l_artists = jsonfile.readFileSync('lukas_artists.json');
c_tracks = jsonfile.readFileSync('caleb_tracks.json');
c_artists = jsonfile.readFileSync('caleb_artists.json');

match.match = function(p1_track, p1_artist, p2_track, p2_artist, callback) {
	//setting up ID arrays 
    var p1_track_id = [], p1_artist_id = [], p2_track_id = [], p2_artist_id = [];

    p1_track_id = p1_track.map(function(x) { return x.id; });
    p1_artist_id = p1_artist.map(function(x) { return x.id; });
    p2_track_id = p2_track.map(function(x) { return x.id; });
    p2_artist_id = p2_artist.map(function(x) { return x.id; });

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
    		rank2 = Math.floor((p2a_index / 10));
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
    	artist_points = (ap/total_ap);
    }

    spotify_connect.related_artists(p1_artist, p2_artist, function(err, res) {
		intersect_length = Math.max(Math.min(res[0].length, res[1].length), 1);
		intersect = res[0].filter(function(n) {
			return res[1].indexOf(n) != -1;
		});

        var compatibility = (common_tracks.length/p1_track.length)*(0.35) + track_points*(0.05) + 
                            (common_artists.length/p1_artist.length)*(0.4375) + artist_points*(0.0625) +
							(intersect.length / intersect_length)*(0.1);
        
        callback(null, compatibility); 
        /**should pass in common tracks and artists for display*/ 
        // you put the percentage in here when youre done
    });



}


// testing!
//should return 1
l_tracks = jsonfile.readFileSync('test_track1.json');
l_artists = jsonfile.readFileSync('test_artist1.json');
c_tracks = jsonfile.readFileSync('test_track2.json');
c_artists = jsonfile.readFileSync('test_artist2.json');

//match.match(l_tracks, l_artists, c_tracks, c_artists, function(res) {
//    console.log(res);
//});

l_tracks = jsonfile.readFileSync('lukas_tracks.json');
l_artists = jsonfile.readFileSync('lukas_artists.json');
c_tracks = jsonfile.readFileSync('caleb_tracks.json');
c_artists = jsonfile.readFileSync('caleb_artists.json');

//match.match(l_tracks, l_artists, c_tracks, c_artists, function(res) {
//    console.log(res);
//});
