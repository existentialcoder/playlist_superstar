CREATE TABLE Song (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title TEXT NOT NULL,
    playlistId INT NOT NULL,
    FOREIGN KEY (playlistId) REFERENCES Playlist(id)
);

insert into Song (title, playlistId) values ('https://www.tamilpaa.com/3911-kombulae-poov-suthi-tamil-songs-lyrics', 9);
insert into Song (title, playlistId) values ('https://www.tamilpaa.com/1070-olli-olli-iduppe-tamil-songs-lyrics', 9);
insert into Song (title, playlistId) values ('https://www.tamilpaa.com/2500-otha-sollaala-tamil-songs-lyrics', 9);
insert into Song (title, playlistId) values ('https://www.tamilpaa.com/886-vanganna-vanakanganna-tamil-songs-lyrics', 9);
insert into Song (title, playlistId) values ('https://www.tamilpaa.com/2968-odi-odi-vilayada-tamil-songs-lyrics', 9);
insert into Song (title, playlistId) values ('https://www.tamilpaa.com/843-nakku-mukka-tamil-songs-lyrics', 9);
insert into Song (title, playlistId) values ('https://www.tamilpaa.com/1954-kattikida-tamil-songs-lyrics', 9);
insert into Song (title, playlistId) values ('https://www.tamilpaa.com/3447-oru-kuchi-oru-kulfi-tamil-songs-lyrics', 9);