# PR Description

## Summary

A customer reported that the position shown on the playlist page and the position returned by in-playlist search disagreed for the same track, and that both were outdated, not reflecting the track's actual current place in the playlist. This PR fixes both problems by correcting the snapshot selection logic and unifying position calculation to a single source of truth.

## Root Cause

### Part 1: the two views disagree

`getPlaylistView` computed a 1-indexed display position by sorting raw rows and using each row's array index (`index + 1`). `searchTrackInPlaylist`, however, returned `row.position` directly (the raw, 0-indexed integer stored in the database). The two functions were independently deriving position using different rules, so disagreement was unavoidable.

### Part 2: the position is out of date

`getCurrentRows` selected a snapshot row per track using:

```sql
SELECT MIN(s2.snapshot_date) …
```

`MIN` returns the **oldest** date in the table, so every query was reading the first captured snapshot instead of the most recent one. Changing `MIN` to `MAX` makes the query return the latest snapshot, which is the source of truth for where a track currently sits.

## Source of Truth

The `snapshots` table is populated by the recurring Spotify ingest pipeline, so the latest `snapshot_date` per track reflects the live playlist as of the most recent capture. The customer's report confirms this: on the 2026-05-28 snapshot, Calm Down sits at position 2 (0-indexed), which maps to display position #3, exactly what they reported.

## Implementation

Both fixes live entirely in `src/queries.ts`.

**Part 1 fix: `searchTrackInPlaylist` (lines 59–61):**
Replaced the independent filter over `getCurrentRows` with a filter over `getPlaylistView`. Since `getPlaylistView` is already the authoritative function for computing 1-indexed display positions, having search delegate to it makes it structurally impossible for the two endpoints to return different positions for the same track.

**Part 2 fix: `getCurrentRows` (line 24):**
Changed `MIN` to `MAX` in the correlated subquery so the function reads the most recent snapshot date instead of the oldest. This is the right layer to fix because `getCurrentRows` is the single function that fetches raw snapshot data for all callers.

**Trade-off:** `searchTrackInPlaylist` now fetches and sorts all tracks before filtering, rather than working directly on a raw query result. For current playlist sizes this overhead is negligible, but it is worth keeping in mind if playlists grow significantly. If scale becomes a concern, moving the search filter into the SQL query would allow the database to return only matching tracks, avoiding the cost of transferring and sorting the full track list in JavaScript.

## Regression Prevention

By making `searchTrackInPlaylist` a filter on top of `getPlaylistView` rather than an independent code path, position calculation now has a single owner. Any future change to position logic in `getPlaylistView` is automatically reflected in search, with no second place to update and no way for the two views to drift apart again.

The `MIN` to `MAX` change keeps the query correct as the table grows: every new snapshot ingested automatically becomes the current state with no code changes needed. The intent is also clear from reading the query, which lowers the chance of the same mistake being reintroduced.

# Communication

## Customer Follow-Up Message

Hi [Name],

My name is Ella Choi, and I'm reaching out from the Chartmetric support team. Thank you for letting us know. Both problems have now been fixed.

Here is a quick summary of what was resolved:

1. **Playlist page and search now show the same position.** Both features are now reading from the same data source, so the position numbers will always match.

2. **Positions now reflect the current state of your playlist.** Our system was reading an outdated version of your playlist data. This has been corrected, so you'll always see the most up-to-date positions going forward.

Everything should be working as expected now. If you run into anything else, feel free to reach out at support@chartmetric.com.

Ella Choi

## Team Follow-Up Message

Hey team,

Wanted to share a quick post-mortem on a bug we just resolved. A customer reported that searching for Calm Down inside their playlist returned a different position than what the playlist page showed, and neither matched the actual current position (#3). Two separate issues were identified in `src/queries.ts`.

**Issue 1: Search and playlist page reported different positions**

- **Problem:** The same track showed different position numbers depending on where the customer looked.
- **Root cause:** `searchTrackInPlaylist` returned `row.position` directly (the raw 0-indexed DB value), while `getPlaylistView` computed a 1-indexed display position. The two functions were deriving position independently using different rules.
- **Fix:** `searchTrackInPlaylist` now filters the result of `getPlaylistView` instead of re-deriving position from raw DB values. Both endpoints now share a single source of truth for position calculation.

**Issue 2: Positions were out of date**

- **Problem:** The positions shown didn't match the actual current order in the playlist.
- **Root cause:** `getCurrentRows` used `MIN(snapshot_date)` in its correlated subquery, causing every query to read the oldest ingested snapshot instead of the most recent one.
- **Fix:** Changed `MIN` to `MAX`. The query now always reads the latest snapshot.

**Additional Notes**

- **Trade-off:** `searchTrackInPlaylist` now fetches and sorts all tracks before filtering. At current scale this is negligible, but worth keeping in mind if playlist sizes grow significantly. If scale becomes a concern, moving the search filter into the SQL query would allow the database to return only matching tracks, avoiding the cost of transferring and sorting the full track list in JavaScript.
- **What to watch for:** Any future endpoint reading from `snapshots` should always use `MAX(snapshot_date)` per track per playlist. Worth considering a database view or a shared query helper to enforce this as the obvious default and prevent the same mistake from showing up in future endpoints.
