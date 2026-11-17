/* EXPLORE Homework — Lesson pack
 * Unit I · Lesson 3 — Drinks & Desserts (Listening & Speaking)
 * DLP: WHW EXPLORE › tab I3. Skills L, S. New words: Set 2 (drinks + desserts).
 * Pictures + word audio: from the I3 lesson HTML (DOL). Homework items are NEW (not the in-class answers).
 */
window.LESSON = {
  id: "I3",
  unit: "Unit I · Food & drink",
  title: "Drinks & Desserts",
  subtitle: "Lesson 3 · Eating or drinking?",
  skills: ["L", "S"],
  img: "assets/i3/img/",
  aud: "assets/i3/audio/",
  backdrop: "scene-street5",
  finishLine: "Hooray! You know drinks and desserts!",
  plan: [
    { id: "vocab",   label: "Vocabulary", img: "item-ice-cream",   awning: "#e5534b" },
    { id: "grammar", label: "Grammar",    img: "sc-sue-milk",      awning: "#e8b33a" },
    { id: "fl",      label: "Let's Talk", img: "sc-pat-juice",     awning: "#4aa3a2" }
  ],
  mapDeco: [{ img: "item-lemonade", x: 72, y: 6, r: 12 }, { img: "item-sweets", x: 6, y: 46, r: -10 }, { img: "item-cake", x: 80, y: 80, r: 18 }],

  /* Set 2 — no "a / an" (STS Insights: "a water", "a milk"). verb: which -ing goes with it. */
  words: {
    water:       { label: "water",     img: "item-water",     audio: "word-water",     verb: "drinking", group: "drink",   say: ["water", "waters", "walter", "wata"] },
    milk:        { label: "milk",      img: "item-milk",      audio: "word-milk",      verb: "drinking", group: "drink",   say: ["milk", "milks"] },
    juice:       { label: "juice",     img: "item-juice",     audio: "word-juice",     verb: "drinking", group: "drink",   say: ["juice", "juices", "jews", "deuce"] },
    lemonade:    { label: "lemonade",  img: "item-lemonade",  audio: "word-lemonade",  verb: "drinking", group: "drink",   say: ["lemonade", "lemon aid", "lemonades", "lemon ade"] },
    cake:        { label: "cake",      img: "item-cake",      audio: "word-cake",      verb: "eating",   group: "dessert", say: ["cake", "cakes"] },
    "ice-cream": { label: "ice cream", img: "item-ice-cream", audio: "word-ice-cream", verb: "eating",   group: "dessert", say: ["ice cream", "icecream", "ice-cream", "i scream", "ice creams"] },
    chocolate:   { label: "chocolate", img: "item-chocolate", audio: "word-chocolate", verb: "eating",   group: "dessert", say: ["chocolate", "chocolates", "choclate"] },
    sweets:      { label: "sweets",    img: "item-sweets",    audio: "word-sweets",    verb: "eating",   group: "dessert", say: ["sweets", "suites", "sweeties"] }
  },
  /* STS Insights: juice – lemonade, water – milk, sweets – chocolate, cake – ice cream */
  confusable: { juice: "lemonade", lemonade: "juice", water: "milk", milk: "water", sweets: "chocolate", chocolate: "sweets", cake: "ice-cream", "ice-cream": "cake" },

  /* Food Street with five carts; only the two new ones open (the I1 carts are background). Hotspots in % of scene-street5. */
  street: {
    scene: "scene-street5",
    carts: [
      { id: "drinks",  name: "Drinks cart",  scene: "cart-drinks",  foods: ["water", "milk", "juice", "lemonade"], hot: { x: 63, y: 21, w: 18, h: 44 } },
      { id: "dessert", name: "Dessert cart", scene: "cart-dessert", foods: ["cake", "ice-cream", "chocolate", "sweets"], hot: { x: 80, y: 23, w: 19, h: 62 } }
    ]
  },

  blocks: [
    /* ============================ VOCABULARY ============================ */
    {
      id: "vocab", name: "Vocabulary",
      steps: [
        { type: "watch", id: "v-watch", title: "Two new carts",
          cues: [
            { scene: "scene-street5", line: { text: "Look! Two new carts on Food Street!" } },
            { scene: "scene-street5", point: "cart:drinks", line: { text: "The drinks cart…" }, after: 200 },
            { scene: "scene-street5", point: "cart:dessert", line: { text: "and the dessert cart." } },
            { scene: "cart-drinks", clear: true, line: { text: "This is the drinks cart. What drinks are here?" } },
            { scene: "cart-drinks", food: "water" },
            { scene: "cart-drinks", line: { text: "From a cow. Moo!" } },
            { scene: "cart-drinks", food: "milk" },
            { scene: "cart-drinks", line: { text: "Oranges make…" } },
            { scene: "cart-drinks", food: "juice" },
            { scene: "cart-drinks", line: { text: "Lemon, water and sugar make…" } },
            { scene: "cart-drinks", food: "lemonade" },
            { scene: "cart-dessert", clear: true, line: { text: "This is the dessert cart. Yummy!" } },
            { scene: "cart-dessert", food: "cake" },
            { scene: "cart-dessert", food: "ice-cream" },
            { scene: "cart-dessert", line: { text: "Clap two beats: choc… late!" } },
            { scene: "cart-dessert", food: "chocolate" },
            { scene: "cart-dessert", line: { text: "Lots of small…" } },
            { scene: "cart-dessert", food: "sweets" },
            { scene: "scene-street5", clear: true, line: { text: "Now it's your turn. Tap a cart!" } }
          ] },
        { type: "explore", id: "v-explore", title: "Visit the new carts", instruction: "Tap a cart. Then tap the food and listen.", readyWhen: "always" },
        { type: "bubbles", id: "v-p1", skill: "L", title: "Pop the bubble",
          instruction: "Listen. Pop the right bubble!", intro: "Let's play! Listen to the word. Then pop the right bubble!",
          targets: ["juice", "lemonade", "water", "milk", "sweets", "chocolate", "cake", "ice-cream"], options: 3 },
        { type: "say", id: "v-p2", skill: "S", title: "Say it!",
          instruction: "What's this? Say it!", intro: "Now it's your turn to talk! Say the word. Say the end of the word, too!",
          ask: "What's this?", items: ["chocolate", "lemonade", "milk", "sweets", "ice-cream", "juice"] },
        { type: "recap", id: "v-recap", title: "Your new words", heading: "Drinks & desserts" }
      ]
    },

    /* ============================ GRAMMAR ============================ */
    {
      id: "grammar", name: "Grammar",
      steps: [
        { type: "watch", id: "g-watch", title: "Eating or drinking?",
          cues: [
            { scene: "sc-sue-milk", line: { text: "Look! This is Sue." } },
            { scene: "sc-sue-milk", strip: "She's <b>drinking</b> milk.", line: { text: "She's drinking milk." } },
            { scene: "sc-bill-ice-cream", line: { text: "And this is Bill. Ice cream… eating or drinking?" } },
            { scene: "sc-bill-ice-cream", strip: "He's <b class='m'>eating</b> ice cream.", line: { text: "Eating! He's eating ice cream." } },
            { scene: "sc-tony-cake", strip: "He's <b class='m'>eating</b> cake.", line: { text: "He's eating cake." } },
            { scene: "sc-pat-juice", strip: "She's <b>drinking</b> juice.", line: { text: "She's drinking juice." } },
            { scene: "scene-street5", dim: true, actors: [{ img: "@i1/img/g-girl-plate", x: 20, y: 30, w: 34 }, { img: "item-water", x: 31, y: 53, w: 11 }],
              bubble: { text: "I'm drinking water!", x: 52, y: 42 }, strip: "I'm <b>drinking</b> water.", line: { text: "I'm drinking water!", who: "kim" } },
            { scene: "scene-street5", strip: "drinks → <b>drinking</b><br>desserts → <b class='m'>eating</b>",
              line: { text: "Drinks… drinking. Desserts… eating! Now tap and listen!" } }
          ] },
        { type: "chunks", id: "g-explore", title: "Tap and listen", instruction: "Tap a card and listen.",
          cards: [
            { chunk: "She's drinking", img: "sc-sue-milk", full: "She is drinking milk.", short: "She's drinking milk.", rest: "milk." },
            { chunk: "He's eating", img: "sc-bill-ice-cream", full: "He is eating ice cream.", short: "He's eating ice cream.", rest: "ice cream." },
            { chunk: "I'm drinking", img: "i-hand", food: "item-water", full: "I am drinking water.", short: "I'm drinking water.", rest: "water.", who: "kim" }
          ] },
        /* P1 · Listening — Silly or not? (DLP Ex5 idea; new pictures + sentences) */
        { type: "choose", id: "g-p1", skill: "L", title: "Silly or not?", layout: "mark",
          intro: "Listen to the sentence. Is it right, or silly? Tap tick or cross!",
          items: [
            { prompt: { img: "sc-tony-milk", say: "He's drinking milk." }, opts: [{ text: "✓", mark: "tick" }, { text: "✗", mark: "cross" }], answer: 0, fixedOrder: true },
            { prompt: { img: "sc-pat-cake", say: "She's drinking cake." }, opts: [{ text: "✓", mark: "tick" }, { text: "✗", mark: "cross" }], answer: 1, fixedOrder: true, fix: "She's eating cake.", after: "She's eating cake." },
            { prompt: { img: "sc-bill-lemonade", say: "He's drinking juice." }, opts: [{ text: "✓", mark: "tick" }, { text: "✗", mark: "cross" }], answer: 1, fixedOrder: true, fix: "He's drinking lemonade.", after: "He's drinking lemonade." },
            { prompt: { img: "sc-sue-chocolate", say: "She's eating chocolate." }, opts: [{ text: "✓", mark: "tick" }, { text: "✗", mark: "cross" }], answer: 0, fixedOrder: true },
            { prompt: { img: "sc-tony-ice-cream", say: "He's drinking ice cream." }, opts: [{ text: "✓", mark: "tick" }, { text: "✗", mark: "cross" }], answer: 1, fixedOrder: true, fix: "He's eating ice cream.", after: "He's eating ice cream." },
            { prompt: { img: "sc-pat-water", say: "She's drinking water." }, opts: [{ text: "✓", mark: "tick" }, { text: "✗", mark: "cross" }], answer: 0, fixedOrder: true },
            { prompt: { img: "sc-bill-sweets", say: "He's eating chocolate." }, opts: [{ text: "✓", mark: "tick" }, { text: "✗", mark: "cross" }], answer: 1, fixedOrder: true, fix: "He's eating sweets.", after: "He's eating sweets." },
            { prompt: { img: "sc-sue-juice", say: "She's drinking juice." }, opts: [{ text: "✓", mark: "tick" }, { text: "✗", mark: "cross" }], answer: 0, fixedOrder: true }
          ] },
        /* P2 · Speaking — Snack Machine (DLP Ex6): spin → person + item → full sentence, eating or drinking checked */
        { type: "lid", id: "g-p2", skill: "S", title: "Snack Machine", style: "slot", checkVerb: true,
          intro: "Spin the Snack Machine! Look and say the full sentence. Eating or drinking?",
          boys: ["who-bill", "who-tony"], girls: ["who-pat", "who-sue"], me: "i-hand",
          foods: ["lemonade", "ice-cream", "milk", "chocolate", "juice", "cake", "water", "sweets"],
          subjects: ["he", "she", "i", "she", "he", "i"] },
        { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "👂 Silly or not?"], ["g-p2", "🎰 Snack Machine"]] }
      ]
    },

    /* ============================ FUNCTIONAL LANGUAGE ============================ */
    {
      id: "fl", name: "Let's Talk",
      steps: [
        { type: "watch", id: "f-watch", title: "Is she drinking juice?",
          cues: [
            { scene: "sc-pat-juice", line: { text: "Look at Pat." } },
            { scene: "sc-pat-juice", strip: "<span class='q'>Is she drinking juice?</span>", line: { text: "Is she drinking juice?" } },
            { scene: "sc-pat-juice", strip: "<span class='q'>Is she drinking juice?</span><br><b>Yes, she is.</b>", line: { text: "Yes, she is.", who: "kim" } },
            { scene: "sc-pat-juice", strip: "<span class='q'>Is she drinking lemonade?</span>", line: { text: "Is she drinking lemonade?" } },
            { scene: "sc-pat-juice", strip: "<span class='q'>Is she drinking lemonade?</span><br><b class='m'>No, she isn't.</b>", line: { text: "No, she isn't.", who: "kim" } },
            { scene: "sc-tony-cake", strip: "<span class='q'>Is he eating cake?</span><br><b>Yes, he is.</b>", line: { text: "Is he eating cake? Yes, he is." } },
            { scene: "sc-tony-cake", strip: "<span class='q'>Is he drinking milk?</span><br><b class='m'>No, he isn't.</b>", line: { text: "Is he drinking milk? No, he isn't." } },
            { scene: "scene-street5", strip: "<b>Yes</b>, he / she <b>is</b>.<br><b class='m'>No</b>, he / she <b class='m'>isn't</b>.",
              line: { text: "Answer with yes or no. Not just the food! Now tap and listen!" } }
          ] },
        { type: "qa", id: "f-explore", title: "Ask and answer", instruction: "Tap a card. Listen to the question and the answer.",
          cards: [
            { img: "sc-pat-juice", q: "Is she drinking juice?", a: "Yes, she is.", chunk: "Yes," },
            { img: "sc-pat-juice", q: "Is she drinking lemonade?", a: "No, she isn't.", chunk: "No," },
            { img: "sc-tony-cake", q: "Is he eating cake?", a: "Yes, he is.", chunk: "Yes," },
            { img: "sc-tony-cake", q: "Is he drinking milk?", a: "No, he isn't.", chunk: "No," }
          ] },
        /* P1 · Listening — Listen and circle (DLP Ex8 idea): the "No" rules one item out, the "Yes" gives the answer */
        { type: "choose", id: "f-p1", skill: "L", title: "Yes or no?",
          intro: "Listen. Yes or no? Tap what he or she is eating or drinking!",
          items: [
            { prompt: { img: "who-sue", say: ["Is Sue drinking milk?", { text: "No, she isn't.", who: "kim" }, "Is she drinking water?", { text: "Yes, she is.", who: "kim" }] },
              opts: [{ img: "item-water" }, { img: "item-milk" }, { img: "item-juice" }], answer: 0 },
            { prompt: { img: "who-tony", say: ["Is Tony eating chocolate?", { text: "Yes, he is.", who: "kim" }, "Is he eating sweets?", { text: "No, he isn't.", who: "kim" }] },
              opts: [{ img: "item-chocolate" }, { img: "item-sweets" }, { img: "item-cake" }], answer: 0 },
            { prompt: { img: "who-pat", say: ["Is Pat drinking lemonade?", { text: "No, she isn't.", who: "kim" }, "Is she drinking juice?", { text: "Yes, she is.", who: "kim" }] },
              opts: [{ img: "item-juice" }, { img: "item-lemonade" }, { img: "item-milk" }], answer: 0 },
            { prompt: { img: "who-bill", say: ["Is Bill eating cake?", { text: "No, he isn't.", who: "kim" }, "Is he eating ice cream?", { text: "Yes, he is.", who: "kim" }] },
              opts: [{ img: "item-ice-cream" }, { img: "item-cake" }, { img: "item-chocolate" }], answer: 0 },
            { prompt: { img: "may", say: ["Is May drinking water?", { text: "Yes, she is.", who: "kim" }, "Is she drinking milk?", { text: "No, she isn't.", who: "kim" }] },
              opts: [{ img: "item-water" }, { img: "item-milk" }, { img: "item-lemonade" }], answer: 0 }
          ] },
        /* P2 · Speaking — Look, listen and answer (DLP HW Ex2): short answers only */
        { type: "answer", id: "f-p2", skill: "S", title: "Yes or no? Say it!",
          intro: "Kim asks a question. Answer: Yes, she is… or No, she isn't!",
          items: [
            { s: "he",  img: "sc-bill-water",     q: "Is he drinking milk?",      short: "No, he isn't.",  foods: ["water"],     trayImg: "item-water" },
            { s: "she", img: "sc-sue-cake",       q: "Is she eating cake?",       short: "Yes, she is.",   foods: ["cake"],      trayImg: "item-cake" },
            { s: "he",  img: "sc-tony-lemonade",  q: "Is he drinking lemonade?",  short: "Yes, he is.",    foods: ["lemonade"],  trayImg: "item-lemonade" },
            { s: "she", img: "sc-pat-sweets",     q: "Is she eating chocolate?",  short: "No, she isn't.", foods: ["sweets"],    trayImg: "item-sweets" },
            { s: "he",  img: "sc-tony-chocolate", q: "Is he eating chocolate?",   short: "Yes, he is.",    foods: ["chocolate"], trayImg: "item-chocolate" },
            { s: "she", img: "sc-sue-milk",       q: "Is she drinking juice?",    short: "No, she isn't.", foods: ["milk"],      trayImg: "item-milk" }
          ] },
        { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "👂 Yes or no?"], ["f-p2", "💬 Answer Kim"]] }
      ]
    }
  ]
};
