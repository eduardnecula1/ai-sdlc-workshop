using MusicCatalog.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<PlaylistService>();

var app = builder.Build();

app.MapGet("/api/hello", () => new { message = "Hello from the Music Catalog API" });

app.MapGet("/api/tracks", (PlaylistService playlist) => playlist.Catalog);

app.MapGet("/api/playlist", (PlaylistService playlist) => playlist.GetPlaylist());

app.MapPost("/api/playlist/tracks", (AddTrackRequest? request, PlaylistService playlist) =>
{
    if (request?.TrackId is not int trackId)
    {
        return Results.BadRequest(new { error = "trackId is required and must be an integer." });
    }

    return playlist.Add(trackId, out var track) switch
    {
        AddResult.Added => Results.Created($"/api/playlist/tracks/{trackId}", track),
        AddResult.Duplicate => Results.Conflict(new { error = "Track is already in the playlist." }),
        _ => Results.NotFound(new { error = "Track not found." }),
    };
});

app.Run();

// Exposed for WebApplicationFactory in integration tests.
public partial class Program;

public sealed record AddTrackRequest(int? TrackId);