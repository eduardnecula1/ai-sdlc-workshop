import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

const catalog = [
  { id: 1, title: 'Morning Tide', artist: 'The Synthetic Seagulls', album: 'Harbour Lights', durationSeconds: 214 },
  { id: 2, title: 'Paper Satellites', artist: 'Nova Placeholder', album: 'Orbit Drafts', durationSeconds: 187 },
];

type Reply = { ok: boolean; status?: number; body?: unknown };

function stubApi(onPost: () => Reply) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const reply: Reply =
        init?.method === 'POST' ? onPost() : { ok: true, body: url === '/api/tracks' ? catalog : [] };
      return Promise.resolve({
        ok: reply.ok,
        status: reply.status ?? (reply.ok ? 200 : 500),
        json: () => Promise.resolve(reply.body),
      });
    }),
  );
}

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the catalog and the empty playlist text', async () => {
    stubApi(() => ({ ok: true, status: 201, body: catalog[0] }));
    render(<App />);

    expect(await screen.findByRole('button', { name: 'Add Morning Tide to playlist' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Paper Satellites to playlist' })).toBeInTheDocument();
    expect(screen.getByText('Your playlist is empty. Add a track to get started.')).toBeInTheDocument();
  });

  it('moves an added track into the playlist and announces it', async () => {
    stubApi(() => ({ ok: true, status: 201, body: catalog[0] }));
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add Morning Tide to playlist' }));

    const playlist = screen.getByRole('region', { name: 'Your playlist' });
    expect(await within(playlist).findByText(/Morning Tide/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Added Morning Tide to your playlist');
    expect(screen.queryByText('Your playlist is empty. Add a track to get started.')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an alert naming the track when it is already in the playlist', async () => {
    stubApi(() => ({ ok: false, status: 409, body: { error: 'duplicate' } }));
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add Morning Tide to playlist' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Morning Tide is already in your playlist.');
  });

  it('shows a generic alert when adding fails', async () => {
    stubApi(() => ({ ok: false, status: 500 }));
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add Paper Satellites to playlist' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not add Paper Satellites to your playlist.');
  });

  it('shows an alert when the API cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }));
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the API');
  });
});
