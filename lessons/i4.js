/* EXPLORE Homework — Lesson pack
 * Unit I · Lesson 4 — Drinks & Desserts (Reading & Writing)
 * DLP: WHW EXPLORE › tab I4. Skills R, W only. Pictures + word audio reuse I3 (same Set 2).
 * Audio in reading/writing practice plays only AFTER the answer (decision #36).
 */
(function () {
  const W = {
    water:       { label: "water",     spell: "wat[er]",       img: "item-water",     audio: "word-water",     verb: "drinking" },
    milk:        { label: "milk",      spell: "mi[lk]",        img: "item-milk",      audio: "word-milk",      verb: "drinking" },
    juice:       { label: "juice",     spell: "j[ui][ce]",     img: "item-juice",     audio: "word-juice",     verb: "drinking" },
    lemonade:    { label: "lemonade",  spell: "lemon[a]d[e]",  img: "item-lemonade",  audio: "word-lemonade",  verb: "drinking" },
    cake:        { label: "cake",      spell: "c[a]k[e]",      img: "item-cake",      audio: "word-cake",      verb: "eating" },
    "ice-cream": { label: "ice cream", spell: "i[ce] cr[ea]m", img: "item-ice-cream", audio: "word-ice-cream", verb: "eating" },
    chocolate:   { label: "chocolate", spell: "ch[o]c[o]late", img: "item-chocolate", audio: "word-chocolate", verb: "eating" },
    sweets:      { label: "sweets",    spell: "sw[ee]ts",      img: "item-sweets",    audio: "word-sweets",    verb: "eating" }
  };
  const CONF = { juice: "lemonade", lemonade: "juice", water: "milk", milk: "water", sweets: "chocolate", chocolate: "sweets", cake: "ice-cream", "ice-cream": "cake" };
  const others = (w, n) => Object.keys(W).filter((x) => x !== w && x !== CONF[w]).sort(() => Math.random() - 0.5).slice(0, n);
  const readPick = (w) => ({ prompt: { text: W[w].label, say: { word: w } }, opts: [w, CONF[w], ...others(w, 1)].map((x) => ({ img: W[x].img })), answer: 0, tray: W[w].img });
  /* picture → 3 spellings; the wrong ones are the way STS write it (one place different) */
  const spot = (w, wrong) => ({ prompt: { img: W[w].img, say: { word: w } }, opts: [W[w].label, ...wrong].map((t) => ({ text: t })), answer: 0, tray: W[w].img });
  const yn = (pic, sent, ok, fix) => ({ prompt: { img: pic, text: sent, say: ok ? sent : fix }, opts: [{ text: "yes" }, { text: "no" }], answer: ok ? 0 : 1, fixedOrder: true, fix: ok ? null : fix, tray: pic });

  window.LESSON = {
    id: "I4",
    unit: "Unit I · Food & drink",
    title: "Read & Write: Drinks & Desserts",
    subtitle: "Lesson 4 · Drinks & Desserts (Reading & Writing)",
    skills: ["R", "W"],
    img: "assets/i3/img/",
    aud: "assets/i3/audio/",
    backdrop: "scene-street5",
    finishLine: "Hooray! You can read and write drinks and desserts!",
    plan: [
      { id: "vocab",   label: "Vocabulary", img: "item-chocolate", frame: "cart-dessert",   awning: "#e5534b" },
      { id: "grammar", label: "Grammar",    img: "sc-bill-water",    awning: "#e8b33a" },
      { id: "fl",      label: "Let's Talk", img: "sc-sue-ice-cream", awning: "#4aa3a2" }
    ],
    /* v3 (2026-11-18): focus = what each scene picture is about, in % of the picture {x,y,w,h} — the Watch camera keeps it in view
     * and Explore cards centre on it; frame = the picture on the roadmap milestone of a part. */
    focus: (function () {
      const f = { "cart-drinks": { x: 30, y: 4, w: 42, h: 84 }, "cart-dessert": { x: 28, y: 2, w: 46, h: 86 } };
      const who = { sue: { x: 12, y: 4, w: 50, h: 90 }, tony: { x: 15, y: 4, w: 52, h: 90 }, bill: { x: 16, y: 4, w: 48, h: 90 }, pat: { x: 14, y: 4, w: 54, h: 90 } };
      ["water", "milk", "juice", "lemonade", "cake", "ice-cream", "chocolate", "sweets"].forEach((d) => Object.keys(who).forEach((k) => { f["sc-" + k + "-" + d] = who[k]; }));
      return f;
    })(),
    mapDeco: [{ img: "item-juice", x: 72, y: 6, r: 12 }, { img: "item-cake", x: 6, y: 46, r: -10 }, { img: "item-milk", x: 80, y: 80, r: 18 }],
    words: W,
    confusable: CONF,
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
          { type: "watch", id: "v-watch", title: "Read the words",
            cues: [
              { scene: "scene-street5", line: { text: "Let's read the drinks and desserts. No A, no AN!" } },
              { scene: "cart-drinks", clear: true, line: { text: "The drinks cart." } },
              { scene: "cart-drinks", food: "water", line: { text: "Water ends with E and R." }, wordFirst: true },
              { scene: "cart-drinks", food: "milk", line: { text: "Milk ends with L and K." }, wordFirst: true },
              { scene: "cart-drinks", food: "juice", line: { text: "Juice. U and I… then C and E." }, wordFirst: true },
              { scene: "cart-drinks", food: "lemonade", line: { text: "Lemonade. Lemon… ade. The E at the end is quiet." }, wordFirst: true },
              { scene: "cart-dessert", clear: true, line: { text: "The dessert cart." } },
              { scene: "cart-dessert", food: "cake", line: { text: "Cake. The E at the end is quiet, too." }, wordFirst: true },
              { scene: "cart-dessert", food: "ice-cream", line: { text: "Ice cream is two words!" }, wordFirst: true },
              { scene: "cart-dessert", food: "chocolate", line: { text: "Chocolate. Look at the two Os." }, wordFirst: true },
              { scene: "cart-dessert", food: "sweets", line: { text: "Sweets. Two Es!" }, wordFirst: true },
              { scene: "scene-street5", clear: true, line: { text: "Now tap a cart. Read and listen!" } }
            ] },
          { type: "explore", id: "v-explore", title: "Read on the carts", instruction: "Tap a cart. Read the word, then tap and listen.", readyWhen: "always" },
          /* P1 · Reading — Picture Pairs (DLP Ex4) */
          { type: "choose", id: "v-p1", skill: "R", title: "Picture pairs", intro: "Read the word. Tap the right picture!",
            items: ["juice", "lemonade", "water", "milk", "sweets", "chocolate", "cake", "ice-cream"].map(readPick) },
          /* P2 · Spelling — Sticky Spelling (DLP Ex6): which spelling is right? */
          { type: "choose", id: "v-p2", skill: "W", title: "Sticky spelling", layout: "stack", intro: "Look at the picture. Which word is right? Tap it!",
            items: [
              spot("juice", ["juise", "juce"]), spot("chocolate", ["chocolat", "socola"]), spot("sweets", ["sweet", "swits"]),
              spot("lemonade", ["lemonad", "limonade"]), spot("cake", ["cak", "caek"]), spot("milk", ["mik", "miuk"]),
              spot("water", ["wota", "watter"]), spot("ice-cream", ["icecream", "ice crem"])
            ] },
          /* P3 · Writing — Snack Labels (DLP Ex7): missing letters at the tricky part */
          { type: "spell", id: "v-p3", skill: "W", title: "Snack labels", intro: "Write the label. Tap the missing letters!",
            items: [
              { word: "chocolate", gaps: [2, 4], decoys: "a" },
              { word: "juice", gaps: [1, 2], decoys: "s" },
              { word: "lemonade", gaps: [5, 7], decoys: "i" },
              { word: "cake", gaps: [1, 3], decoys: "i" },
              { word: "sweets", gaps: [2, 3], decoys: "i" },
              { word: "ice-cream", gaps: [1, 2, 7], decoys: "s" },
              { word: "milk", gaps: [2, 3], decoys: "u" },
              { word: "water", gaps: [3, 4], decoys: "a" }
            ] },
          { type: "recap", id: "v-recap", title: "Your words", heading: "Drinks & desserts to read",
            scores: [["v-p1", "📖 Picture pairs"], ["v-p2", "🎯 Sticky spelling"], ["v-p3", "✏️ Snack labels"]] }
        ]
      },

      /* ============================ GRAMMAR ============================ */
      {
        id: "grammar", name: "Grammar",
        steps: [
          { type: "watch", id: "g-watch", title: "Two parts, always together",
            cues: [
              { scene: "sc-sue-milk", strip: "<b>She is</b> <b class='m'>drinking</b> milk.", line: { text: "She is drinking milk." } },
              { scene: "sc-sue-milk", strip: "She ___ drinking milk. 😮", line: { text: "Oh no! Something is missing!" } },
              { scene: "sc-sue-milk", strip: "She <b>is</b> drinking milk.", line: { text: "Is! She is drinking milk." } },
              { scene: "sc-bill-ice-cream", strip: "He is eat___ ice cream. 😮", line: { text: "Oh no! Something is missing again!" } },
              { scene: "sc-bill-ice-cream", strip: "He is <b class='m'>eating</b> ice cream.", line: { text: "I, N, G! He is eating ice cream." } },
              { scene: "scene-street5", dim: true, actors: [{ img: "@i1/img/g-girl-plate", x: 20, y: 30, w: 34 }, { img: "item-water", x: 33, y: 57, w: 8 }],
                bubble: { text: "I am drinking water!", x: 52, y: 42 }, strip: "<b><u>I</u> am</b> <b class='m'>drinking</b> water.", line: { text: "I am drinking water.", who: "kim" } },
              { scene: "scene-street5", strip: "<b>is / am</b> + <b class='m'>-ing</b><br>always together!", line: { text: "Is or am… and I, N, G. Always together!" } }
            ] },
          { type: "chunks", id: "g-explore", title: "Tap and read", instruction: "Tap a card and listen.",
            cards: [
              { chunk: "She's drinking", img: "sc-sue-milk", full: "She is drinking milk.", short: "She's drinking milk.", rest: "milk." },
              { chunk: "He's eating", img: "sc-bill-ice-cream", full: "He is eating ice cream.", short: "He's eating ice cream.", rest: "ice cream." },
              { chunk: "I'm drinking", img: "i-hand", food: "item-water", full: "I am drinking water.", short: "I'm drinking water.", rest: "water.", who: "kim" }
            ] },
          /* P1 · Writing — Sentence Doctor (DLP Ex8): each sick sentence has one problem */
          { type: "build", id: "g-p1", skill: "W", title: "Sentence doctor", intro: "Read the sick sentence. What's wrong? Build it the right way!",
            items: [
              { img: "sc-bill-water", sick: "He drinking water.", tiles: ["He is", "drinking", "water."], decoys: ["drink", "He"], whyWrong: { "He": "Something is missing! He is…" } },
              { img: "sc-sue-cake", sick: "She is eat cake.", tiles: ["She is", "eating", "cake."], decoys: ["eat", "drinking"], whyWrong: { "eat": "Eating! I, N, G.", "drinking": "Cake… eating or drinking?" } },
              { img: "sc-tony-juice", sick: "He is drinking a juice.", tiles: ["He is", "drinking", "juice."], decoys: ["a juice.", "eating"], whyWrong: { "a juice.": "No A! Just juice." } },
              { img: "sc-pat-ice-cream", sick: "She is drinking ice cream.", tiles: ["She is", "eating", "ice cream."], decoys: ["drinking", "She"], whyWrong: { "drinking": "Ice cream… eating!" } },
              { imgs: ["i-hand", "item-sweets"], sick: "i am eating sweets.", tiles: ["I am", "eating", "sweets."], decoys: ["i am", "sweet."], whyWrong: { "i am": "I is always a big letter!" }, who: "kim", tray: "item-sweets" },
              { img: "sc-bill-milk", sick: "He is drink milk.", tiles: ["He is", "drinking", "milk."], decoys: ["drink", "eating"], whyWrong: { "drink": "Drinking! I, N, G." } }
            ] },
          /* P2 · Reading — Look and read. Yes or no? (Starters R&W Part 2; DLP HW Ex1) */
          { type: "choose", id: "g-p2", skill: "R", title: "Yes or no?", intro: "Look and read. Yes or no?",
            items: [
              yn("sc-tony-lemonade", "Tony is drinking lemonade.", true),
              yn("sc-sue-chocolate", "Sue is eating sweets.", false, "Sue is eating chocolate."),
              yn("sc-bill-juice", "Bill is drinking juice.", true),
              yn("sc-pat-milk", "Pat is drinking water.", false, "Pat is drinking milk."),
              yn("sc-sue-ice-cream", "Sue is eating ice cream.", true),
              yn("sc-tony-cake", "Tony is eating chocolate.", false, "Tony is eating cake.")
            ] },
          { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "🩺 Sentence doctor"], ["g-p2", "📖 Yes or no?"]] }
        ]
      },

      /* ======================= FUNCTIONAL LANGUAGE (short R&W review — decision #35) ======================= */
      {
        id: "fl", name: "Let's Talk",
        steps: [
          { type: "qa", id: "f-explore", title: "Questions and answers", instruction: "Tap a card. Read the question and the answer.",
            cards: [
              { img: "sc-pat-juice", q: "Is she drinking juice?", a: "Yes, she is.", chunk: "Yes," },
              { img: "sc-pat-juice", q: "Is she drinking lemonade?", a: "No, she isn't.", chunk: "No," },
              { img: "sc-tony-cake", q: "Is he eating cake?", a: "Yes, he is.", chunk: "Yes," },
              { img: "sc-tony-cake", q: "Is he drinking milk?", a: "No, he isn't.", chunk: "No," }
            ] },
          /* P1 · Reading & writing — Read and write the answer (DLP HW Ex4): build the short answer */
          { type: "build", id: "f-p1", skill: "W", title: "Write the answer", intro: "Look at the picture. Read the question. Build the answer!",
            items: [
              { img: "sc-pat-juice", question: "Is she drinking juice?", tiles: ["Yes,", "she", "is."], decoys: ["No,", "she's."], whyWrong: { "she's.": "Yes, she is!" } },
              { img: "sc-tony-cake", question: "Is he drinking milk?", tiles: ["No,", "he", "isn't."], decoys: ["Yes,", "is."] },
              { img: "sc-bill-chocolate", question: "Is he eating chocolate?", tiles: ["Yes,", "he", "is."], decoys: ["he's.", "No,"], whyWrong: { "he's.": "Yes, he is!" } },
              { img: "sc-sue-water", question: "Is she drinking milk?", tiles: ["No,", "she", "isn't."], decoys: ["is.", "Yes,"] },
              { img: "sc-pat-sweets", question: "Is she eating sweets?", tiles: ["Yes,", "she", "is."], decoys: ["she's.", "isn't."], whyWrong: { "she's.": "Yes, she is!" } }
            ] },
          { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "✏️ Write the answer"]] }
        ]
      }
    ]
  };
})();
