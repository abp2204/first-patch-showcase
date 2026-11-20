// Reproduced from First Patch, source revision b69b982. See README for provenance.
(() => {
const { artistQuestions, venueQuestions, answerLabel, buildPatchSummary, visibleQuestions, } = FirstPatch.questions;
function matchProfiles(artist, venue, createdAt = new Date().toISOString()) {
    if (artist.role !== "artist" || venue.role !== "venue")
        throw new Error("Choose one artist and one venue.");
    if (artist.status !== "complete" || venue.status !== "complete")
        throw new Error("Complete both questionnaires before matching.");
    const active = (p) => Object.fromEntries(visibleQuestions(p.role, p.answers).map((q) => [q.id, p.answers[q.id]]));
    const a = active(artist), v = active(venue), findings = [];
    const values = (x) => Array.isArray(x) ? x.map(String) : x ? [String(x)] : [];
    const label = (role, id) => {
        const q = (role === "artist" ? artistQuestions : venueQuestions).find((q) => q.id === id);
        return q ? answerLabel(q, (role === "artist" ? a : v)[id]) : "Not answered";
    };
    const add = (f) => findings.push(f);
    const format = {
        solo: "solo",
        duo: "solo",
        band: "bands",
        ensemble: "large",
        dj_electronic: "dj",
        mobile: "mobile",
        performance: "performance",
    };
    const compatible = values(v.formats).includes(format[String(a.act_type)]);
    add({
        id: "format",
        title: "Show format",
        status: compatible ? "covered" : "confirm",
        evidence: `Artist: ${label("artist", "act_type")}. Room: ${label("venue", "formats")}.`,
        action: compatible
            ? "This format is in the room’s stated programming."
            : "Confirm the room can support this format.",
        owner: "Venue",
    });
    const pa = String(v.pa_setup);
    add({
        id: "pa",
        title: "PA and production",
        status: ["installed_full", "powered_mixer"].includes(pa)
            ? "covered"
            : ["none", "artist_brings"].includes(pa)
                ? "gap"
                : "confirm",
        evidence: label("venue", "pa_setup"),
        action: ["installed_full", "powered_mixer"].includes(pa)
            ? "House PA is listed; confirm its suitability and routing for this act."
            : "Agree who supplies the PA and production before confirming the show.",
        owner: "Both",
    });
    const derived = buildPatchSummary("artist", a), needed = Number(derived.facts.find((f) => f.label === "Estimated inputs")?.value) || 0;
    const ranges = {
        "1_4": [1, 4],
        "5_8": [5, 8],
        "9_16": [9, 16],
        "17_24": [17, 24],
        "25_plus": [25, Infinity],
    };
    const range = ranges[String(v.input_count)], roles = values(a.roles);
    const uncertain = roles.some((r) => ["horns", "strings", "percussion", "other"].includes(r)) ||
        Object.values(a).some((x) => values(x).includes("not_sure")) ||
        a.vocal_count === "5+" ||
        a.drum_feed === "own_mics" ||
        ["hybrid", "shared"].includes(String(a.drum_type));
    const inputStatus = !range || !needed || uncertain
        ? "confirm"
        : range[1] < needed
            ? "gap"
            : range[0] >= needed
                ? "covered"
                : "confirm";
    add({
        id: "inputs",
        title: "Console inputs",
        status: inputStatus,
        evidence: `Estimated artist inputs: ${needed || "unknown"}. House input range: ${label("venue", "input_count")}. Counts are inferred from the questionnaire, not a final input list.`,
        action: inputStatus === "gap"
            ? "Provide more inputs or agree a smaller input list."
            : "Confirm the exact channel list, including any extra players and stereo feeds.",
        owner: "Both",
    });
    const monitorRanges = {
        no_monitors: [0, 0],
        one_mix: [1, 1],
        two_mixes: [2, 2],
        three_four: [3, 4],
        five_plus: [5, Infinity],
    };
    const mixChoices = values(v.monitor_capacity).filter((x) => monitorRanges[x]);
    const mixes = Number(a.monitor_mix_count), available = mixChoices.length === 1 ? monitorRanges[mixChoices[0]] : undefined, monitor = values(a.monitoring);
    const noMonitors = monitor.includes("none");
    const monitorStatus = noMonitors
        ? "covered"
        : monitor.includes("own_monitor_rig") ||
            monitor.some((x) => x.includes("iem")) ||
            !available ||
            !mixes
            ? "confirm"
            : available[1] < mixes
                ? "gap"
                : available[0] >= mixes
                    ? "covered"
                    : "confirm";
    add({
        id: "monitors",
        title: "Monitor mixes",
        status: monitorStatus,
        evidence: `Artist: ${label("artist", "monitoring")}; ${label("artist", "monitor_mix_count")}. Room: ${label("venue", "monitor_capacity")}.`,
        action: noMonitors
            ? "No monitor supply requested."
            : monitorStatus === "gap"
                ? "Add monitor capacity or agree shared mixes."
                : "Confirm outputs, speakers/packs, and the monitor patch.",
        owner: "Both",
    });
    const stock = values(v.inventory), required = new Set(values(a.venue_should_supply).filter((x) => !["nothing", "not_sure"].includes(x)));
    const inferred = {};
    const infer = (item, why) => {
        required.add(item);
        (inferred[item] ||= []).push(why);
    };
    if (a.acoustic_guitar_path === "quarter")
        infer("dis", "Acoustic guitar: 1 DI");
    if (a.bass_path === "venue_di")
        infer("dis", "Bass: 1 DI");
    if (a.electric_guitar_path === "direct_quarter")
        infer("dis", "Guitar direct output: 1 DI");
    if (a.keys_path === "mono_quarter")
        infer("dis", "Keys: 1 DI");
    if (a.keys_path === "stereo_quarter")
        infer("dis", "Stereo keys: 2 DIs");
    if (["quarter", "rca"].includes(String(a.dj_path)))
        infer("dis", "Playback/DJ stereo feed: 2 compatible conversion channels");
    if (a.electric_guitar_path === "mic_amp")
        infer("instrument_mics", "Guitar amp microphone");
    if (a.acoustic_guitar_path === "mic_only")
        infer("instrument_mics", "Acoustic guitar microphone");
    if (a.bass_path === "mic_cab")
        infer("instrument_mics", "Bass cabinet microphone");
    if (["full", "four", "kick_only"].includes(String(a.drum_feed)))
        infer("instrument_mics", "Drum microphones: " + label("artist", "drum_feed"));
    if (a.drum_type === "shared")
        infer("drum_kit", "Artist normally shares a house kit");
    if (a.keys_path === "acoustic_piano")
        infer("piano", "Artist needs an acoustic piano");
    if (a.dj_path === "venue_mixer")
        infer("dj_mixer", "Artist uses the house DJ mixer");
    for (const item of required) {
        const q = artistQuestions.find((q) => q.id === "venue_should_supply"), title = q.options?.find((o) => o.value === item)?.label ||
            (item === "dj_mixer" ? "DJ mixer / booth" : item);
        const listed = stock.includes(item), unknown = stock.includes("varies") ||
            (["power", "keyboard_stand", "dj_table"].includes(item) && !listed);
        add({
            id: `gear-${item}`,
            title,
            status: listed ? "confirm" : unknown ? "confirm" : "gap",
            evidence: `Artist need: ${title}.${inferred[item] ? " " + inferred[item].join("; ") + "." : ""} ${listed ? "Venue lists this item, but quantities and models are not recorded." : unknown ? "The questionnaire does not establish the exact supply." : "Not listed in the venue inventory."}`,
            action: listed
                ? "Confirm quantity, model, and availability for this date."
                : "Assign a supplier or agree an alternative.",
            owner: listed ? "Venue" : "Both",
        });
    }
    add({
        id: "stage",
        title: "Stage footprint and access",
        status: "confirm",
        evidence: `Act: ${label("artist", "member_count")}; ${label("artist", "stage_shape")}. Room: ${label("venue", "stage_size")}; ${label("venue", "stage_type")}. Load-in: ${label("venue", "load_in")}.`,
        action: "Exchange exact dimensions, positions, access needs, and arrival instructions.",
        owner: "Both",
    });
    add({
        id: "limits",
        title: "House limits and show contact",
        status: "confirm",
        evidence: `House: ${label("venue", "sound_limits")}. Production responsibility: ${label("venue", "engineer")}. Act constraints: ${label("artist", "constraints")}.`,
        action: "Agree curfew, sound limits, arrival time, and the production contact before show day.",
        owner: "Venue",
    });
    const stage = roles.map((r) => ({
        lead_vocal: "Lead vocal at downstage center",
        backing_vocal: "Backing vocals at performer positions",
        drums: "Drums upstage; confirm riser and footprint",
        bass: "Bass beside rhythm section; confirm amp/DI",
        electric_guitar: "Guitar to one side; confirm amp direction",
        acoustic_guitar: "Acoustic guitar with vocal position; confirm DI/mic",
        keys: "Keys at stage side; confirm stereo outputs",
        dj: "DJ table with power and clear audience sightline",
        playback: "Playback at an accessible control position",
    })[r] || `${r.replaceAll("_", " ")}: agree position with the artist`);
    return {
        version: 1,
        artist: {
            id: artist.id,
            name: artist.recipientName,
            revision: artist.revision,
        },
        venue: {
            id: venue.id,
            name: venue.recipientName,
            revision: venue.revision,
        },
        createdAt,
        findings,
        covered: findings.filter((f) => f.status === "covered").length,
        gaps: findings.filter((f) => f.status === "gap").length,
        confirm: findings.filter((f) => f.status === "confirm").length,
        stage,
        changeover: label("artist", "changeover_time"),
        notes: { artist: String(a.notes || ""), venue: String(v.notes || "") },
    };
}

  globalThis.FirstPatch ??= {};
  FirstPatch.match = { matchProfiles };
})();
