/* EXPLORE Homework — Lesson pack
 * Unit H · Lesson 3 — Wearing or Holding? (Listening & Speaking) · map: HANDOVER.md §3 · DLP: WHW EXPLORE › tab H3
 * Pictures: assets/h3/img (slides H3: Manny's shop, the 8 accessories, children wearing / holding). No generated pictures.
 * Rules (DLP): pairs are always shown as a pair · holding only with hat, cap, handbag, glasses, shoes, boots (watch, socks: wearing only;
 *   handbag: always held) · one verb per sentence · he / she only in Let's Talk (no "Are you…?").
 * Voice: browser TTS until the Voice Pipeline makes lessons/h3.voice.js (words have no `audio` → the engine speaks the label).
 */
(function () {
  const YES = (s) => (s === "he" ? "Yes, he is." : "Yes, she is."), NO = (s) => (s === "he" ? "No, he isn't." : "No, she isn't.");
  /* listen to the question → Yes or No (Ex7 Yes or No Jump) */
  const yn = (img, s, q, yes) => ({ prompt: { img, say: q }, opts: [{ text: YES(s) }, { text: NO(s) }], answer: yes ? 0 : 1, fixedOrder: true, after: yes ? YES(s) : NO(s) });
  /* Race home: Kim asks, the child gives the short answer */
  const race = (img, s, q, yes) => ({ s, img, q, short: yes ? YES(s) : NO(s) });
  /* look and say: one thing, worn or held */
  const look = (img, s, verb, w) => ({ s, img, parts: [{ verb, foods: [w] }], q: s === "he" ? "Look at him!" : "Look at her!" });

  window.LESSON = {
    id: "H3",
    unit: "Unit H · Clothes",
    title: "Manny's Shop",
    subtitle: "Lesson 3 · Wearing or holding?",
    skills: ["L", "S"],
    img: "assets/h3/img/",
    aud: "assets/h3/audio/",
    finishLine: "Hooray! You finished Manny's shop!",

    plan: [
      { id: "vocab",   label: "Vocabulary", img: "item-cap", frame: "manny-middle", awning: "#e5534b" },
      { id: "grammar", label: "Grammar",    img: "g-jill-hold-hat",               awning: "#e8b33a" },
      { id: "fl",      label: "Let's Talk", img: "fl-grace-hat",                  awning: "#4aa3a2" }
    ],
    focus: {
      "manny-top": { x: 36, y: 2, w: 28, h: 96 }, "manny-middle": { x: 36, y: 2, w: 28, h: 96 }, "manny-bottom": { x: 36, y: 2, w: 28, h: 96 },
      "g-jill-wear-hat": { x: 47, y: 6, w: 26, h: 90 }, "g-jill-hold-hat": { x: 47, y: 6, w: 26, h: 90 },
      "g-matt-wear-boots": { x: 47, y: 6, w: 26, h: 90 }, "g-matt-hold-boots": { x: 47, y: 6, w: 26, h: 90 },
      "g-grace-wear-cap": { x: 47, y: 6, w: 26, h: 90 }, "g-grace-hold-glasses": { x: 47, y: 6, w: 26, h: 90 },
      "fl-grace-hat": { x: 52, y: 6, w: 26, h: 90 }, "fl-alex-glasses": { x: 47, y: 6, w: 26, h: 90 }
    },
    mapDeco: [
      { img: "item-glasses", x: 72, y: 6, r: 12 },
      { img: "item-boots", x: 6, y: 46, r: -10 },
      { img: "item-watch", x: 80, y: 80, r: 18 }
    ],

    /* ---------- Vocabulary: Set 2 (verb "wearing" for the engine's sentences) ---------- */
    words: {
      hat:     { label: "a hat",          img: "item-hat",     verb: "wearing", say: [" hat", "hats"] },
      cap:     { label: "a baseball cap", img: "item-cap",     verb: "wearing", say: ["cap", "caps"] },
      glasses: { label: "glasses",        img: "item-glasses", verb: "wearing", say: ["glasses", "glass"] },
      watch:   { label: "a watch",        img: "item-watch",   verb: "wearing", say: ["watch", "watches"] },
      handbag: { label: "a handbag",      img: "item-handbag", verb: "holding", say: ["handbag", "hand bag"] },
      shoes:   { label: "shoes",          img: "item-shoes",   verb: "wearing", say: ["shoes", "shoe"] },
      boots:   { label: "boots",          img: "item-boots",   verb: "wearing", say: ["boots", "boot"] },
      socks:   { label: "socks",          img: "item-socks",   verb: "wearing", say: ["socks", "sock", "sox"] }
    },
    /* STS Insights: cap called "hat", shoes–boots, shoes–socks, handbag–watch */
    confusable: { hat: "cap", cap: "hat", shoes: "boots", boots: "shoes", socks: "shoes", handbag: "watch", watch: "handbag", glasses: "watch" },

    /* Mental model: Manny's shop — three shelves; open one and Manny wears (or holds) its things */
    street: {
      scene: "scene-shop",
      name: "Manny's shop",
      carts: [
        { id: "top",    name: "Top shelf",    scene: "manny-top",    foods: ["hat", "cap"],                  hot: { x: 9, y: 12, w: 16, h: 24 } },
        { id: "middle", name: "Middle shelf", scene: "manny-middle", foods: ["glasses", "watch", "handbag"], hot: { x: 9, y: 37, w: 16, h: 21 } },
        { id: "bottom", name: "Bottom shelf", scene: "manny-bottom", foods: ["shoes", "boots", "socks"],     hot: { x: 3, y: 59, w: 28, h: 14 } }
      ]
    },

    blocks: [
      {
        id: "vocab",
        name: "Vocabulary",
        steps: [
          { type: "watch", id: "v-watch", title: "Manny's shop", skipLabel: "Go to the shelves ▶",
            cues: [
              { scene: "scene-main", line: { text: "We have the clothes. Now let's find some accessories at Manny's shop!" } },
              { scene: "scene-shop", point: "cart:top", line: { text: "Look! The top shelf…" }, after: 200 },
              { scene: "scene-shop", point: "cart:middle", line: { text: "the middle shelf…" }, after: 200 },
              { scene: "scene-shop", point: "cart:bottom", line: { text: "and the bottom shelf." } },

              { scene: "manny-top", clear: true, line: { text: "This is Manny! The top shelf." } },
              { scene: "manny-top", food: "hat" },
              { scene: "manny-top", food: "cap", line: { text: "A baseball cap. Not a hat!" }, wordFirst: true },

              { scene: "manny-middle", clear: true, line: { text: "The middle shelf." } },
              { scene: "manny-middle", food: "glasses" },
              { scene: "manny-middle", food: "watch", line: { text: "A watch… on your wrist!" }, wordFirst: true },
              { scene: "manny-middle", food: "handbag", line: { text: "A handbag. Not a bag… a handbag!" }, wordFirst: true },

              { scene: "manny-bottom", clear: true, line: { text: "The bottom shelf." } },
              { scene: "manny-bottom", food: "shoes" },
              { scene: "manny-bottom", food: "boots" },
              { scene: "manny-bottom", food: "socks" },

              { scene: "scene-shop", clear: true, strip: "<b>glasses</b> · <b>shoes</b> · <b>boots</b> · <b>socks</b> → two eyes, two feet → <b class='m'>-s</b>",
                line: { text: "Glasses, shoes, boots, socks. Two eyes, two feet… S at the end. No A!" } },
              { scene: "scene-shop", line: { text: "Now it's your turn. Tap a shelf!" } }
            ] },

          { type: "explore", id: "v-explore", title: "Visit the shelves", instruction: "Tap a shelf. Then tap the things and listen.", readyWhen: "always" },

          /* P1 · Listening — Bubbles: the confusable item is always there */
          { type: "bubbles", id: "v-p1", skill: "L", title: "Pop the bubble", instruction: "Listen. Pop the right bubble!",
            intro: "Let's play! Listen to the word. Then pop the right bubble!",
            targets: ["hat", "cap", "shoes", "boots", "socks", "handbag", "watch", "glasses"], options: 3 },

          /* P2 · Speaking — Say it: the final sounds (glasses, shoes, boots, socks, watch) */
          { type: "say", id: "v-p2", skill: "S", title: "Say it!", instruction: "What's this? Say it!",
            intro: "Now it's your turn to talk! Look and say the word. Say the end of the word, too!",
            ask: "What's this?", doneLine: "Well done! You said all the words!",
            items: ["glasses", "shoes", "boots", "socks", "watch"] },

          { type: "recap", id: "v-recap", title: "Your shop words", heading: "Manny's shop words" }
        ]
      },

      /* ============================ GRAMMAR ============================ */
      {
        id: "grammar",
        name: "Grammar",
        steps: [
          { type: "watch", id: "g-watch", title: "Wearing or holding?", skipLabel: "Go to the cards ▶",
            cues: [
              { scene: "g-jill-wear-hat", line: { text: "Look! This is Jill." } },
              { scene: "g-jill-wear-hat", strip: "She's <b>wearing</b> a hat.", line: { text: "The hat is on her head. She's wearing a hat." } },
              { scene: "g-jill-hold-hat", strip: "She's <b class='m'>holding</b> a hat.", line: { text: "Now the hat is in her hand. She's holding a hat." } },
              { scene: "g-matt-wear-boots", strip: "He's <b>wearing</b> boots.", line: { text: "This is Matt. The boots are on his feet. He's wearing boots." } },
              { scene: "g-matt-hold-boots", strip: "He's <b class='m'>holding</b> boots.", line: { text: "In his hands… he's holding boots." } },
              { scene: "g-grace-wear-cap", bubble: { text: "I'm wearing a baseball cap!", x: 18, y: 14 },
                strip: "I'm <b>wearing</b> a baseball cap.", line: { text: "I'm wearing a baseball cap!", who: "kim" } },
              { scene: "g-grace-hold-glasses", bubble: { text: "I'm holding glasses!", x: 18, y: 14 },
                strip: "I'm <b class='m'>holding</b> glasses.", line: { text: "I'm holding glasses!", who: "kim" } },
              { scene: "scene-shop", strip: "<b>wearing</b> = on your body<br><b class='m'>holding</b> = in your hand",
                line: { text: "Wearing… on your body. Holding… in your hand. Now tap and listen!" } }
            ] },

          { type: "chunks", id: "g-explore", title: "Tap and listen", instruction: "Tap a card and listen.",
            cards: [
              { chunk: "She's wearing", img: "jill-wear-hat", full: "She is wearing a hat.", short: "She's wearing a hat.", rest: "a hat." },
              { chunk: "She's holding", img: "jill-hold-hat", full: "She is holding a hat.", short: "She's holding a hat.", rest: "a hat." },
              { chunk: "He's wearing", img: "matt-wear-boots", full: "He is wearing boots.", short: "He's wearing boots.", rest: "boots." },
              { chunk: "He's holding", img: "matt-hold-boots", full: "He is holding boots.", short: "He's holding boots.", rest: "boots." }
            ] },

          /* P1 · Listening — Which picture? The wrong pictures: the same thing with the other verb, or another thing (DLP Ex5 idea) */
          { type: "pick", id: "g-p1", skill: "L", title: "Which picture?",
            intro: "Listen. Wearing or holding? Tap the right picture!",
            items: [
              { say: "She's wearing a hat.",     opts: ["jill-wear-hat", "jill-hold-hat", "grace-wear-cap"], answer: 0 },
              { say: "She's holding a hat.",     opts: ["jill-hold-hat", "jill-wear-hat", "grace-hold-glasses"], answer: 0 },
              { say: "He's wearing boots.",      opts: ["matt-wear-boots", "matt-hold-boots", "jump-1"], answer: 0 },
              { say: "He's holding boots.",      opts: ["matt-hold-boots", "matt-wear-boots", "alex-hold-handbag"], answer: 0 },
              { say: "She's holding glasses.",   opts: ["grace-hold-glasses", "jump-4", "grace-wear-cap"], answer: 0 },
              { say: "He's holding a handbag.",  opts: ["alex-hold-handbag", "alex-glasses", "matt-hold-boots"], answer: 0 }
            ] },

          /* P2 · Speaking — Look and say: the verb is checked (wearing ↔ holding is the STS Insights error) */
          { type: "answer", id: "g-p2", skill: "S", title: "Look and say", checkVerb: true,
            verbSet: ["wearing", "holding"], verbLine: "Wearing or holding? Look again!", moreLine: "Good! Now say the full sentence!",
            intro: "Look at the picture. On the body or in the hand? Say the full sentence!",
            items: [
              look("grace-wear-cap", "she", "wearing", "cap"),
              look("jill-wear-watch", "she", "wearing", "watch"),
              look("alex-glasses", "he", "holding", "glasses"),
              look("jill-hold-hat", "she", "holding", "hat"),
              look("matt-wear-boots", "he", "wearing", "boots"),
              look("alex-hold-handbag", "he", "holding", "handbag")
            ] },

          { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "👂 Which picture?"], ["g-p2", "🗣️ Look and say"]] }
        ]
      },

      /* ======================= FUNCTIONAL LANGUAGE (Let's Talk) ======================= */
      {
        id: "fl",
        name: "Let's Talk",
        steps: [
          { type: "watch", id: "f-watch", title: "Is she wearing a hat?", skipLabel: "Go to the cards ▶",
            cues: [
              { scene: "fl-grace-hat", line: { text: "Look! This is Grace." } },
              { scene: "fl-grace-hat", strip: "<span class='q'>Is she wearing a hat?</span>", line: { text: "Is she wearing a hat?" } },
              { scene: "fl-grace-hat", strip: "<span class='q'>Is she wearing a hat?</span><br><b>Yes, she is.</b>", line: { text: "Yes, she is.", who: "kim" } },
              { scene: "fl-grace-hat", strip: "<span class='q'>Is she holding a hat?</span><br><b>No, she isn't.</b>", line: { text: "Is she holding a hat? No, she isn't." } },
              { scene: "fl-alex-glasses", line: { text: "And this is Alex." } },
              { scene: "fl-alex-glasses", strip: "<span class='q'>Is he holding glasses?</span><br><b>Yes, he is.</b>", line: { text: "Is he holding glasses? Yes, he is." } },
              { scene: "fl-alex-glasses", strip: "<span class='q'>Is he wearing glasses?</span><br><b>No, he isn't.</b>", line: { text: "Is he wearing glasses? No, he isn't." } },
              { scene: "scene-shop", strip: "<span class='q'>Is he / she wearing / holding …?</span><br><b>Yes, he / she is.</b> · <b>No, he / she isn't.</b>",
                line: { text: "Yes, he is. Not yes, he's! Now tap and listen!" } }
            ] },

          { type: "qa", id: "f-explore", title: "Ask and answer", instruction: "Tap a card. Listen to the question and the answer.",
            cards: [
              { img: "grace-hat", q: "Is she wearing a hat?", a: "Yes, she is.", chunk: "Yes, she is." },
              { img: "grace-hat", q: "Is she holding a hat?", a: "No, she isn't.", chunk: "No, she isn't." },
              { img: "alex-glasses", q: "Is he holding glasses?", a: "Yes, he is.", chunk: "Yes, he is." }
            ] },

          /* P1 · Listening — Yes or no? (DLP Ex7: the same thing asked worn and held) */
          { type: "choose", id: "f-p1", skill: "L", title: "Yes or no?",
            intro: "Look at the picture. Listen to the question. Yes or no?",
            items: [
              yn("jump-1", "he", "Is he holding shoes?", true),
              yn("jump-1", "he", "Is he wearing shoes?", false),
              yn("jump-2", "she", "Is she wearing glasses?", false),
              yn("jump-2", "she", "Is she wearing a watch?", true),
              yn("jump-3", "he", "Is he wearing a hat?", false),
              yn("jump-3", "he", "Is he wearing boots?", true),
              yn("jump-4", "she", "Is she holding glasses?", false),
              yn("jump-4", "she", "Is she holding a handbag?", true)
            ] },

          /* P2 · Speaking — Race home: the short answer moves Kim on the board ("Yes, he's" is not accepted) */
          { type: "answer", id: "f-p2", skill: "S", title: "Race home", board: true,
            intro: "Kim asks a question. Answer: Yes, he is. or No, she isn't. Race home!",
            items: [
              race("jump-5", "he", "Is he holding boots?", true),
              race("jump-5", "he", "Is he wearing boots?", false),
              race("jill-wear-watch", "she", "Is she wearing a watch?", true),
              race("grace-hold-glasses", "she", "Is she wearing glasses?", false),
              race("matt-hold-boots", "he", "Is he holding boots?", true),
              race("jill-wear-hat", "she", "Is she holding a hat?", false)
            ] },

          { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "👂 Yes or no?"], ["f-p2", "🏠 Race home"]] }
        ]
      }
    ]
  };
})();
