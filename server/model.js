const { PrismaClient } = require('@prisma/client');
const socket = require('socket.io');
const prisma = new PrismaClient();

async function joinPlaylist(clientSocket, socketId, fullName, playlistName) {
  let playlist = await prisma.playlist.findUnique({
    where: { name: playlistName },
    include: { clients: true }
  });

  if (!playlist) {
    playlist = await prisma.playlist.create({
      data: { name: playlistName },
      include: { clients: true }
    });
  }

  let client = await prisma.client.findFirst({
    where: { socketId, fullName }
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        socketId,
        fullName,
        playlists: {
          connect: { id: playlist.id }
        }
      }
    });
  } else {
    await prisma.client.update({
      where: { id: client.id },
      data: {
        playlists: {
          connect: { id: playlist.id }
        }
      }
    });
  }

  clientSocket.join(playlistName);
  if (!clientSocket.data) {
    clientSocket.data = {};
  }
  clientSocket.data.playlists = clientSocket.data.playlists || [];
  clientSocket.data.playlists.push(playlistName);

  const updatedPlaylist = await prisma.playlist.findUnique({
    where: { id: playlist.id },
    include: { clients: true }
  });
  return updatedPlaylist.clients;
}

async function leavePlaylist(socketId) {
  const client = await prisma.client.findFirst({ where: { socketId } });

  if (client) {
    await prisma.client.update({
      where: { id: client.id },
      data: {
        playlists: {
          set: [] // Disconnect the client from all playlists
        }
      }
    });

    await prisma.client.delete({ where: { id: client.id } });
  }
}

async function getPlaylist(playlistName) {
  const playlist = await prisma.playlist.findUnique({
    where: { name: playlistName },
    include: { songs: true, clients: true }
  });

  return playlist ? playlist : {};
}

async function addSong(playlistName, song) {
  const playlist = await prisma.playlist.findUnique({ where: { name: playlistName } });

  if (playlist) {
    await prisma.song.create({
      data: {
        title: song.title,
        playlistId: playlist.id
      }
    });
  }
}

async function removeSong(playlistName, song) {
  const playlist = await prisma.playlist.findUnique({ where: { name: playlistName } });

  if (playlist) {
    await prisma.song.deleteMany({
      where: {
        title: song,
        playlistId: playlist.id
      }
    });
  }
}

module.exports = {
  joinPlaylist,
  leavePlaylist,
  getPlaylist,
  addSong,
  removeSong
};
