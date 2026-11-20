// Fictional technical profiles used for every public demo state.
(() => {
  const artist = {
    id: 1,
    role: "artist",
    recipientName: "Lake Signal",
    revision: 1,
    status: "complete",
    answers: {
      artist_name: "Lake Signal",
      contact_email: "artist@example.com",
      act_type: "band",
      member_count: "3-4",
      roles: ["lead_vocal", "electric_guitar", "bass", "keys", "drums"],
      vocal_count: "2",
      electric_guitar_path: "mic_amp",
      bass_path: "venue_di",
      keys_path: "stereo_quarter",
      drum_type: "acoustic",
      drum_feed: "four",
      monitoring: ["wedges"],
      monitor_mix_count: "3",
      venue_should_supply: ["vocal_mics", "instrument_mics", "dis", "stands"],
      stage_shape: "standard",
      changeover_time: "20_30",
      constraints: ["none"],
      notes: "Four musicians. The singer plays keys.",
    },
  };
  const venue = {
    id: 2,
    role: "venue",
    recipientName: "Union Room",
    revision: 1,
    status: "complete",
    answers: {
      venue_name: "Union Room",
      contact_email: "venue@example.com",
      venue_type: "club",
      room_name: "Main room",
      capacity: "150_299",
      formats: ["bands"],
      stage_type: "raised_fixed",
      stage_size: "medium",
      pa_setup: "installed_full",
      console_type: "digital",
      input_count: "17_24",
      monitor_capacity: ["two_mixes"],
      inventory: ["vocal_mics", "instrument_mics", "stands"],
      engineer: "house_engineer",
      load_in: "easy",
      show_shape: "two_act",
      sound_limits: ["none"],
      compensation: "guarantee",
      notes: "Confirm microphone and stand quantities with house production.",
    },
  };
  function reportFor(capacity = "two_mixes", listDIs = false) {
    const answers = {
      ...venue.answers,
      monitor_capacity: [capacity],
      inventory: [...venue.answers.inventory],
    };
    if (listDIs) answers.inventory.push("dis");
    return FirstPatch.match.matchProfiles(
      artist,
      { ...venue, answers },
      "2026-01-01T00:00:00.000Z",
    );
  }
  FirstPatch.fixture = { artist, venue, reportFor };
})();
