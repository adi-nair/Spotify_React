import React from 'react';
import './App.css';
import { SearchBar } from '../SearchBar/SearchBar';
import { SearchResults } from '../SearchResults/SearchResults';
import { Playlist } from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      searchResults : [],
      playlistName: "My React Playlist",
      playlistTracks:  []
    }
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track){
    let tracks = this.state.playlistTracks;

    if(tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }

    tracks.push(track);

    this.setState({ playlistTracks: tracks });
  }

  removeTrack(track){
    let tracks = this.state.playlistTracks;
    let filteredTrack = tracks.filter(currTrack=>{
      return (
        track.id !== currTrack.id
      );
    })
    this.setState({ playlistTracks: filteredTrack });
  }

  updatePlaylistName(name){
    this.setState({ playlistName: name });
  } 

  savePlaylist(){
    const trackUris = this.state.playlistTracks.map(track => track.uri);
    //after saving the playlist, re-initialising an empty playlist.
    Spotify.savePlaylist(this.state.playlistName, trackUris).then(()=>{
      this.setState({
        playlistName:"New Playlist",
        playlistTracks: []
      })
    })
    
  } 

  search(searchTerm){
    //Spotify.search returns a promise so a .then() will allow to access the returned data
    //as searchReturns which is then set state to the searchResults.
    Spotify.search(searchTerm).then(searchReturns => {
      this.setState({ searchResults: searchReturns});
    })
  }

  componentDidMount() {
    window.addEventListener('load', () => {Spotify.getAccessToken()});
  }

  render(){
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
            <SearchResults 
              searchResults={this.state.searchResults}
              onAdd={this.addTrack} />
            <Playlist 
              onSave={this.savePlaylist}
              onNameChange={this.updatePlaylistName}
              playlistName={this.state.playlistName} 
              playlistTracks={this.state.playlistTracks} 
              onRemove={this.removeTrack}              />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
