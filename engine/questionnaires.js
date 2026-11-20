// Reproduced from First Patch, source revision b69b982. See README for provenance.
(() => {
const actRoles = [
    { value: "lead_vocal", label: "Lead vocals", mark: "VOX" },
    { value: "backing_vocal", label: "Backing vocals", mark: "B-V" },
    { value: "electric_guitar", label: "Electric guitar", mark: "GTR" },
    { value: "acoustic_guitar", label: "Acoustic guitar", mark: "AC" },
    { value: "bass", label: "Bass", mark: "BASS" },
    { value: "drums", label: "Drum kit", mark: "KIT" },
    { value: "percussion", label: "Percussion", mark: "PERC" },
    { value: "keys", label: "Keys / piano / synth", mark: "KEY" },
    { value: "horns", label: "Horns / woodwinds", mark: "HORN" },
    { value: "strings", label: "Strings", mark: "STR" },
    { value: "dj", label: "DJ controller / decks", mark: "DJ" },
    { value: "playback", label: "Laptop / playback", mark: "PLAY" },
    { value: "performance", label: "Performance / spoken word / movement", mark: "LIVE" },
    { value: "other", label: "Something else", mark: "+" },
];
const artistQuestions = [
    {
        id: "act_type",
        section: "Shape",
        prompt: "What kind of act are you bringing into the room?",
        help: "Pick the closest match. We’ll only ask the questions that apply to that setup.",
        type: "single",
        required: true,
        options: [
            { value: "solo", label: "Solo performer", detail: "One person, with or without instruments", mark: "1" },
            { value: "duo", label: "Duo", detail: "Two performers", mark: "2" },
            { value: "band", label: "Band", detail: "A typical amplified group", mark: "BAND" },
            { value: "ensemble", label: "Large ensemble", detail: "Seven or more performers", mark: "7+" },
            { value: "dj_electronic", label: "DJ / electronic act", detail: "Decks, controller, laptop, or electronic rig", mark: "DJ" },
            { value: "mobile", label: "Mobile / marching act", detail: "Not fixed to a conventional stage", mark: "MOVE" },
            { value: "performance", label: "Performance act", detail: "Drag, dance, spoken word, comedy, or mixed format", mark: "LIVE" },
            { value: "other", label: "Something else", detail: "We’ll keep the rest flexible", mark: "+" },
        ],
    },
    {
        id: "artist_name",
        section: "Identity",
        prompt: "What should we call this patch?",
        help: "Use the artist or act name a venue will recognize.",
        type: "text",
        required: true,
        placeholder: "Artist or act name",
    },
    {
        id: "contact_email",
        section: "Identity",
        prompt: "Where should the private edit link go?",
        help: "We’ll use this only for this patch and show-related follow-ups.",
        type: "email",
        required: true,
        placeholder: "you@example.com",
    },
    {
        id: "member_count",
        section: "Shape",
        prompt: "How many people are in this version of the act?",
        help: "Choose the lineup for this patch. You can create another version later.",
        type: "single",
        required: true,
        options: [
            { value: "1", label: "1", detail: "Solo" },
            { value: "2", label: "2", detail: "Duo" },
            { value: "3-4", label: "3–4", detail: "Small band" },
            { value: "5-6", label: "5–6", detail: "Full band" },
            { value: "7-12", label: "7–12", detail: "Large ensemble" },
            { value: "13+", label: "13+", detail: "Orchestra / marching / community group" },
            { value: "varies", label: "It changes", detail: "Rotating or flexible lineup" },
        ],
    },
    {
        id: "roles",
        section: "Sources",
        prompt: "What will make sound during the set?",
        help: "Choose everything in this version. This is easier to change later than a traditional input list.",
        type: "multi",
        required: true,
        options: actRoles,
    },
    {
        id: "vocal_count",
        section: "Sources",
        prompt: "How many people need a vocal microphone?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "roles", includes: ["lead_vocal", "backing_vocal"] }],
        options: ["1", "2", "3", "4", "5+", "not_sure"].map((value) => ({
            value,
            label: value === "not_sure" ? "Not sure yet" : value,
        })),
    },
    {
        id: "electric_guitar_path",
        section: "Connections",
        prompt: "How does the electric guitar normally reach the PA?",
        help: "Choose what happens at most shows. We’ll translate it into the likely mic, DI, or input.",
        type: "single",
        required: true,
        visibleWhen: [{ id: "roles", includes: ["electric_guitar"] }],
        options: [
            { value: "mic_amp", label: "Mic in front of an amp", detail: "The venue supplies or places the microphone", mark: "MIC" },
            { value: "amp_xlr", label: "Amp has an XLR output", detail: "One XLR line goes to the venue", mark: "XLR" },
            { value: "modeler_xlr", label: "Pedalboard / modeler sends XLR", detail: "No guitar amp needs to be miked", mark: "FX" },
            { value: "direct_quarter", label: "A ¼-inch cable goes direct", detail: "The venue will probably need a DI", mark: "¼" },
            { value: "artist_handles", label: "We bring the full connection", detail: "Mic or DI included", mark: "OWN" },
            { value: "not_sure", label: "Not sure", detail: "Flag it for confirmation", mark: "?" },
        ],
    },
    {
        id: "acoustic_guitar_path",
        section: "Connections",
        prompt: "How does the acoustic guitar normally connect?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "roles", includes: ["acoustic_guitar"] }],
        options: [
            { value: "quarter", label: "¼-inch cable", detail: "Usually needs a venue DI", mark: "¼" },
            { value: "xlr", label: "XLR output", detail: "Connects directly to a venue input", mark: "XLR" },
            { value: "own_di", label: "We bring a DI / preamp", detail: "The act provides the conversion", mark: "OWN" },
            { value: "mic_only", label: "Microphone only", detail: "No pickup output", mark: "MIC" },
            { value: "not_sure", label: "Not sure", detail: "Flag it for confirmation", mark: "?" },
        ],
    },
    {
        id: "bass_path",
        section: "Connections",
        prompt: "How does bass normally reach the PA?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "roles", includes: ["bass"] }],
        options: [
            { value: "amp_xlr", label: "XLR from the bass amp", mark: "XLR" },
            { value: "own_di", label: "We bring a DI / preamp", mark: "OWN" },
            { value: "venue_di", label: "We need the venue’s DI", mark: "DI" },
            { value: "mic_cab", label: "Mic the bass cabinet", mark: "MIC" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "drum_type",
        section: "Connections",
        prompt: "Which drum setup is closest?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "roles", includes: ["drums"] }],
        options: [
            { value: "acoustic", label: "Acoustic kit", detail: "Traditional drum kit", mark: "KIT" },
            { value: "electronic", label: "Electronic kit", detail: "Stereo or mono outputs", mark: "E-KIT" },
            { value: "hybrid", label: "Hybrid kit", detail: "Acoustic drums plus pads / tracks", mark: "HYB" },
            { value: "shared", label: "We normally share the house kit", detail: "Cymbals / snare may still travel", mark: "SHR" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "drum_feed",
        section: "Connections",
        prompt: "How much of the kit normally goes through the PA?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "drum_type", equals: ["acoustic", "hybrid", "shared"] }],
        options: [
            { value: "full", label: "Full kit", detail: "Kick, snare, toms, overheads", mark: "7+" },
            { value: "four", label: "Four-mic setup", detail: "Kick, snare, two overheads", mark: "4" },
            { value: "kick_only", label: "Kick only", detail: "Minimal room reinforcement", mark: "1" },
            { value: "none", label: "Usually unmiked", detail: "Room sound carries the kit", mark: "0" },
            { value: "own_mics", label: "We bring our own drum mics", mark: "OWN" },
            { value: "not_sure", label: "The venue usually decides", mark: "?" },
        ],
    },
    {
        id: "keys_path",
        section: "Connections",
        prompt: "What comes out of the keyboard rig?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "roles", includes: ["keys"] }],
        options: [
            { value: "mono_quarter", label: "One ¼-inch output", detail: "Usually one venue DI", mark: "1×¼" },
            { value: "stereo_quarter", label: "Two ¼-inch outputs", detail: "Usually two venue DIs", mark: "2×¼" },
            { value: "stereo_xlr", label: "Two XLR outputs", detail: "Direct stereo connection", mark: "2×X" },
            { value: "own_mixer", label: "Our mixer sends XLR", detail: "Rig is submixed by the act", mark: "MIX" },
            { value: "acoustic_piano", label: "We need an acoustic piano", detail: "Venue instrument or rental", mark: "PNO" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "dj_path",
        section: "Connections",
        prompt: "What does the DJ / playback rig hand to the venue?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "roles", includes: ["dj", "playback"] }],
        options: [
            { value: "xlr", label: "Left + right XLR", mark: "XLR" },
            { value: "quarter", label: "Left + right ¼-inch", mark: "¼" },
            { value: "rca", label: "Red + white RCA", mark: "RCA" },
            { value: "venue_mixer", label: "We use the venue’s DJ mixer", mark: "HOUSE" },
            { value: "own_mixer", label: "Our mixer handles everything", mark: "OWN" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "monitoring",
        section: "Monitoring",
        prompt: "How does the act normally hear itself?",
        help: "Choose every setup you use in this version.",
        type: "multi",
        required: true,
        options: [
            { value: "wedges", label: "Floor wedges", detail: "Speakers on stage", mark: "WEDGE" },
            { value: "wired_iem", label: "Wired in-ears", detail: "The act brings packs or a wired rig", mark: "IEM" },
            { value: "wireless_iem", label: "Wireless in-ears", detail: "Frequency coordination may matter", mark: "RF" },
            { value: "own_monitor_rig", label: "We bring our own monitor rig", mark: "OWN" },
            { value: "none", label: "No monitors", detail: "Room or acoustic sound is enough", mark: "0" },
            { value: "not_sure", label: "The venue usually decides", mark: "?" },
        ],
    },
    {
        id: "monitor_mix_count",
        section: "Monitoring",
        prompt: "How many different monitor mixes make the show work?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "monitoring", includes: ["wedges", "wired_iem", "wireless_iem", "own_monitor_rig"] }],
        options: ["1", "2", "3", "4", "5+", "not_sure"].map((value) => ({ value, label: value === "not_sure" ? "Not sure" : value })),
    },
    {
        id: "venue_should_supply",
        section: "Shared gear",
        prompt: "What do you normally expect the venue to provide?",
        help: "Choose only the things you would notice if they were missing.",
        type: "multi",
        required: true,
        options: [
            { value: "vocal_mics", label: "Vocal microphones", mark: "MIC" },
            { value: "instrument_mics", label: "Instrument / drum microphones", mark: "MIC+" },
            { value: "dis", label: "DI boxes", mark: "DI" },
            { value: "stands", label: "Microphone stands", mark: "STND" },
            { value: "drum_kit", label: "Drum kit / shells", mark: "KIT" },
            { value: "guitar_amp", label: "Guitar amp", mark: "AMP" },
            { value: "bass_amp", label: "Bass amp", mark: "B-AMP" },
            { value: "keyboard_stand", label: "Keyboard stand", mark: "K-ST" },
            { value: "piano", label: "Piano / house keys", mark: "PNO" },
            { value: "dj_table", label: "DJ table / booth", mark: "TABLE" },
            { value: "power", label: "Power at performance positions", mark: "AC" },
            { value: "nothing", label: "Nothing beyond PA + stage", mark: "0" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "stage_shape",
        section: "Footprint",
        prompt: "Which stage situation feels closest to comfortable?",
        type: "single",
        required: true,
        options: [
            { value: "tight", label: "We can fit almost anywhere", detail: "Compact or mostly stationary", mark: "S" },
            { value: "standard", label: "A normal club stage", detail: "Typical band footprint", mark: "M" },
            { value: "wide", label: "We need extra width or depth", detail: "Large lineup, keys, horns, or movement", mark: "L" },
            { value: "mobile", label: "We move through the room", detail: "Marching, roaming, or audience interaction", mark: "MOVE" },
            { value: "seated", label: "We perform seated", detail: "Chairs, music stands, or acoustic arrangement", mark: "SIT" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "changeover_time",
        section: "Timing",
        prompt: "From an empty stage, how long until you can line check?",
        type: "single",
        required: true,
        options: [
            { value: "under_10", label: "Under 10 minutes", mark: "<10" },
            { value: "10_20", label: "10–20 minutes", mark: "20" },
            { value: "20_30", label: "20–30 minutes", mark: "30" },
            { value: "30_plus", label: "More than 30 minutes", mark: "30+" },
            { value: "not_sure", label: "It depends", mark: "?" },
        ],
    },
    {
        id: "constraints",
        section: "Exceptions",
        prompt: "Anything the room should know before it says yes?",
        type: "multi",
        options: [
            { value: "quiet_stage", label: "We need a quiet stage", mark: "LOW" },
            { value: "high_power", label: "We draw a lot of power", mark: "AC+" },
            { value: "wireless", label: "We use wireless systems", mark: "RF" },
            { value: "projection", label: "We need projection / lighting cues", mark: "VIS" },
            { value: "accessibility", label: "We have accessibility needs", mark: "A11Y" },
            { value: "mobile", label: "We are not fixed to the stage", mark: "MOVE" },
            { value: "none", label: "No special constraints", mark: "0" },
            { value: "not_sure", label: "Something may need a conversation", mark: "?" },
        ],
    },
    {
        id: "notes",
        section: "Exceptions",
        prompt: "What did the choices miss?",
        help: "Optional. Use plain language—First Patch can turn it into a follow-up later.",
        type: "text",
        placeholder: "Anything unusual about this setup",
    },
];
const venueQuestions = [
    {
        id: "venue_type",
        section: "Room",
        prompt: "What kind of room are artists walking into?",
        help: "Pick the closest operating reality, not the marketing category.",
        type: "single",
        required: true,
        options: [
            { value: "club", label: "Dedicated music room / club", mark: "CLUB" },
            { value: "bar", label: "Bar / restaurant", mark: "BAR" },
            { value: "cafe", label: "Coffeehouse / quiet room", mark: "CAFÉ" },
            { value: "brewery", label: "Brewery / taproom", mark: "TAP" },
            { value: "event", label: "Event / private-rental space", mark: "EVENT" },
            { value: "community", label: "Community / DIY / nonprofit room", mark: "DIY" },
            { value: "outdoor", label: "Outdoor stage / seasonal series", mark: "OUT" },
            { value: "institution", label: "Campus / institutional venue", mark: "INST" },
            { value: "flex", label: "Several rooms or layouts", mark: "MULTI" },
        ],
    },
    { id: "venue_name", section: "Identity", prompt: "What venue should this patch belong to?", type: "text", required: true, placeholder: "Venue name" },
    { id: "room_name", section: "Identity", prompt: "Which room or layout is this?", help: "Use “Main room” if there is only one.", type: "text", required: true, placeholder: "Main room, patio, Green Room…" },
    { id: "contact_email", section: "Identity", prompt: "Where should the private edit link go?", help: "Use the booking or production inbox that should own this patch.", type: "email", required: true, placeholder: "booking@example.com" },
    {
        id: "capacity",
        section: "Room",
        prompt: "How many people does this layout normally hold?",
        type: "single",
        required: true,
        options: [
            { value: "under_50", label: "Under 50", mark: "<50" },
            { value: "50_99", label: "50–99", mark: "99" },
            { value: "100_149", label: "100–149", mark: "149" },
            { value: "150_299", label: "150–299", mark: "299" },
            { value: "300_599", label: "300–599", mark: "599" },
            { value: "600_plus", label: "600+", mark: "600+" },
            { value: "varies", label: "It changes by layout", mark: "↔" },
        ],
    },
    {
        id: "formats",
        section: "Programming",
        prompt: "What kinds of shows actually happen here?",
        help: "Choose every format the room needs to support.",
        type: "multi",
        required: true,
        options: [
            { value: "solo", label: "Solo / acoustic", mark: "1" },
            { value: "bands", label: "Amplified bands", mark: "BAND" },
            { value: "dj", label: "DJs / electronic acts", mark: "DJ" },
            { value: "large", label: "Large ensembles / horns", mark: "7+" },
            { value: "jazz", label: "Jazz / piano-led groups", mark: "JAZZ" },
            { value: "performance", label: "Drag / burlesque / spoken word", mark: "LIVE" },
            { value: "private", label: "Weddings / private events", mark: "EVENT" },
            { value: "mobile", label: "Mobile / roaming performance", mark: "MOVE" },
        ],
    },
    {
        id: "stage_type",
        section: "Stage",
        prompt: "What does the performance area look like most nights?",
        type: "single",
        required: true,
        options: [
            { value: "raised_fixed", label: "Raised fixed stage", mark: "FIXED" },
            { value: "floor_fixed", label: "Floor-level fixed area", mark: "FLOOR" },
            { value: "portable", label: "Portable / modular stage", mark: "MOD" },
            { value: "cleared_space", label: "We clear a space for the act", mark: "OPEN" },
            { value: "outdoor", label: "Outdoor stage / pad", mark: "OUT" },
            { value: "varies", label: "It changes by event", mark: "↔" },
        ],
    },
    {
        id: "stage_size",
        section: "Stage",
        prompt: "Which footprint is closest to the usable performance area?",
        help: "An estimate is enough for the first patch.",
        type: "single",
        required: true,
        options: [
            { value: "tiny", label: "Tiny", detail: "Solo, duo, or very tight band", mark: "S" },
            { value: "small", label: "Small club stage", detail: "Typical 3–4 piece", mark: "M" },
            { value: "medium", label: "Comfortable full-band stage", detail: "5–7 performers", mark: "L" },
            { value: "large", label: "Large / production stage", detail: "Ensembles and movement", mark: "XL" },
            { value: "varies", label: "It changes by layout", mark: "↔" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "pa_setup",
        section: "Sound",
        prompt: "What sound system is reliably there?",
        type: "single",
        required: true,
        options: [
            { value: "installed_full", label: "Installed full PA", detail: "Mains, console, stage inputs, monitors", mark: "FULL" },
            { value: "powered_mixer", label: "Powered speakers + mixer", detail: "Small-room system", mark: "PA" },
            { value: "vocal_only", label: "Vocal PA only", detail: "Not intended for a full band mix", mark: "VOX" },
            { value: "artist_brings", label: "Artists usually bring the PA", mark: "BYO" },
            { value: "outside_production", label: "Production is hired per event", mark: "RENT" },
            { value: "none", label: "No house PA", mark: "0" },
            { value: "varies", label: "It changes by event", mark: "↔" },
        ],
    },
    {
        id: "console_type",
        section: "Sound",
        prompt: "How is the room normally mixed?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "pa_setup", equals: ["installed_full", "powered_mixer", "vocal_only", "outside_production", "varies"] }],
        options: [
            { value: "digital", label: "Digital console", mark: "DIG" },
            { value: "analog", label: "Analog mixer", mark: "ANA" },
            { value: "compact", label: "Compact / rack mixer", mark: "RACK" },
            { value: "production", label: "Outside production decides", mark: "RENT" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "input_count",
        section: "Sound",
        prompt: "How many inputs can an act count on?",
        type: "single",
        required: true,
        visibleWhen: [{ id: "pa_setup", equals: ["installed_full", "powered_mixer", "vocal_only", "outside_production", "varies"] }],
        options: [
            { value: "1_4", label: "1–4", mark: "4" },
            { value: "5_8", label: "5–8", mark: "8" },
            { value: "9_16", label: "9–16", mark: "16" },
            { value: "17_24", label: "17–24", mark: "24" },
            { value: "25_plus", label: "25+", mark: "25+" },
            { value: "varies", label: "It depends on production", mark: "↔" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "monitor_capacity",
        section: "Sound",
        prompt: "What can performers hear themselves through?",
        type: "multi",
        required: true,
        options: [
            { value: "no_monitors", label: "No stage monitors", mark: "0" },
            { value: "one_mix", label: "One shared wedge mix", mark: "1" },
            { value: "two_mixes", label: "Two monitor mixes", mark: "2" },
            { value: "three_four", label: "Three or four mixes", mark: "4" },
            { value: "five_plus", label: "Five or more mixes", mark: "5+" },
            { value: "iem_support", label: "Artist IEM rigs can connect", mark: "IEM" },
            { value: "varies", label: "It changes by event", mark: "↔" },
            { value: "not_sure", label: "Not sure", mark: "?" },
        ],
    },
    {
        id: "inventory",
        section: "House gear",
        prompt: "What can an artist reasonably expect the house to provide?",
        help: "Choose gear that is normally available—not something that can sometimes be borrowed.",
        type: "multi",
        required: true,
        options: [
            { value: "vocal_mics", label: "Vocal microphones", mark: "MIC" },
            { value: "instrument_mics", label: "Instrument / drum microphones", mark: "MIC+" },
            { value: "dis", label: "DI boxes", mark: "DI" },
            { value: "stands", label: "Microphone stands", mark: "STND" },
            { value: "drum_kit", label: "House drum kit / shells", mark: "KIT" },
            { value: "guitar_amp", label: "Guitar amp", mark: "AMP" },
            { value: "bass_amp", label: "Bass amp", mark: "B-AMP" },
            { value: "piano", label: "Piano / house keys", mark: "PNO" },
            { value: "dj_mixer", label: "DJ mixer / booth", mark: "DJ" },
            { value: "music_stands", label: "Music stands / chairs", mark: "SEAT" },
            { value: "nothing", label: "Nothing beyond the PA", mark: "0" },
            { value: "varies", label: "Inventory changes", mark: "↔" },
        ],
    },
    {
        id: "engineer",
        section: "People",
        prompt: "Who normally owns soundcheck and the show mix?",
        type: "single",
        required: true,
        options: [
            { value: "house_engineer", label: "House engineer", mark: "HOUSE" },
            { value: "venue_staff", label: "Venue staff, but not a dedicated engineer", mark: "STAFF" },
            { value: "artist_engineer", label: "Artist brings an engineer", mark: "ARTIST" },
            { value: "promoter", label: "Promoter / production vendor", mark: "PROD" },
            { value: "self_service", label: "Artists run the system themselves", mark: "SELF" },
            { value: "varies", label: "It changes by show", mark: "↔" },
        ],
    },
    {
        id: "load_in",
        section: "Arrival",
        prompt: "What does load-in usually feel like?",
        type: "single",
        required: true,
        options: [
            { value: "easy", label: "Direct and easy", detail: "Nearby door, short carry, few obstacles", mark: "EASY" },
            { value: "stairs", label: "Stairs are unavoidable", mark: "STAIR" },
            { value: "long_carry", label: "Long carry or limited parking", mark: "CARRY" },
            { value: "scheduled", label: "Access must be scheduled", mark: "TIME" },
            { value: "public_space", label: "Shared or public access route", mark: "SHARE" },
            { value: "varies", label: "It changes by layout", mark: "↔" },
        ],
    },
    {
        id: "show_shape",
        section: "Timing",
        prompt: "What does a normal music night look like?",
        type: "single",
        required: true,
        options: [
            { value: "one_act", label: "One act / one setup", mark: "1" },
            { value: "two_act", label: "Two acts", mark: "2" },
            { value: "three_four", label: "Three or four acts", mark: "4" },
            { value: "five_plus", label: "Five or more acts", mark: "5+" },
            { value: "continuous", label: "Continuous / recurring residency", mark: "LOOP" },
            { value: "private", label: "Private-event timeline", mark: "EVENT" },
            { value: "varies", label: "No standard format", mark: "↔" },
        ],
    },
    {
        id: "sound_limits",
        section: "Constraints",
        prompt: "Which limits can change whether an act fits?",
        type: "multi",
        required: true,
        options: [
            { value: "quiet", label: "Quiet-room expectations", mark: "LOW" },
            { value: "spl", label: "Measured sound limit", mark: "SPL" },
            { value: "curfew", label: "Hard curfew / end time", mark: "TIME" },
            { value: "neighbors", label: "Neighbors / shared building", mark: "NEAR" },
            { value: "power", label: "Limited power", mark: "AC" },
            { value: "weather", label: "Weather / outdoor exposure", mark: "WX" },
            { value: "all_ages", label: "All-ages / sober-space rules", mark: "AA" },
            { value: "none", label: "No unusual limits", mark: "0" },
            { value: "varies", label: "It changes by event", mark: "↔" },
        ],
    },
    {
        id: "compensation",
        section: "Terms",
        prompt: "How are performers most often paid?",
        type: "single",
        required: true,
        options: [
            { value: "door", label: "Door split", mark: "DOOR" },
            { value: "guarantee", label: "Guarantee / flat fee", mark: "FLAT" },
            { value: "guarantee_plus", label: "Guarantee plus percentage", mark: "+%" },
            { value: "tips", label: "Tips / donation", mark: "TIP" },
            { value: "rental", label: "Room rental / private-event contract", mark: "RENT" },
            { value: "varies", label: "It changes by event", mark: "↔" },
            { value: "not_applicable", label: "Not applicable", mark: "—" },
        ],
    },
    {
        id: "notes",
        section: "Exceptions",
        prompt: "What did the choices miss?",
        help: "Optional. Add a curfew, parking instruction, room-specific rule, or gear detail.",
        type: "text",
        placeholder: "Anything artists should know before load-in",
    },
];
const questionnaires = {
    artist: artistQuestions,
    venue: venueQuestions,
};
function arrayValue(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
}
function questionIsVisible(question, answers) {
    if (!question.visibleWhen?.length)
        return true;
    return question.visibleWhen.every((rule) => {
        const values = arrayValue(answers[rule.id]);
        if (rule.includes?.length && !rule.includes.some((candidate) => values.includes(candidate)))
            return false;
        if (rule.equals?.length && !rule.equals.some((candidate) => values.includes(candidate)))
            return false;
        return true;
    });
}
function visibleQuestions(role, answers) {
    return questionnaires[role].filter((question) => questionIsVisible(question, answers));
}
function answerIsPresent(question, answers) {
    const value = answers[question.id];
    if (Array.isArray(value))
        return value.length > 0;
    return typeof value === "string" && value.trim().length > 0;
}
function answerLabel(question, value) {
    const values = arrayValue(value);
    if (!question.options)
        return values.join(", ") || "Not answered";
    return values.map((item) => question.options?.find((option) => option.value === item)?.label ?? item).join(", ") || "Not answered";
}
function countForArtist(answers) {
    const roles = arrayValue(answers.roles);
    let inputs = 0;
    const resources = [];
    const flags = [];
    const openItems = [];
    const vocals = String(answers.vocal_count || "0");
    if (/^\d+$/.test(vocals))
        inputs += Number(vocals);
    if (vocals === "5+")
        inputs += 5;
    if (roles.includes("electric_guitar"))
        inputs += 1;
    if (roles.includes("acoustic_guitar"))
        inputs += 1;
    if (roles.includes("bass"))
        inputs += 1;
    if (roles.includes("percussion"))
        inputs += 2;
    if (roles.includes("horns"))
        inputs += 2;
    if (roles.includes("strings"))
        inputs += 2;
    if (roles.includes("keys"))
        inputs += answers.keys_path === "stereo_quarter" || answers.keys_path === "stereo_xlr" || answers.keys_path === "own_mixer" ? 2 : 1;
    if (roles.includes("dj") || roles.includes("playback"))
        inputs += 2;
    if (roles.includes("drums")) {
        const drumFeed = String(answers.drum_feed || answers.drum_type || "");
        inputs += drumFeed === "full" ? 7 : drumFeed === "four" ? 4 : drumFeed === "kick_only" ? 1 : drumFeed === "electronic" ? 2 : 0;
    }
    if (answers.acoustic_guitar_path === "quarter")
        resources.push("1 venue DI for acoustic guitar");
    if (answers.bass_path === "venue_di")
        resources.push("1 venue DI for bass");
    if (answers.keys_path === "mono_quarter")
        resources.push("1 venue DI for keys");
    if (answers.keys_path === "stereo_quarter")
        resources.push("2 venue DIs for keys");
    if (answers.electric_guitar_path === "mic_amp")
        resources.push("1 guitar-amp microphone + stand");
    if (answers.drum_type === "acoustic" || answers.drum_type === "hybrid")
        resources.push("Drum microphone plan to confirm");
    if (arrayValue(answers.monitoring).includes("wireless_iem"))
        flags.push("Wireless IEM frequency coordination");
    if (answers.stage_shape === "mobile")
        flags.push("Mobile / non-stage performance area");
    if (answers.member_count === "varies")
        flags.push("Lineup changes between shows");
    if (arrayValue(answers.constraints).includes("accessibility"))
        flags.push("Accessibility details need a direct check-in");
    if (arrayValue(answers.constraints).includes("projection"))
        flags.push("Projection or lighting cues");
    for (const [key, value] of Object.entries(answers)) {
        if (arrayValue(value).includes("not_sure")) {
            const question = artistQuestions.find((item) => item.id === key);
            if (question)
                openItems.push(question.prompt);
        }
    }
    return { inputs, resources, flags, openItems };
}
function buildPatchSummary(role, answers) {
    answers = Object.fromEntries(visibleQuestions(role, answers).filter(q => answers[q.id] !== undefined).map(q => [q.id, answers[q.id]]));
    if (role === "artist") {
        const derived = countForArtist(answers);
        const roles = arrayValue(answers.roles);
        return {
            title: String(answers.artist_name || "Untitled artist patch"),
            subtitle: `${answerLabel(artistQuestions[0], answers.act_type)} · ${answerLabel(artistQuestions[3], answers.member_count)} performer${answers.member_count === "1" ? "" : "s"}`,
            facts: [
                { label: "Estimated inputs", value: derived.inputs ? `${derived.inputs}` : "Confirm" },
                { label: "Sound sources", value: `${roles.length || 0}` },
                { label: "Monitor mixes", value: String(answers.monitor_mix_count || "Confirm") },
                { label: "Changeover", value: answerLabel(artistQuestions.find((q) => q.id === "changeover_time"), answers.changeover_time) },
            ],
            resources: derived.resources.length ? derived.resources : ["No extra house resources inferred yet"],
            flags: derived.flags.length ? derived.flags : ["No special constraints selected"],
            openItems: derived.openItems,
        };
    }
    const openItems = [];
    for (const [key, value] of Object.entries(answers)) {
        if (arrayValue(value).some((item) => item === "not_sure" || item === "varies")) {
            const question = venueQuestions.find((item) => item.id === key);
            if (question)
                openItems.push(question.prompt);
        }
    }
    return {
        title: String(answers.venue_name || "Untitled venue patch"),
        subtitle: `${String(answers.room_name || "Main room")} · ${answerLabel(venueQuestions[0], answers.venue_type)}`,
        facts: [
            { label: "Capacity", value: answerLabel(venueQuestions.find((q) => q.id === "capacity"), answers.capacity) },
            { label: "House inputs", value: answerLabel(venueQuestions.find((q) => q.id === "input_count"), answers.input_count) },
            { label: "Stage", value: answerLabel(venueQuestions.find((q) => q.id === "stage_size"), answers.stage_size) },
            { label: "Typical bill", value: answerLabel(venueQuestions.find((q) => q.id === "show_shape"), answers.show_shape) },
        ],
        resources: arrayValue(answers.inventory).map((item) => venueQuestions.find((q) => q.id === "inventory")?.options?.find((option) => option.value === item)?.label ?? item),
        flags: arrayValue(answers.sound_limits).map((item) => venueQuestions.find((q) => q.id === "sound_limits")?.options?.find((option) => option.value === item)?.label ?? item),
        openItems,
    };
}
function validatePatch(role, answers) {
    const errors = {};
    for (const question of visibleQuestions(role, answers)) {
        const value = answers[question.id];
        if (value !== undefined && question.options && arrayValue(value).some(v => !question.options.some(o => o.value === v)))
            errors[question.id] = "Choose one of the available options.";
        if (value !== undefined && question.type !== "multi" && typeof value !== "string")
            errors[question.id] = "Choose a single answer.";
        if (question.required && !answerIsPresent(question, answers))
            errors[question.id] = "Choose an answer before continuing.";
        if (question.type === "email" && answerIsPresent(question, answers)) {
            const email = String(answers[question.id]);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                errors[question.id] = "Enter a complete email address.";
        }
    }
    return errors;
}
function displayNameFor(role, answers) {
    return String(answers[role === "artist" ? "artist_name" : "venue_name"] || "").trim();
}
function contactEmailFor(answers) {
    return String(answers.contact_email || "").trim().toLowerCase();
}

  globalThis.FirstPatch ??= {};
  FirstPatch.questions = { artistQuestions, venueQuestions, questionnaires, questionIsVisible, visibleQuestions, answerIsPresent, answerLabel, buildPatchSummary, validatePatch, displayNameFor, contactEmailFor };
})();
