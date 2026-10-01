VOXPHER MUSIC - HOW TO ADD YOUR MP3s
====================================
1. Drop each song's .mp3 file into this /audio/ folder.
   Keep names simple, e.g. kaan-khol.mp3, mai-or-180.mp3

2. Open music.html, find the track row for the song, and set:
      data-src="audio/kaan-khol.mp3"
   then remove the "no-src" class from that same row.

3. That's it. The player picks it up automatically:
   play/pause, next/previous, seek bar, time display and the
   live visualizer all work with no other changes.

Rows still marked no-src show an "MP3 soon" tag and their
YouTube/platform links keep working in the meantime.
