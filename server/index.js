const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const model = require('./model'); // import the model

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: '*', // update this in production
  methods: ['GET', 'POST']
}));


const io = new Server(server, {
  cors: {
    origin: '*', // update this in production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('addSong', async (playlistName, song) => {
    try {
      await model.addSong(playlistName, song);
      const updatedSongs = await model.getPlaylist(playlistName);
      const clients = await model.getClients(playlistName);
      const updatedPlaylist = { members: clients, songs: updatedSongs };
      io.to(playlistName).emit('updatePlaylist', updatedPlaylist);
    } catch (error) {
      console.error('Error adding song:', error);
    }
  });

  socket.on('removeSong', async (playlistName, song) => {
    try {
      await model.removeSong(playlistName, song);
      const updatedSongs = await model.getPlaylist(playlistName);
      const updatedPlaylist = { members: updatedSongs.clients, songs: updatedSongs.songs };
      io.to(playlistName).emit('updatePlaylist', updatedPlaylist);
    } catch (error) {
      console.error('Error removing song:', error);
    }
  });

  socket.on('joinPlaylist', async (fullName, playlistName) => {
    try {
      console.log(`User with name ${fullName} and socket ${socket.id} joining playlist: ${playlistName}`);
      const updatedClients = await model.joinPlaylist(socket, socket.id, fullName, playlistName);
      socket.join(playlistName);

      const songsInPlaylist = (await model.getPlaylist(playlistName)).songs;

      io.to(playlistName).emit('updatePlaylist', { members: updatedClients, songs: songsInPlaylist });
    } catch (error) {
      console.error('Error joining playlist:', error);
    }
  });

  socket.on('disconnecting', async () => {
    try {
      if (socket.data && socket.data.playlists) {
        for (const playlistName of socket.data.playlists) {
          await model.leavePlaylist(socket.id);
          console.log(`🔌 ${socket.id} left playlist ${playlistName}`);
          const updatedPlaylist = await model.getPlaylist(playlistName);
          updatedPlaylist.members = updatedPlaylist.clients;
          io.to(playlistName).emit('updatePlaylist', updatedPlaylist);
        }
      }
    } catch (error) {
      console.error('Error during disconnecting:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.get('/all-songs', (req, res) => {
  try {
    const allSongsJson = require('./data/tamil_movies_db_fixed.json');

    allSongs = []

    allSongsJson.forEach((item) => {
      const movieData = item;

      movieData.movie_song.forEach((song) => {
        allSongs.push({
          song_title: song.song_title,
          song_url: song.song_url,
          song_music: song.song_music,
          song_lyrics: song.song_lyrics,
          song_singers: song.song_singers,
          song_fulllyrics: song.song_fulllyrics,
          movie: movieData.movie,
          year: movieData.year,
          music: movieData.music,
          actors: movieData.actors,
          movie_url: movieData.movie_url,
          movie_image: movieData.movie_image,
          movie_name_tamil: movieData.movie_name_tamil,
          movie_name_eng: movieData.movie_name_eng,
        });
      });
    });

    res.send({ allSongs });
  } catch (error) {
    console.error('Error fetching all songs:', error);
    res.status(500).send({ error: 'Failed to fetch songs' });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
