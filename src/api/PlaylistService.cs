using System.Text.Json;

namespace MusicCatalog.Api;

public sealed record Track(int Id, string Title, string Artist, string Album, int DurationSeconds);

public enum AddResult
{
    Added,
    NotFound,
    Duplicate,
}

public sealed class PlaylistService
{
    private readonly object _gate = new();
    private readonly IReadOnlyList<Track> _catalog;
    private readonly List<Track> _playlist = [];

    public PlaylistService()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Data", "tracks.json");
        using var stream = File.OpenRead(path);
        _catalog = JsonSerializer.Deserialize<List<Track>>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? [];
    }

    public IReadOnlyList<Track> Catalog => _catalog;

    public IReadOnlyList<Track> GetPlaylist()
    {
        lock (_gate)
        {
            return _playlist.ToArray();
        }
    }

    public AddResult Add(int trackId, out Track? track)
    {
        track = _catalog.FirstOrDefault(t => t.Id == trackId);
        if (track is null)
        {
            return AddResult.NotFound;
        }

        lock (_gate)
        {
            if (_playlist.Any(t => t.Id == trackId))
            {
                return AddResult.Duplicate;
            }

            _playlist.Add(track);
            return AddResult.Added;
        }
    }
}
