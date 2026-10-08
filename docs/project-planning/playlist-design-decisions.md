# Music Catalog playlist — design decisions

This page records the outcome of a short Design Thinking (DT) Coach session on the Music Catalog listening experience, and the separate, fixed delivery contract for the Level 3 playlist exercise. It replaces the local DT coaching notes, which are never committed.

## Exploration outcome (sampling, not validated research)

The DT session sampled all nine Design Thinking methods in one short, deliberately scaled-down conversation. No method was completed against its formal exit criteria, and the session did not validate the explored concept. Research and testing steps were a single simulated conversation with one participant role-playing a casual listener, not real stakeholder interviews or user tests.

What the session found, kept at the level of outcome rather than raw notes:

| Category | Summary |
| --- | --- |
| Evidence (single simulated participant) | A casual listener tends to browse recommendations rather than search, uses genre as a way to reshape what is suggested, and expects a dismissed track to be remembered rather than resurfacing. They also expect any dismiss confirmation to feel instant, with no noticeable delay. |
| Assumptions (not tested) | Whether "a listening moment" is best read as mood, activity, or time of day. Whether genre is the right filter lever compared with mood or activity shortcuts. Whether the explored concept reduces listening effort compared with today's recommendation browsing. |
| Planned direction (not built) | A session-only "dismiss" interaction: client-side state only, a lightweight confirm step before a track is hidden, and no change to the existing in-memory, no-database constraints. A genre-chip filter was also explored but needs a new in-memory genre lookup, since the track catalog has no genre field today. |

## Shared Level 3 playlist delivery contract (fixed scope)

This contract is supplied for every attendee's Level 3 exercise. It does not come from the DT exploration above, and the explored concept does not need to be a playlist.

- User-visible capability: browse tracks and add them to one in-memory playlist.
- API endpoints: `GET /api/tracks`, `GET /api/playlist`, and `POST /api/playlist/tracks` with a JSON body containing `trackId`.
- Front-end states: a visible catalog and playlist, with the empty-state text "Your playlist is empty. Add a track to get started."
- Duplicate handling: reject unknown track ids with HTTP 404 and duplicate adds with HTTP 409. Duplicate feedback must be visible and accessible; the UI approach for that feedback is left open for the Level 3 plan gate and is not decided on this page.
- Accessibility: accessible, labelled controls and perceivable status feedback.
- Out of scope: users, authentication, persistence, reorder, remove, search, and playlist creation.

## Candidate later-slice idea

One small idea from the exploration was chosen as a candidate for later delegation, beyond the Level 3 scope above: a session-only dismiss interaction, where a casual listener can mark a track "not relevant" with a lightweight confirm step, and the track stays hidden for the rest of the browser session. It is not implemented and has not been validated beyond the single simulated conversation summarized above.
