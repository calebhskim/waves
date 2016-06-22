var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId : '2fba170ea0a347e5b4a745949bb47e8f',
  clientSecret : 'c31edf15faaa4df789de7586d955855d'
});

exports.spotifyApi = spotifyApi;
