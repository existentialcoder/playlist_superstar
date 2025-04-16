import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Modal,
  Menu,
  MenuItem
} from '@mui/material';
import { io } from 'socket.io-client';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const socket = io('http://localhost:4000');

function App() {
  const [userName, setUserName] = useState('');
  const [playlistName, setPlaylistName] = useState('')
  const [inPlaylist, setInPlaylist] = useState(false);
  const [songs, setSongs] = useState([]);
  const [allAvailableSongs, setAllAvailableSongs] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [songsExplorerOpen, setSongsExplorerOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [lyricsModal, setLyricsModal] = useState({ open: false, lyrics: '' });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuSongIndex, setMenuSongIndex] = useState(null);

  async function fetchAllSongs() {
    if (allAvailableSongs.length === 0) {
      const res = await (await fetch('http://localhost:4000/all-songs')).json();
      setAllAvailableSongs(res.allSongs);
      return res.allSongs; // Return the fetched songs
    }
    return allAvailableSongs; // Return cached songs
  }

  useEffect(() => {
    let isMounted = true; // To prevent setting state on unmounted component

    async function initialize() {
      const fetchedSongs = await fetchAllSongs();
      if (isMounted) {
        socket.on('updatePlaylist', function (playlist) {
          const songsToSet = fetchedSongs.filter(song =>
            playlist.songs.map(song => song.title).includes(song.song_url)
          );
          setSongs(songsToSet);
          setMembers(playlist.members);
        });
      }
    }

    initialize();

    return () => {
      socket.off('updatePlaylist');
      isMounted = false;
    };
  }, []);

  const joinPlaylist = () => {
    if (playlistName.trim()) {
      socket.emit('joinPlaylist', userName, playlistName);
      setInPlaylist(true);
    }

    socket.on('updatePlaylist', (playlist) => {
      const songsToSet = allAvailableSongs.filter(song =>
        playlist.songs.map(song => song.title).includes(song.song_url)
      );
      setSongs(songsToSet);
      setMembers(playlist.members);
    });
  };

  const handleLyricsOpen = () => {
    const currentSong = songs[menuSongIndex];
    setLyricsModal({ open: true, songTitle: currentSong.song_title, lyrics: currentSong.song_fulllyrics });
    handleMenuClose();
  };

  const handleLyricsClose = () => {
    setLyricsModal({ open: false, lyrics: '' });
  };

  const handleMenuOpen = (event, index) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuSongIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuSongIndex(null);
  };

  const removeSong = () => {
    // Placeholder: emit socket or API call
    const updated = [...songs];
    const songToRemove = updated[menuSongIndex];
    updated.splice(menuSongIndex, 1);

    socket.emit('removeSong', playlistName, songToRemove.song_url);

    setSongs(updated);
    handleMenuClose();
  };

  return (
    <Container sx={{
      minHeight: "100vh",
      margin: "0 auto"
    }}>
      {!inPlaylist ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>What do we call you?</Typography>
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Typography variant="h5" gutterBottom>Name of the playlist?</Typography>
          <TextField
            fullWidth
            label="Playlist Name"
            variant="outlined"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={joinPlaylist}>Join</Button>
        </Paper>
      ) : (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={3} mt={5}>
            <Typography variant="h5">Playlist: {playlistName}</Typography>
            <Box display="flex" gap={2}>
              <div>You: <b>{userName}</b></div>
              {
                members.length > 1 && (
                  <React.Fragment>
                    <div>Other Members: </div>
                    <Box display="flex" alignItems="center">
                      {members.filter(mem => mem.fullName !== userName).slice(0, 2).map((member, i) => (
                        <Avatar key={i} sx={{ bgcolor: 'green', mr: 1 }}>
                          {member.fullName.charAt(0)}
                        </Avatar>
                      ))}
                      <Button size="small" onClick={() => setMembersDialogOpen(true)}>More</Button>
                    </Box>
                  </React.Fragment>
                )
              }
              <Button></Button>
            </Box>
          </Box>


          {/* Explore Songs Button */}
          <Box mt={4} mb={4}>
            <Button variant="contained" color="primary" onClick={() => setSongsExplorerOpen(true)}>Explore Songs</Button>
          </Box>

          {songs.map((song, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Paper elevation={3} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar variant="square" sx={{ width: 80, height: 80, mr: 2 }} src={song.movie_image}>
                  <MusicNoteIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6"><a href={song.song_url} target="_blank">
                    {song.song_title.split('(')[0].slice(2)}
                  </a></Typography>
                  <Typography variant="body2" color="text.secondary">{song.singers} {song.song_singers}</Typography>
                </Box>
                <IconButton onClick={(e) => handleMenuOpen(e, index)}>
                  <MoreVertIcon />
                </IconButton>
              </Paper>
            </Box>
          ))}

          {/* Lyrics Modal */}
          <Modal open={lyricsModal.open} onClose={handleLyricsClose}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              color: 'black',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: 24,
              p: 4,
              width: 400
            }}>
              <Typography variant="h6"><b>{lyricsModal.songTitle}</b></Typography>
              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {lyricsModal.lyrics}
              </Typography>
            </Box>
          </Modal>
          <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={removeSong}>Remove Song</MenuItem>
            <MenuItem onClick={() => handleLyricsOpen()}>View Lyrics</MenuItem>
          </Menu>

          {/* Members Dialog */}
          <Dialog open={membersDialogOpen} onClose={() => setMembersDialogOpen(false)}>
            <DialogTitle>Playlist Members</DialogTitle>
            <DialogContent>
              <List>
                {members.filter(memb => userName !== memb.fullName).map((member, i) => (
                  <ListItem key={i}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'green' }}>{member.fullName.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={member.fullName} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
          </Dialog>

          {/* Songs Explore Dialog */}
          <Dialog open={songsExplorerOpen} onClose={() => setSongsExplorerOpen(false)}>
            <DialogTitle>Songs List</DialogTitle>
            <DialogContent>
              <List>

              </List>
            </DialogContent>
          </Dialog>

          {/* Edit Playlist Name Dialog */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>Edit Playlist Name</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Playlist Name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                sx={{ mt: 1 }}
              />
            </DialogContent>
          </Dialog>
        </Box>
      )}
    </Container>
  );
}

export default App;
