import { all } from './db.js';

interface SnapshotRow {
  playlist_id: number;
  track_id: number;
  track: string;
  position: number;
  snapshot_date: string;
}

const rows = all<SnapshotRow>(
  `SELECT
     s.playlist_id,
     s.track_id,
     t.name        AS track,
     s.position,
     s.snapshot_date
   FROM snapshots s
   JOIN tracks t ON t.id = s.track_id
   WHERE s.playlist_id = 101
   ORDER BY s.snapshot_date, s.position`
);

// eslint-disable-next-line no-console
console.table(rows);
