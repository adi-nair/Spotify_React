let accessToken;
const clientId = process.env.REACT_APP_CLIENT_ID; 
const redirectUri = 'http://localhost:3000/';
require('dotenv').config()


const Spotify = {
    getAccessToken(){
        if(accessToken){
            return accessToken;
        }
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        
        if(accessTokenMatch && expiresInMatch){
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(()=> accessToken = '', expiresIn*1000);
            window.history.pushState('Acess Token', null, '/');
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }
        
    },

    search(searchTerm){
        const accessToken = Spotify.getAccessToken();
        console.log(accessToken);
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`,{
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(res => {
                return res.json();
        //data is the json response returned as a promise.
        }).then(data => {
            if (!data.tracks){
                return [];
            } 
            return data.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        })
    },

    savePlaylist(playlistName, trackUriArray){
        if(!playlistName || !trackUriArray.length){
            return;
        }
        const accessToken = Spotify.getAccessToken();
        console.log(accessToken);

        const headers = { Authorization: `Bearer ${accessToken}`};
        const headersPOST = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        }
        let userID;

        return fetch('https://api.spotify.com/v1/me', { headers: headers })
			.then(res => res.json())
			.then(data => {
				userID = data.id;
				return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, 
					{ 
						method: 'POST',
						headers: headersPOST,                   //changed headers for POST
						body: JSON.stringify({ name: playlistName })
                    })
                    .then(res => res.json())
					.then(data => { 
						const playlistID = data.id;
						return fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, 
							{
								method: 'POST',
								headers: headersPOST,              //changed headers for POST
								body: JSON.stringify({ uris: trackUriArray })
							});
					});
			}).catch(err => console.log(err));


    }

};

export default Spotify; 