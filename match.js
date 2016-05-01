var jsonfile = require('jsonfile');

l_tracks = jsonfile.readFileSync('lukas_tracks.json');
l_artists = jsonfile.readFileSync('lukas_artists.json');
c_tracks = jsonfile.readFileSync('caleb_tracks.json');
c_artists = jsonfile.readFileSync('caleb_artists.json');

//console.log(l_tracks);


match = function(p1_track, p1_artist, p2_track, p2_artist, callback) {


    // you parse the stuff in here
    var p2_track_id = [];
    var p2_artist_id = [];
    var common_tracks = [];
    var common_artists = [];
    for (i = 0; i < p2_track.length; i++){
    	p2_track_id.push(p2_track[i].id);
    	p2_artist_id.push(p2_artist[i].id);
    }
    for (i = 0; i < p1_track.length; i++){
    	if (p2_track_id.indexOf(p1_track[i].id) > -1){
    		common_tracks.push(p1_track[i].id);
    	}
    	if (p2_artist_id.indexOf(p1_artist[i].id) > -1){
    		common_artists.push(p1_artist[i].id);
    	}
    }
    var compatibility = (common_tracks.length/p1_track.length)*(0.4) + (common_artists.length/p1_artist.length)*(0.6) 
    
    // }

    callback(compatibility /**should pass in common tracks and artists for display*/) // you put the percentage in here when youre done
}


// testing!
//should return 1
l_tracks = jsonfile.readFileSync('test_track1.json');
l_artists = jsonfile.readFileSync('test_artist1.json');
c_tracks = jsonfile.readFileSync('test_track2.json');
c_artists = jsonfile.readFileSync('test_artist2.json');

match(l_tracks, l_artists, c_tracks, c_artists, function(res) {
    console.log(res);
});

l_tracks = jsonfile.readFileSync('lukas_tracks.json');
l_artists = jsonfile.readFileSync('lukas_artists.json');
c_tracks = jsonfile.readFileSync('caleb_tracks.json');
c_artists = jsonfile.readFileSync('caleb_artists.json');

match(l_tracks, l_artists, c_tracks, c_artists, function(res) {
    console.log(res);
});

