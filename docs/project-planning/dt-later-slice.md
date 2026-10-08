# Music Catalog later slice — session-only dismiss feedback

This page records one small idea selected from the Music Catalog Design Thinking (DT) exploration as a candidate for later delegation to Copilot cloud agent at Level 5. It is proposed only: not implemented, not validated beyond a single simulated conversation, and it does not change the shared Level 3 playlist scope.

## Problem

A casual listener browsing recommendations has no way to say a suggested track is not relevant. Without that signal, the same unwanted track can keep resurfacing, which undermines trust in the recommendation list.

## User value

A casual listener can mark a recommended track "not relevant" and trust that it will not reappear for the rest of their session, reducing the effort of re-skipping the same track.

## Chosen scope

A session-only dismiss interaction on the existing recommendations/catalog view:

- A dismiss control on each track.
- A lightweight inline confirm step before the track is actually removed (not a full-page modal).
- Client-side, in-memory state only, consistent with the existing no-database, no-persistence constraints.

## Observable acceptance criteria

- Each track in the catalog or recommendations view has a visible, labelled dismiss control.
- Activating dismiss shows an inline confirm step before the track is hidden.
- Confirming removes the track immediately, with no noticeable delay.
- A dismissed track does not reappear for the remainder of the browser session.
- Reloading the page may reset the dismissed set; no cross-session persistence is required.

## Exclusions

- No genre or mood-based filtering.
- No cross-session or server-side memory of dismissed tracks.
- No backend persistence or database changes.
- No "undo" affordance.
- No change to the shared Level 3 playlist contract (browse, add to one in-memory playlist, existing endpoints, existing empty-state and duplicate handling).

## Assumptions

- The dismiss and confirm-step preference, and the expectation of instant feedback, came from a single simulated conversation and have not been tested with a real build or multiple participants.
- Casual listeners are assumed to value trust in the recommendation list over the ability to undo a dismissal; this has not been confirmed.

## Dependencies

- Builds on the existing in-memory track catalog and front-end view; no new data fields or external services are required.
- Depends on the shared Level 3 playlist slice remaining stable, since this is an additive, separate interaction on the same front end.

## Rationale

Of the ideas explored, this one had the clearest and most consistent signal from the exploration and needs no new data (such as a genre lookup) that the current catalog does not already support. It is the smallest change that preserves the existing in-memory, no-persistence constraints.

## Status

Proposed candidate for Level 5 Copilot cloud agent delegation only. Not implemented. Not validated beyond a single simulated conversation. No issue has been created and no requirements-builder workflow has been invoked for this idea.
