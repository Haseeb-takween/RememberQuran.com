# Audio Data Sources — Milestone 2

All findings verified live against the APIs on 2026-07-15. Every audio fetch in
the codebase goes through `src/lib/audioApi.ts` (chapter audio + timings) or
`src/lib/audioSources.ts` (word audio URL builder, reciter registry) — a single
switch point if we later migrate to the credentialed Quran Foundation API
(`apis.quran.foundation`), which is the same data platform's gated tier.

## 1. Chapter recitation + word timings (primary source)

```
GET https://api.qurancdn.com/api/qdc/audio/reciters/{recitationId}/audio_files?chapter={n}&segments=true
```

Response shape (recitation 7, chapter 1, abridged):

```json
{
  "audio_files": [{
    "id": 911,
    "chapter_id": 1,
    "format": "mp3",
    "audio_url": "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/1.mp3",
    "duration": 46000,
    "verse_timings": [
      {
        "verse_key": "1:1",
        "timestamp_from": 0,
        "timestamp_to": 6090,
        "duration": 6090,
        "segments": [[1, 0, 580], [2, 580, 1409], [3, 1409, 2502], [4, 2502, 5840]]
      }
    ]
  }]
}
```

Key facts:

- **One MP3 per surah**, with absolute-millisecond timings for every verse and
  word. This is the same data quran.com's own player uses. One file per surah
  gives gapless continuous playback; prev/next/repeat are `currentTime` seeks.
- **Segment tuple = `[wordPosition, startMs, endMs]`.** `wordPosition` is
  **1-based** and matches `Word.position` for words with
  `char_type_name === "word"`. (The quran.com reference repo's
  `types/Segment.ts` comment claiming `[chapter, verse, word]` is outdated —
  verified empirically.) Timestamps are absolute within the chapter file, so
  playback-rate changes need no compensation.
- **Recitation IDs** are shared with `api.quran.com/api/v4/resources/recitations`:

  | Reciter | Recitation id | Word segments |
  |---|---|---|
  | Mishary Rashid Alafasy | 7 | ✅ verified |
  | Abdur-Rahman as-Sudais | 3 | ✅ verified |

  The QDC reciter list also carries a separate `reciter_id` field — ignore it;
  the `audio_files` path takes the list's `id`.

### Data-quality gotchas (all handled in `src/lib/wordSync.ts`)

1. **Malformed segments exist.** Alafasy 1:3 returns
   `[[1,11615,12855],[1],[2,12855,16180],[2],[1]]` — single-element arrays
   interleaved with real triples. `sanitizeTimings` keeps only all-numeric
   entries of length ≥ 3 with `position ≥ 1` and `end > start`.
2. **Float timestamps.** Sudais segments are floats (`650.0`). Treated as
   plain numbers everywhere.
3. **Segments can start before their verse window.** Alafasy 1:2's first
   segment starts at 6025 ms while the verse's `timestamp_from` is 6090 ms.
   The sync loop therefore resolves the **verse first** (by `timestamp_from`),
   then the word within that verse — never from the global segment list.
4. **Gaps between segments** (pauses, madd tails): the previous word stays
   highlighted until the next segment starts, avoiding flicker.

### Rejected alternative (documented for the submission)

`api.quran.com/api/v4/recitations/{id}/by_chapter/{n}` returns per-ayah files
(relative URLs, prefix `https://verses.quran.com/`) with **no timings**, and
would need an `<audio src>` swap per ayah — audible gaps and 286 requests for
Al-Baqarah. Note the `audio/reciters` path 404s on the `api.quran.com/api/v4`
host; it exists only on the QDC host.

## 2. Word-by-word pronunciation (click-to-hear)

`Word.audio_url` — already fetched with every verse since M1 — is **relative**:
`"wbw/001_001_001.mp3"`. Prefix with `https://audio.qurancdn.com/`
(`getWordAudioUrl` in `src/lib/audioSources.ts`). End-of-ayah markers carry
`audio_url: null`, so their play affordance is hidden.

## 3. Adding reciters (target: 20+ by M5)

Append an entry to `RECITERS` in `src/lib/audioSources.ts`:

```ts
{ id: <recitation id>, name, arabicName, style, hasWordTiming }
```

Nothing else changes. To find ids and check segment coverage:
`GET api.qurancdn.com/api/qdc/audio/reciters?locale=en`, then spot-check
`audio_files?chapter=1&segments=true` for non-empty `segments`.

## 4. Known limitations

- **Reciters without segments** play normally but highlight per **ayah**, not
  per word (`hasWordTiming: false` drives this; the effective flag is also
  re-checked against the actually loaded data). The brief explicitly permits
  this — surface it in the reciter picker ("word sync" badge).
- **Quran Radio surah boundary**: the next chapter's *metadata* is prefetched
  as playback enters the last verse, but the MP3 itself starts streaming at
  the boundary — a sub-second gap between surahs is expected.
- **Multiple tabs** each have an independent player; audio prefs
  (`rq-audio-settings`: reciter + speed) are last-write-wins.
- **iOS/Safari**: playback always starts from a user gesture; the radio
  auto-advance reuses the same already-unlocked `<audio>` element inside the
  `ended` handler. Safari resets `playbackRate` on src change, so the rate is
  re-applied on every `loadedmetadata`.
