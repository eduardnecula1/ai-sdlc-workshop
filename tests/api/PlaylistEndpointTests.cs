using System.Net;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;

namespace MusicCatalog.Api.Tests;

public class PlaylistEndpointTests
{
    private sealed record TrackDto(int Id, string Title, string Artist, string Album, int DurationSeconds);

    // A new factory per test gives a clean singleton playlist.
    private static WebApplicationFactory<Program> NewFactory() => new();

    private static StringContent Json(string body) => new(body, Encoding.UTF8, "application/json");

    [Fact]
    public async Task Get_tracks_returns_catalog_with_camel_case_fields()
    {
        using var factory = NewFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tracks");
        var raw = await response.Content.ReadAsStringAsync();
        var tracks = await client.GetFromJsonAsync<List<TrackDto>>("/api/tracks");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(12, tracks?.Count);
        Assert.Contains("\"durationSeconds\"", raw);
        Assert.DoesNotContain("\"DurationSeconds\"", raw);
    }

    [Fact]
    public async Task Get_playlist_is_empty_initially()
    {
        using var factory = NewFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/playlist");
        var playlist = await response.Content.ReadFromJsonAsync<List<TrackDto>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(playlist!);
    }

    [Fact]
    public async Task Post_known_track_returns_201_and_appears_in_playlist_in_insertion_order()
    {
        using var factory = NewFactory();
        var client = factory.CreateClient();

        var first = await client.PostAsJsonAsync("/api/playlist/tracks", new { trackId = 3 });
        var second = await client.PostAsJsonAsync("/api/playlist/tracks", new { trackId = 1 });
        var added = await first.Content.ReadFromJsonAsync<TrackDto>();
        var playlist = await client.GetFromJsonAsync<List<TrackDto>>("/api/playlist");

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.Created, second.StatusCode);
        Assert.Equal(3, added?.Id);
        Assert.Equal([3, 1], playlist!.Select(t => t.Id));
    }

    [Fact]
    public async Task Post_unknown_track_returns_404()
    {
        using var factory = NewFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/playlist/tracks", new { trackId = 9999 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Post_duplicate_track_returns_409_and_keeps_one_entry()
    {
        using var factory = NewFactory();
        var client = factory.CreateClient();

        await client.PostAsJsonAsync("/api/playlist/tracks", new { trackId = 2 });
        var response = await client.PostAsJsonAsync("/api/playlist/tracks", new { trackId = 2 });
        var playlist = await client.GetFromJsonAsync<List<TrackDto>>("/api/playlist");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Single(playlist!);
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("{\"trackId\":null}")]
    [InlineData("{\"trackId\":\"abc\"}")]
    [InlineData("not json")]
    public async Task Post_missing_or_invalid_track_id_returns_400(string body)
    {
        using var factory = NewFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsync("/api/playlist/tracks", Json(body));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
