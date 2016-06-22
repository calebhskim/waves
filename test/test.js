var assert = require('chai').assert;
var jsonfile = require('jsonfile');
var match = require('../models/match');

describe('Match', function() {
    before(function() {
        l_tracks = jsonfile.readFileSync('./test_data/lukas_tracks.json');
        l_artists = jsonfile.readFileSync('./test_data/lukas_artists.json');
        c_tracks = jsonfile.readFileSync('./test_data/caleb_tracks.json');
        c_artists = jsonfile.readFileSync('./test_data/caleb_artists.json');
    });
    describe('#indexOf()', function () {
        it('percentage should be 1 since both users the same', function (done) {
            this.timeout(5000);
            match.match(l_tracks, l_artists, l_tracks, l_artists, function(err, res) {
                if (err) throw(err);

                assert.equal(res.percentage, 1);
                done();
            });

        });
    });
});
