var jsonfile = require('jsonfile');

l_tracks = jsonfile.readFileSync('lukas_tracks.json');
l_artists = jsonfile.readFileSync('lukas_artists.json');
c_tracks = jsonfile.readFileSync('caleb_tracks.json');
c_artists = jsonfile.readFileSync('caleb_artists.json');

console.log(l_tracks);


match = function(p1_track, p1_artist, p2_track, p2_artist, callback) {


    // you parse the stuff in here


    callback() // you put the percentage in here when youre done
}


// testing!
match(l_tracks, l_artists, c_tracks, c_artists, function(res) {
    console.log(res);
});

