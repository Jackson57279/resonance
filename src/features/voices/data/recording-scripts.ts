export type RecordingScript = {
  id: string;
  title: string;
  hint: string;
  text: string;
};

/**
 * Passages to read aloud while recording training clips. Each one is written to
 * cover a wide spread of vowels, consonant clusters and sentence rhythms so the
 * model hears the full range of a voice rather than a handful of repeated sounds.
 */
export const RECORDING_SCRIPTS: RecordingScript[] = [
  {
    id: "neutral-baseline",
    title: "Neutral baseline",
    hint: "Read at your normal speaking pace, as if explaining something to a friend.",
    text: "The quiet harbour town wakes early, long before the ferries start moving. Shopkeepers roll up their shutters, gulls argue over yesterday's bread, and the smell of coffee drifts across the square. By seven o'clock the whole place is awake, and nobody remembers how still it was an hour ago.",
  },
  {
    id: "clear-articulation",
    title: "Clear articulation",
    hint: "Slow down slightly and let every consonant land cleanly.",
    text: "She sells thick slabs of chocolate fudge, six for a dollar, just past the bridge. The judge asked whether the witness had watched the truck swerve, brake, and stop. Crisp, exact speech helps the strange words survive: rhythm, sixth, texts, asked, strengths, clothes.",
  },
  {
    id: "warm-conversational",
    title: "Warm and conversational",
    hint: "Relax into it. Let your voice rise and fall the way it does in conversation.",
    text: "Honestly? I wasn't expecting much. We'd driven four hours, the weather was miserable, and I was ready to turn around. But then the clouds broke, just for a minute, and the whole valley lit up underneath us. I've thought about that minute more than anything else from the trip.",
  },
  {
    id: "measured-narration",
    title: "Measured narration",
    hint: "Audiobook pace: even, unhurried, with clear pauses at the punctuation.",
    text: "In the winter of that year the river froze from bank to bank, something the older residents insisted had not happened since their childhood. Children crossed where boats had passed in summer. The ice held until the first week of March, and then, over a single warm night, it went, carrying the season away with it.",
  },
  {
    id: "numbers-and-names",
    title: "Numbers and names",
    hint: "Read the figures naturally, the way you would say them out loud.",
    text: "The order was placed on March 3rd, 2024, for 1,250 units at $18.75 each. Call me back on 555-0142, extension 6. Our offices in Zurich, Nairobi, and Vancouver open at 9 a.m. local time, which works out to roughly 40 percent overlap on any given Tuesday.",
  },
  {
    id: "expressive-range",
    title: "Expressive range",
    hint: "Lean into the emotion. Let it get loud, quiet, amused, and serious.",
    text: "Wait — you're telling me it worked? The first time? That's incredible. No, listen, I'm serious, do you know how long we've been chasing this? Months. And now it just... works. Okay. Okay. Let's not celebrate yet. Let's run it once more, carefully, and then we can shout about it.",
  },
  {
    id: "question-and-emphasis",
    title: "Questions and emphasis",
    hint: "Let the questions lift at the end and put real weight on the stressed words.",
    text: "What exactly did you mean by that? Not the general idea, the specific thing. Because there's a difference between saying you'll handle it and actually handling it. Are we agreed? Good. Then let's write it down, decide who owns it, and check back on Friday.",
  },
  {
    id: "long-form-flow",
    title: "Long-form flow",
    hint: "Keep an even breath and steady tone all the way through this one.",
    text: "Every craft has a stretch in the middle where progress stops feeling like progress. The beginner's improvements are obvious and quick; the expert's are invisible and slow. In between there is a long plateau where you know enough to hear your own mistakes but not yet enough to fix them. Most people quit there. The ones who don't aren't more talented; they simply keep showing up until the plateau quietly turns back into a slope.",
  },
];

export function getRecordingScript(index: number) {
  const scripts = RECORDING_SCRIPTS;
  return scripts[((index % scripts.length) + scripts.length) % scripts.length]!;
}
