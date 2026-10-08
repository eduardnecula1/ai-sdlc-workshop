import { useEffect, useState } from 'react';

type Track = {
  id: number;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return (await res.json()) as T;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function App() {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getJson<Track[]>('/api/tracks'), getJson<Track[]>('/api/playlist')])
      .then(([catalog, current]) => {
        setTracks(catalog);
        setPlaylist(current);
      })
      .catch((err: Error) => setLoadError(err.message));
  }, []);

  async function addTrack(track: Track) {
    try {
      const res = await fetch('/api/playlist/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id }),
      });
      if (res.status === 409) {
        setStatus(null);
        setAlert(`${track.title} is already in your playlist.`);
        return;
      }
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const added = (await res.json()) as Track;
      setPlaylist((current) => [...current, added]);
      setAlert(null);
      setStatus(`Added ${added.title} to your playlist`);
    } catch {
      setStatus(null);
      setAlert(`Could not add ${track.title} to your playlist. Please try again.`);
    }
  }

  return (
    <main>
      <h1>Music Catalog</h1>
      {loadError && <p role="alert">Could not reach the API: {loadError}</p>}
      {!loadError && !tracks && <p>Loading…</p>}
      {alert && <p role="alert">{alert}</p>}
      <p role="status">{status}</p>
      {tracks && (
        <>
          <section aria-labelledby="catalog-heading">
            <h2 id="catalog-heading">Catalog</h2>
            <ul>
              {tracks.map((track) => (
                <li key={track.id}>
                  {track.title} — {track.artist} ({formatDuration(track.durationSeconds)}){' '}
                  <button type="button" onClick={() => addTrack(track)}>
                    Add {track.title} to playlist
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="playlist-heading">
            <h2 id="playlist-heading">Your playlist</h2>
            {playlist.length === 0 ? (
              <p>Your playlist is empty. Add a track to get started.</p>
            ) : (
              <ol>
                {playlist.map((track) => (
                  <li key={track.id}>
                    {track.title} — {track.artist}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </main>
  );
}
