import { all } from "./db.js";

export interface PlaylistRow {
  trackId: number;
  name: string;
  artist: string;
  position: number;
}

/**
 * Returns the current snapshot row for each track in the given playlist.
 * Both the playlist page and the in-playlist search build on this.
 */
function getCurrentRows(playlistId: number): PlaylistRow[] {
  return all<PlaylistRow>(
    `SELECT s.track_id AS trackId,
            t.name      AS name,
            t.artist    AS artist,
            s.position  AS position
       FROM snapshots s
       JOIN tracks t ON t.id = s.track_id
      WHERE s.playlist_id = $playlistId
        AND s.snapshot_date = (
          SELECT MAX(s2.snapshot_date)
            FROM snapshots s2
           WHERE s2.playlist_id = s.playlist_id
             AND s2.track_id = s.track_id
        )`,
    { $playlistId: playlistId }
  );
}

/**
 * Powers the playlist page (e.g. GET /playlist/:id): the ordered list of
 * tracks with the position shown next to each one.
 */
export function getPlaylistView(playlistId: number): PlaylistRow[] {
  return getCurrentRows(playlistId)
    .sort((a, b) => a.position - b.position)
    .map((row, index) => ({
      trackId: row.trackId,
      name: row.name,
      artist: row.artist,
      position: index + 1,
    }));
}

/**
 * Powers the "search for a track inside this playlist" feature
 * (e.g. GET /playlist/:id/search?q=...): the tracks whose name matches the
 * query, with the position each one sits at in the playlist.
 */
export function searchTrackInPlaylist(
  playlistId: number,
  query: string
): PlaylistRow[] {
  const normalized = query.trim().toLowerCase();

  return getPlaylistView(playlistId).filter((row) =>
    row.name.toLowerCase().includes(normalized)
  );
}
