export type RecordingScript = {
  id: string;
  title: string;
  hint: string;
  text: string;
};

/**
 * Ten short reads for zero-shot cloning. Chatterbox only keeps about ten
 * seconds of speaking style, so each clip starts with real speech and the
 * mixer pulls a slice from every file into that window.
 */
export const RECORDING_SCRIPTS: RecordingScript[] = [
  {
    id: "plain-me",
    title: "Plain you",
    hint: "Talk like you actually talk. Do not put on a presenter voice.",
    text: "Hey, I'm Jackson Wheeler. I live in Kansas, I go to school, and this is just my normal voice. Nothing fancy. If I speed up or stumble a little, that is still me. Leave it in.",
  },
  {
    id: "everyday",
    title: "Everyday",
    hint: "Same energy as texting someone in the other room.",
    text: "I walked in the house, dropped my bag, and forgot why I even came in here. Then I remembered I was supposed to eat something. That is pretty much the whole story. Anyway. Whatever. I am recording this so a computer can sound like me.",
  },
  {
    id: "consonants",
    title: "Hard consonants",
    hint: "Keep it casual, but do not swallow the ends of words.",
    text: "The truck stopped at the bridge. She asked for six extra texts. Strengths. Clothes. Sixth. Judged. Watched. I know that list sounds weird. I am just hitting the hard sounds so they stick.",
  },
  {
    id: "numbers",
    title: "Numbers",
    hint: "Say the numbers the way you would say them out loud, not digit by digit unless it feels natural.",
    text: "It is September fourteenth, two thousand twenty six. Call it three forty five, not fifteen forty five. I need twelve, not twenty. Five five five, zero one four two. Forty percent. Eighteen seventy five.",
  },
  {
    id: "questions",
    title: "Questions",
    hint: "Let the questions actually go up at the end.",
    text: "Wait, what did you mean by that? Are we doing this now or later? Because I can do it, I just need to know. Okay? Cool. Then let's actually do it, and not talk about doing it.",
  },
  {
    id: "story",
    title: "Little story",
    hint: "Relax. Let it rise and fall.",
    text: "I was not expecting much. The weather was bad, the drive felt long, and then the clouds broke for like one minute and the whole field lit up. I have thought about that minute more than the rest of the trip. That is the whole thing.",
  },
  {
    id: "slow",
    title: "Slow",
    hint: "Slower than feels normal. Pauses are fine. Restarts are fine.",
    text: "I am going to talk slower on this one. One thought at a time. Quiet room. Coffee. Then everybody is moving like they were never still. If I restart a word, just keep going. Do not start the whole clip over.",
  },
  {
    id: "flow",
    title: "Longer thought",
    hint: "One breath at a time. Do not rush the middle.",
    text: "There is a stretch in the middle of learning something where you know enough to hear your mistakes but not enough to fix them. Most people quit there. The people who do not just keep showing up until it starts working again.",
  },
  {
    id: "names",
    title: "Names",
    hint: "Say the names clean, then keep talking.",
    text: "Jackson Wheeler. Wichita. Newton. Riley. French class. Homework due Friday. Jackson. Wheeler. Kansas. Say my name like I say it, not like a GPS.",
  },
  {
    id: "french-letters",
    title: "French letters",
    hint: "Your voice, not a French accent. These are the letter names.",
    text: "Ah. Bay. Say. Day. Euh. Eff. Zhay. Ash. Ee. Zhee. Kah. Ell. Em. Enn. Oh. Pay. Ku. Air. Ess. Tay. Oo. Vay. Double vay. Eeks. Ee grek. Zed. Ça s'écrit. Zhee. Ah. Say. Kah. Ess. Oh. Enn. Double vay. Ash. Euh. Euh. Ell. Euh. Air.",
  },
];

export function getRecordingScript(index: number) {
  const scripts = RECORDING_SCRIPTS;
  return scripts[((index % scripts.length) + scripts.length) % scripts.length]!;
}

export function formatAllRecordingScripts() {
  return RECORDING_SCRIPTS.map((script, index) => {
    return `${index + 1}. ${script.title}\n${script.hint}\n${script.text}`;
  }).join("\n\n");
}
