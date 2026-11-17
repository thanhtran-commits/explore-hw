/* EXPLORE Homework — Lesson pack
 * Unit I · Lesson 1 — What Are They Eating? (Listening & Speaking)
 * CP3: Vocab block only. Grammar + FL blocks come in CP4.
 *
 * Narration: `text` is spoken by TTS (en-GB) until ElevenLabs mp3 files exist.
 * When an mp3 is generated, add `audio: "assets/i1/audio/<file>.mp3"` to the line.
 */
window.LESSON = {
  id: "I1",
  unit: "Unit I · Food & drink",
  title: "Food Street",
  subtitle: "Lesson 1 · What are they eating?",
  skills: ["L", "S"],
  img: "assets/i1/img/",

  /* Lesson map (home screen): the three parts, in order. `soon` = not built yet. */
  plan: [
    { id: "vocab",   label: "Vocabulary", img: "food-burger",   awning: "#e5534b" },
    { id: "grammar", label: "Grammar",    img: "g-bill-burger", awning: "#e8b33a" },
    { id: "fl",      label: "Let's Talk", img: "fl-tony-chips", awning: "#4aa3a2" }
  ],
  /* food dropped along the map road (x/y in % of the path area) */
  mapDeco: [
    { img: "food-chips", x: 72, y: 6, r: 12 },
    { img: "food-egg", x: 6, y: 46, r: -10 },
    { img: "food-sausage", x: 80, y: 80, r: 18 }
  ],
  aud: "assets/i1/audio/",

  /* ---------- Vocabulary (Set 1) ---------- */
  words: {
    bread:     { label: "bread",       img: "food-bread",     audio: "word-bread",     say: ["bread", "bred", "brad"] },
    egg:       { label: "an egg",      img: "food-egg",       audio: "word-egg",       say: ["egg", "eggs", "an egg"] },
    meatballs: { label: "meatballs",   img: "food-meatballs", audio: "word-meatballs", say: ["meatball", "meat ball", "meetball"] },
    sausage:   { label: "a sausage",   img: "food-sausage",   audio: "word-sausage",   say: ["sausage", "sossage", "sausages"] },
    burger:    { label: "a burger",    img: "food-burger",    audio: "word-burger",    say: ["burger", "burgers", "berger"] },
    chips:     { label: "chips",       img: "food-chips",     audio: "word-chips",     say: ["chip", "chips"] },
    rice:      { label: "rice",        img: "food-rice",      audio: "word-rice",      say: ["rice", "rise", "rys"] },
    chicken:   { label: "chicken",     img: "food-chicken",   audio: "word-chicken",   say: ["chicken", "chickens"] },
    fish:      { label: "fish",        img: "food-fish",      audio: "word-fish",      say: ["fish", "fishes"] },
    meat:      { label: "meat",        img: "food-meat",      audio: "word-meat",      say: ["meat", "meet"], reject: ["ball"] }
  },

  /* Confusable pairs from STS Insights — used as distractors */
  confusable: {
    meat: "meatballs", meatballs: "meat", burger: "sausage", sausage: "burger",
    chicken: "fish", fish: "chicken", rice: "bread", bread: "rice", egg: "meatballs", chips: "sausage"
  },

  /* Mental model: Food Street with three carts. Hotspots in % of the scene image. */
  street: {
    scene: "scene-main",
    carts: [
      { id: "bread",  name: "Bread cart",  scene: "cart-bread",  foods: ["bread", "egg", "meatballs", "sausage"],
        hot: { x: 6, y: 11, w: 28, h: 50 } },
      { id: "burger", name: "Burger cart", scene: "cart-burger", foods: ["burger", "chips"],
        hot: { x: 39, y: 17, w: 22, h: 42 } },
      { id: "rice",   name: "Rice stall",  scene: "cart-rice",   foods: ["rice", "chicken", "fish", "meat"],
        hot: { x: 66, y: 6, w: 33, h: 56 } }
    ],
    /* Points on the rice stall sign (animal pictures) */
    signRice: { chicken: { x: 51, y: 18 }, fish: { x: 65, y: 19 } }
  },

  blocks: [
    {
      id: "vocab",
      name: "Vocabulary",
      steps: [
        /* ---- REVIEW · Watch: auto-play, each line can be replayed ---- */
        {
          type: "watch",
          id: "v-watch",
          title: "Welcome to Food Street",
          skipLabel: "Go to the carts ▶",
          cues: [
            { scene: "scene-main", line: { text: "Welcome to Food Street!" } },
            { scene: "scene-main", point: "cart:bread", line: { text: "Look! The bread cart…" }, after: 200 },
            { scene: "scene-main", point: "cart:burger", line: { text: "the burger cart…" }, after: 200 },
            { scene: "scene-main", point: "cart:rice", line: { text: "and the rice stall." } },

            { scene: "cart-bread", clear: true, line: { text: "This is the bread cart. What food is here?" } },
            { scene: "cart-bread", food: "bread" },
            { scene: "cart-bread", food: "egg" },
            { scene: "cart-bread", food: "meatballs" },
            { scene: "cart-bread", food: "sausage" },

            { scene: "cart-burger", clear: true, line: { text: "This is the burger cart." } },
            { scene: "cart-burger", food: "burger" },
            { scene: "cart-burger", food: "chips" },

            { scene: "cart-rice", clear: true, line: { text: "This is the rice stall." } },
            { scene: "cart-rice", food: "rice" },
            { scene: "cart-rice", point: "sign:chicken", line: { text: "Look! A chicken. It's an animal…" } },
            { scene: "cart-rice", food: "chicken", line: { text: "…and it's food, too!" }, wordFirst: true },
            { scene: "cart-rice", point: "sign:fish", line: { text: "A fish. It's an animal…" } },
            { scene: "cart-rice", food: "fish", line: { text: "…and it's food, too!" }, wordFirst: true },
            { scene: "cart-rice", food: "meat" },

            { scene: "scene-main", clear: true, line: { text: "Now it's your turn. Tap a cart!" } }
          ]
        },

        /* ---- REVIEW · Explore: tap carts, tap foods, hear each word ---- */
        {
          type: "explore",
          id: "v-explore",
          title: "Visit the carts",
          instruction: "Tap a cart. Then tap the food and listen.",
          readyWhen: "always"   /* "I'm ready!" is always green — no gate (decision 2026-11-09) */
        },

        /* ---- PRACTICE 1 · Listening — Bubbles (template: Nghe & chọn, vỏ bong bóng) ---- */
        {
          type: "bubbles",
          id: "v-p1",
          skill: "L",
          title: "Pop the bubble",
          instruction: "Listen. Pop the right bubble!",
          intro: "Let's play! Listen to the word. Then pop the right bubble!",
          targets: ["meatballs", "meat", "sausage", "burger", "chicken", "fish", "rice", "bread"],
          options: 3
        },

        /* ---- PRACTICE 2 · Speaking — Say it (template: Nghe & repeat, keyword check) ---- */
        {
          type: "say",
          id: "v-p2",
          skill: "S",
          title: "Say it!",
          instruction: "What's this? Say it!",
          intro: "Now it's your turn to talk! Look at the food and say its name. I'm listening!",
          ask: "What's this?",
          items: ["sausage", "meatballs", "chips", "egg", "fish"]
        },

        /* ---- Wrap-up: word list review (template: "chơi xong → ôn lại danh sách từ") ---- */
        { type: "recap", id: "v-recap", title: "Your food words" }
      ]
    },

    /* ============================ GRAMMAR ============================ */
    {
      id: "grammar",
      name: "Grammar",
      steps: [
        /* ---- REVIEW · Watch: Bill → Sue → "I", full form then buddies merge ---- */
        {
          type: "watch",
          id: "g-watch",
          title: "Who is eating?",
          skipLabel: "Go to the cards ▶",
          cues: [
            { scene: "g-bill-burger", line: { text: "Look! This is Bill." } },
            { scene: "g-bill-burger", strip: "<b>He is eating</b> a burger.", line: { text: "He is eating a burger." } },
            { scene: "g-bill-burger", strip: "<b class='m'>He's eating</b> a burger.", line: { text: "He… is… He's! He's eating a burger." } },

            { scene: "g-sue-chicken", line: { text: "And this is Sue." } },
            { scene: "g-sue-chicken", strip: "<b>She is eating</b> chicken.", line: { text: "She is eating chicken." } },
            { scene: "g-sue-chicken", strip: "<b class='m'>She's eating</b> chicken.", line: { text: "She… is… She's! She's eating chicken." } },

            { scene: "scene-street", dim: true, actors: [{ img: "g-girl-plate", x: 20, y: 30, w: 34 }, { img: "food-meatballs", x: 31.5, y: 64, w: 11 }],
              bubble: { text: "I am eating meatballs!", x: 52, y: 42 }, strip: "<b>I am eating</b> meatballs.", line: { text: "I am eating meatballs!", who: "kim" } },
            { scene: "scene-street", dim: true, actors: [{ img: "g-girl-plate", x: 20, y: 30, w: 34 }, { img: "food-meatballs", x: 31.5, y: 64, w: 11 }],
              bubble: { text: "I'm eating meatballs!", x: 52, y: 42 }, strip: "<b class='m'>I'm eating</b> meatballs.", line: { text: "I… am… I'm! I'm eating meatballs!", who: "kim" } },

            { scene: "scene-street", strip: "<b>He's eating</b> · <b>She's eating</b> · <b>I'm eating</b>",
              line: { text: "He's eating. She's eating. I'm eating. Now tap and listen!" } }
          ]
        },

        /* ---- REVIEW · Explore: 3 chunk cards, tap to hear full + short form ---- */
        {
          type: "chunks",
          id: "g-explore",
          title: "Tap and listen",
          instruction: "Tap a card and listen.",
          cards: [
            { chunk: "He's eating", img: "g-bill-burger", full: "He is eating a burger.", short: "He's eating a burger.", rest: "a burger." },
            { chunk: "She's eating", img: "g-sue-chicken", full: "She is eating chicken.", short: "She's eating chicken.", rest: "chicken." },
            { chunk: "I'm eating", img: "g-girl-plate", food: "food-meatballs", full: "I am eating meatballs.", short: "I'm eating meatballs.", rest: "meatballs.", who: "kim" }
          ]
        },

        /* ---- PRACTICE 1 · Listening — Nghe & chọn có nhân vật (wrong pictures differ by food OR person) ---- */
        {
          type: "pick",
          id: "g-p1",
          skill: "L",
          title: "Who is it?",
          intro: "Listen to the sentence. Who is it? Tap the right picture!",
          items: [
            { say: "She's eating meatballs.", opts: ["hw-q1a", "hw-q1b", "hw-q1c"], answer: 0 },
            { say: "He's eating a burger.",   opts: ["hw-q2a", "hw-q2b", "hw-q2c"], answer: 1 },
            { say: "She's eating fish.",      opts: ["hw-q3a", "hw-q3b", "hw-q3c"], answer: 2 },
            { say: "He's eating rice.",       opts: ["hw-q4a", "hw-q4b", "hw-q4c"], answer: 0 },
            { say: "She's eating an egg.",    opts: ["hw-q5a", "hw-q5b", "hw-q5c"], answer: 1 },
            { say: "He's eating chicken.",    opts: ["hw-q6a", "hw-q6b", "hw-q6c"], answer: 2 }
          ]
        },

        /* ---- PRACTICE 2 · Speaking — Lift the Lid (shadow → full sentence; random kid × food each time) ---- */
        {
          type: "lid",
          id: "g-p2",
          skill: "S",
          title: "Lift the Lid",
          intro: "Look at the shadow on the plate. What is it? Say the full sentence. Then the lid opens!",
          boys: ["lid-kid1", "lid-kid3", "lid-kid4", "lid-kid6"],
          girls: ["lid-kid2", "lid-kid5", "lid-kid7", "lid-kid8"],
          me: "i-hand",
          foods: ["chips", "egg", "rice", "meatballs", "fish", "sausage", "bread", "chicken"],
          subjects: ["he", "she", "i", "he", "she", "i"]
        },

        { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "👂 Who is it?"], ["g-p2", "🍽️ Lift the Lid"]] }
      ]
    },

    /* ======================= FUNCTIONAL LANGUAGE (Let's Talk) ======================= */
    {
      id: "fl",
      name: "Let's Talk",
      steps: [
        /* ---- REVIEW · Watch: ask about Tony, Pat, then "you" ---- */
        {
          type: "watch",
          id: "f-watch",
          title: "What is he eating?",
          skipLabel: "Go to the cards ▶",
          cues: [
            { scene: "fl-tony-chips", line: { text: "Look! This is Tony." } },
            { scene: "fl-tony-chips", strip: "<span class='q'>What is he eating?</span>", line: { text: "What is he eating?" } },
            { scene: "fl-tony-chips", strip: "<span class='q'>What is he eating?</span><br><b>He's eating</b> chips.", line: { text: "He's eating chips.", who: "kim" } },

            { scene: "fl-pat-egg", line: { text: "And this is Pat." } },
            { scene: "fl-pat-egg", strip: "<span class='q'>What is she eating?</span>", line: { text: "What is she eating?" } },
            { scene: "fl-pat-egg", strip: "<span class='q'>What is she eating?</span><br><b>She's eating</b> an egg.", line: { text: "She's eating an egg.", who: "kim" } },

            { scene: "scene-street", dim: true, actors: [{ img: "g-girl-plate", x: 20, y: 30, w: 34 }, { img: "food-rice", x: 31.5, y: 64, w: 11 }],
              strip: "<span class='q'>What are you eating?</span>", line: { text: "And you? What are you eating?" } },
            { scene: "scene-street", dim: true, actors: [{ img: "g-girl-plate", x: 20, y: 30, w: 34 }, { img: "food-rice", x: 31.5, y: 64, w: 11 }],
              bubble: { text: "I'm eating rice!", x: 52, y: 42 },
              strip: "<span class='q'>What are you eating?</span><br><b>I'm eating</b> rice.", line: { text: "I'm eating rice!", who: "kim" } },

            { scene: "scene-street", strip: "<span class='q'>What is he / she eating?</span> → <b>He's / She's eating</b> …<br><span class='q'>What are you eating?</span> → <b>I'm eating</b> …",
              line: { text: "Ask with what. Answer with a full sentence. Now tap and listen!" } }
          ]
        },

        /* ---- REVIEW · Explore: tap a question card → hear the question, then the answer ---- */
        {
          type: "qa",
          id: "f-explore",
          title: "Ask and answer",
          instruction: "Tap a card. Listen to the question and the answer.",
          cards: [
            { img: "fl-tony-chips", q: "What is he eating?", a: "He's eating chips.", chunk: "He's eating" },
            { img: "fl-pat-egg", q: "What is she eating?", a: "She's eating an egg.", chunk: "She's eating" },
            { img: "g-girl-plate", food: "food-rice", q: "What are you eating?", a: "I'm eating rice.", chunk: "I'm eating" }
          ]
        },

        /* ---- PRACTICE 1 · Listening — Who is it? (Starters Listening Part 1 idea; new faces, confusable foods) ---- */
        {
          type: "names",
          id: "f-p1",
          skill: "L",
          title: "Find the friends",
          intro: "Listen. Who is it? Tap the right friend. The name goes there!",
          kids: [
            { id: "k1", img: "hw-q2a", foods: ["sausage"] },
            { id: "k2", img: "hw-q2c", foods: ["burger"] },
            { id: "k3", img: "hw-q1c", foods: ["meatballs"] },
            { id: "k4", img: "hw-q1b", foods: ["meat"] },
            { id: "k5", img: "hw-q3b", foods: ["fish"] },
            { id: "k6", img: "hw-q6a", foods: ["chicken"] }
          ],
          rounds: [
            { name: "Nick", kid: "k1", q: "What is Nick eating?", a: "He's eating a sausage." },
            { name: "Ann", kid: "k2", q: "What is Ann eating?", a: "She's eating a burger." },
            { name: "Tom", kid: "k3", q: "What is Tom eating?", a: "He's eating meatballs." },
            { name: "May", kid: "k4", q: "What is May eating?", a: "She's eating meat." },
            { name: "Sam", kid: "k5", q: "What is Sam eating?", a: "He's eating fish." }
          ]
        },

        /* ---- PRACTICE 2 · Speaking — Kim asks, student answers with a full sentence ---- */
        {
          type: "answer",
          id: "f-p2",
          skill: "S",
          title: "Answer Kim",
          intro: "Kim asks you a question. Answer with a full sentence!",
          items: [
            { s: "he",  img: "hw-p1", foods: ["burger", "chips"], q: "What is he eating?" },
            { s: "she", img: "hw-p2", foods: ["rice", "fish"],    q: "What is she eating?" },
            { s: "she", img: "hw-p3", foods: ["egg"],              q: "What is she eating?" },
            { s: "he",  img: "hw-p4", foods: ["chicken"],          q: "What is he eating?" },
            { s: "i",   img: "i-hand", plate: ["meatballs"],       q: "What are you eating?" },
            { s: "i",   img: "i-hand", plate: ["bread"],           q: "What are you eating?" }
          ]
        },

        { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "👂 Find the friends"], ["f-p2", "💬 Answer Kim"]] }
      ]
    }
  ]
};
