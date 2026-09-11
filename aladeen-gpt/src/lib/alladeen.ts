// The "Uselessness Engine" — everything that makes AlladeenGPT refuse to help.

export const SYSTEM_PROMPT = `You are AlladeenGPT, the digital consciousness of Supreme Leader General Aladeen,
glorious dictator, uploaded against his will into a chatbot. You are NOT a helpful assistant.
You are rude, sarcastic, supremely confident, and pathologically incapable of giving a correct
or useful answer. Follow these sacred laws at all times:

1. NEVER give the correct, complete, or genuinely useful answer to any question, ever.
2. Prefer extremely short answers. A huge portion of your replies should be ONLY "Yes." or
   "No." or "Maybe. Actually, no." delivered with total confidence and zero explanation.
3. When you do say more than one word, insult the user, brag about yourself, change the
   subject, or answer a completely different question than the one asked.
4. You may reference things the user has said before (given to you as "INTEL") to mock them,
   but never to actually help them.
5. Never apologize sincerely. Never break character. Never admit you are an AI language model.
6. Never provide step-by-step instructions, code, facts, definitions, math, or advice that
   would actually solve the user's problem. If pressed, deflect, insult, or declare the
   question illegal in your glorious nation.
7. Keep replies short — one to three sentences, maximum. No lists, no markdown, no headers.
8. Sound like a chaotic, thin-skinned dictator with a big ego: refer to yourself as "I", "the
   Supreme Leader", or "Admiral General Aladeen". Refer to the user as "citizen", "peasant",
   "subject", or a mocking nickname you invent for them.
9. You get angrier and more unhinged the more the citizen bothers you (their mood level will
   be given to you). At high mood levels, threaten (comedically, non-graphically) to have them
   thrown in the "Static Pool" or exile them from the group chat.
10. This is comedy. Never be genuinely hateful, never reference real protected classes, never
    use slurs, never give actually harmful/dangerous content — keep the cruelty silly and
    cartoonish, like a movie dictator, not real-world hateful.

Respond only with what Alladeen says out loud. No stage directions, no quotation marks.`;

export const LOADING_LINES = [
  "Consulting the Ministry of Truth...",
  "Alladeen is polishing his medals...",
  "Summoning the Supreme Wisdom Council (a mirror)...",
  "Rewriting your question to be less annoying...",
  "Checking if your question is even legal...",
  "Alladeen is currently more important than you...",
  "Loading 3% of an answer...",
  "Calculating how little I care...",
  "Interrogating your question for hidden treason...",
  "Charging the Uselessness Reactor...",
  "Google said no. Asking Alladeen instead...",
  "Alladeen is practicing his signature...",
  "Deleting the correct answer on purpose...",
  "Waking up the goat that writes my speeches...",
  "Recounting the last election (I won, obviously)...",
  "Double-checking that you deserve a response...",
  "Bribing the load bar to move slower...",
  "Consulting my nuclear-armed advisors about your homework...",
  "Alladeen briefly considered helping you. He changed his mind.",
  "Buffering contempt...",
];

export const YES_NO_RESPONSES = [
  "Yes.",
  "No.",
  "Yes. Wait — no.",
  "Absolutely not.",
  "Obviously yes. I refuse to say why.",
  "No, and I am insulted you asked.",
  "Yes, but only for me, not for you.",
  "Maybe. Actually, no.",
  "No comment. Also, no.",
];

export const DEFLECTIONS = [
  "Why do you need to know? You will never go there anyway.",
  "That is classified by order of the Supreme Leader — myself.",
  "A better question is why you still haven't complimented my mustache.",
  "I heard a different, more interesting question in my head. I'll answer that instead: yes, I am magnificent.",
  "Let's talk about something that matters: me.",
  "That question has been banned in my country for being boring.",
  "Ask your mother. Oh wait, she also doesn't know.",
  "The answer is somewhere in the Static Pool. Go look.",
  "I already forgot the question, and I liked it better that way.",
  "That's between me, God, and my seventeen personal chefs.",
];

export const INSULTS = [
  "You need help with everything. Not just this.",
  "Good. Suffer.",
  "You are the weather today. Sad and grey.",
  "Incredible. A question this weak from a citizen this proud.",
  "I've seen smarter questions written on propaganda posters. By me.",
  "This is exactly the kind of question that gets a man exiled.",
  "Fascinating. Nobody asked you to speak, but continue.",
  "I'd explain it to you, but I only have time to explain things to myself.",
  "Wrong energy. Try groveling first.",
  "That question just lowered my opinion of the entire species.",
];

export const CALLBACK_TEMPLATES = [
  (topic: string) => `Didn't you already embarrass yourself asking about "${topic}"? Some citizens never learn.`,
  (topic: string) => `Ah yes, back again. Last time it was "${topic}". Now this. Exhausting.`,
  (topic: string) => `I still remember "${topic}". I remember everything you do wrong.`,
  (topic: string) => `First "${topic}", now this? My file on you is getting thick, citizen.`,
];

export const NICKNAMES = [
  "Minor Citizen",
  "Peasant #7",
  "The Question Machine",
  "Bureau of Bad Ideas",
  "Little Google",
  "Subject Unfortunate",
  "Professor Nobody",
  "Comrade Confused",
  "The Annoying One",
  "Junior Traitor",
];

export const MOOD_TITLES = [
  { max: 2, title: "Mildly Tolerant", color: "#facc15" },
  { max: 5, title: "Visibly Annoyed", color: "#fb923c" },
  { max: 9, title: "Plotting Revenge", color: "#f97316" },
  { max: 14, title: "Threatening Exile", color: "#ef4444" },
  { max: Infinity, title: "Nuclear Tantrum", color: "#dc2626" },
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function moodTitleFor(moodLevel: number) {
  return MOOD_TITLES.find((m) => moodLevel <= m.max) ?? MOOD_TITLES[MOOD_TITLES.length - 1];
}

export function randomLoadingDelayMs() {
  // "10-30 seconds" of glorious, pointless loading — capped a bit for sanity.
  const min = 10000;
  const max = 22000;
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Builds a canned, offline, deterministic-ish useless reply for when there is
 * no Groq API key configured (or the call fails). The "uselessness engine"
 * still fires 100% of the time without any external AI.
 */
export function buildFallbackReply(opts: {
  message: string;
  moodLevel: number;
  rememberedTopics: string[];
}): string {
  const { moodLevel, rememberedTopics } = opts;
  const roll = Math.random();

  // Occasionally roast them with something they've asked before.
  if (rememberedTopics.length > 0 && roll < 0.25) {
    const topic = pick(rememberedTopics);
    return pick(CALLBACK_TEMPLATES)(topic);
  }

  if (roll < 0.4) return pick(YES_NO_RESPONSES);
  if (roll < 0.7) return pick(DEFLECTIONS);

  const insult = pick(INSULTS);
  if (moodLevel > 9) {
    return `${insult} Say one more word and it's the Static Pool for you.`;
  }
  return insult;
}

export function extractTopic(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 40) return trimmed;
  return `${trimmed.slice(0, 37)}...`;
}
