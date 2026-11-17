/* EXPLORE Homework — Lesson pack
 * Unit I · Lesson 2 — What Are They Eating? (Reading & Writing)
 * DLP: WHW EXPLORE › tab I2. Skills R, W only (decision #34): no listening/speaking practice here.
 * Audio in reading/writing practice plays only AFTER the answer (decision #36).
 * All pictures come from I1 (same foods, same Food Street).
 */
(function () {
  const W = {
    bread:     { label: "bread",     spell: "br[ea]d",     img: "food-bread",     audio: "word-bread" },
    egg:       { label: "an egg",    spell: "an e[gg]",    img: "food-egg",       audio: "word-egg" },
    meatballs: { label: "meatballs", spell: "meat[balls]", img: "food-meatballs", audio: "word-meatballs" },
    sausage:   { label: "a sausage", spell: "a s[au]sage", img: "food-sausage",   audio: "word-sausage" },
    burger:    { label: "a burger",  spell: "a b[ur]ger",  img: "food-burger",    audio: "word-burger" },
    chips:     { label: "chips",     spell: "[ch]ips",     img: "food-chips",     audio: "word-chips" },
    rice:      { label: "rice",      spell: "ri[ce]",      img: "food-rice",      audio: "word-rice" },
    chicken:   { label: "chicken",   spell: "[ch]i[ck]en", img: "food-chicken",   audio: "word-chicken" },
    fish:      { label: "fish",      spell: "fi[sh]",      img: "food-fish",      audio: "word-fish" },
    meat:      { label: "meat",      spell: "m[ea]t",      img: "food-meat",      audio: "word-meat" }
  };
  /* STS Insights: confusable pairs → distractors */
  const CONF = { meat: "meatballs", meatballs: "meat", burger: "sausage", sausage: "burger", chicken: "fish", fish: "chicken", rice: "bread", bread: "rice", egg: "rice", chips: "sausage" };
  const others = (w, n) => Object.keys(W).filter((x) => x !== w && x !== CONF[w]).sort(() => Math.random() - 0.5).slice(0, n);
  /* read a chunk → pick its picture (right one + its confusable + one more) */
  const readPick = (w) => {
    const ids = [w, CONF[w], ...others(w, 1)];
    return { prompt: { text: W[w].label, say: { word: w } }, opts: ids.map((x) => ({ img: W[x].img })), answer: 0, tray: W[w].img };
  };
  const TICK = { text: "✓", mark: "tick" }, CROSS = { text: "✗", mark: "cross" };
  const look = (pic, sent, ok, fix) => ({ prompt: { img: pic, text: sent, say: ok ? sent : fix }, opts: [TICK, CROSS], answer: ok ? 0 : 1, fixedOrder: true, fix: ok ? null : fix, tray: pic });

  window.LESSON = {
    id: "I2",
    unit: "Unit I · Food & drink",
    title: "Read & Write: Food",
    subtitle: "Lesson 2 · What are they eating? (Reading & Writing)",
    skills: ["R", "W"],
    img: "assets/i1/img/",
    aud: "assets/i1/audio/",
    backdrop: "scene-street",
    finishLine: "Hooray! You can read and write the food words!",
    plan: [
      { id: "vocab",   label: "Vocabulary", img: "food-sausage",   awning: "#e5534b" },
      { id: "grammar", label: "Grammar",    img: "g-sue-chicken",  awning: "#e8b33a" },
      { id: "fl",      label: "Let's Talk", img: "fl-pat-egg",     awning: "#4aa3a2" }
    ],
    mapDeco: [{ img: "food-bread", x: 72, y: 6, r: 12 }, { img: "food-fish", x: 6, y: 46, r: -10 }, { img: "food-meatballs", x: 80, y: 80, r: 18 }],
    words: W,
    confusable: CONF,
    street: {
      scene: "scene-main",
      carts: [
        { id: "bread",  name: "Bread cart",  scene: "cart-bread",  foods: ["bread", "egg", "meatballs", "sausage"], hot: { x: 6, y: 11, w: 28, h: 50 } },
        { id: "burger", name: "Burger cart", scene: "cart-burger", foods: ["burger", "chips"], hot: { x: 39, y: 17, w: 22, h: 42 } },
        { id: "rice",   name: "Rice stall",  scene: "cart-rice",   foods: ["rice", "chicken", "fish", "meat"], hot: { x: 66, y: 6, w: 33, h: 56 } }
      ],
      signRice: { chicken: { x: 51, y: 18 }, fish: { x: 65, y: 19 } }
    },

    blocks: [
      /* ============================ VOCABULARY ============================ */
      {
        id: "vocab", name: "Vocabulary",
        steps: [
          { type: "watch", id: "v-watch", title: "Read the food words",
            cues: [
              { scene: "scene-main", line: { text: "Let's read the food words on Food Street!" } },
              { scene: "cart-bread", clear: true, line: { text: "The bread cart." } },
              { scene: "cart-bread", food: "bread", line: { text: "Look! E and A together in bread." }, wordFirst: true },
              { scene: "cart-bread", food: "egg", line: { text: "Egg has two Gs." }, wordFirst: true },
              { scene: "cart-bread", food: "meatballs", line: { text: "Meatballs. Meat… and balls!" }, wordFirst: true },
              { scene: "cart-bread", food: "sausage", line: { text: "Sausage. Look at A and U." }, wordFirst: true },
              { scene: "cart-burger", clear: true, line: { text: "The burger cart." } },
              { scene: "cart-burger", food: "burger", line: { text: "Burger. Look at U and R." }, wordFirst: true },
              { scene: "cart-burger", food: "chips", line: { text: "Chips starts with C and H." }, wordFirst: true },
              { scene: "cart-rice", clear: true, line: { text: "The rice stall." } },
              { scene: "cart-rice", food: "rice", line: { text: "Rice. C and E at the end." }, wordFirst: true },
              { scene: "cart-rice", food: "chicken", line: { text: "Chicken. C and H at the start. C and K in the middle." }, wordFirst: true },
              { scene: "cart-rice", food: "fish", line: { text: "Fish ends with S and H." }, wordFirst: true },
              { scene: "cart-rice", food: "meat", line: { text: "Meat has E and A, too. Listen: bread… meat. Different sounds!" }, wordFirst: true },
              { scene: "scene-main", clear: true, line: { text: "Now tap a cart. Read and listen!" } }
            ] },
          { type: "explore", id: "v-explore", title: "Read on the carts", instruction: "Tap a cart. Read the word, then tap and listen.", readyWhen: "always" },

          /* P1 · Reading — Read & Match (DLP Ex4/Ex5): confusable foods side by side */
          { type: "choose", id: "v-p1", skill: "R", title: "Read & match",
            intro: "Read the word. Tap the right picture!",
            items: ["meatballs", "meat", "sausage", "burger", "chicken", "fish", "rice", "bread"].map(readPick) },

          /* P2 · Writing — Letter Chopsticks (DLP Ex6): the missing letters are at the tricky part */
          { type: "spell", id: "v-p2", skill: "W", title: "Missing letters",
            intro: "Look at the gap. Tap the missing letters!",
            items: [
              { word: "bread", gaps: [2, 3], decoys: "i" },
              { word: "chicken", gaps: [3, 4], decoys: "s" },
              { word: "fish", gaps: [2, 3], decoys: "c" },
              { word: "burger", gaps: [1, 2], decoys: "e" },
              { word: "sausage", gaps: [1, 2], decoys: "o" },
              { word: "egg", gaps: [1, 2], decoys: "k" },
              { word: "rice", gaps: [2, 3], decoys: "s" },
              { word: "meat", gaps: [1, 2], decoys: "i" }
            ] },

          /* P3 · Writing — Look at the letters (Starters R&W Part 3) */
          { type: "spell", id: "v-p3", skill: "W", title: "Mixed-up letters",
            intro: "The letters are mixed up. Tap them in the right order!",
            items: [{ word: "chips", gaps: "all" }, { word: "meatballs", gaps: "all" }, { word: "chicken", gaps: "all" }, { word: "burger", gaps: "all" }, { word: "bread", gaps: "all" }] },

          { type: "recap", id: "v-recap", title: "Your food words", heading: "Food words to read",
            scores: [["v-p1", "📖 Read & match"], ["v-p2", "✏️ Missing letters"], ["v-p3", "🔤 Mixed-up letters"]] }
        ]
      },

      /* ============================ GRAMMAR ============================ */
      {
        id: "grammar", name: "Grammar",
        steps: [
          { type: "watch", id: "g-watch", title: "Read the sentences",
            cues: [
              { scene: "g-bill-burger", line: { text: "Let's read the sentences! This is Bill." } },
              { scene: "g-bill-burger", strip: "<b>He is</b> <b class='m'>eating</b> a burger.", line: { text: "He is eating a burger." } },
              { scene: "g-bill-burger", strip: "<b>He is</b> <b class='m'>e<u>a</u>ting</b> a burger.", line: { text: "Eating. E, A, T… then I, N, G." } },
              { scene: "g-sue-chicken", strip: "<b>She is</b> <b class='m'>eating</b> chicken.", line: { text: "She is eating chicken." } },
              { scene: "g-sue-chicken", strip: "<b>She is</b> eating chicken. = <b>She's</b> eating chicken.", line: { text: "She is… she's. You can write both!" } },
              { scene: "scene-street", dim: true, actors: [{ img: "g-girl-plate", x: 20, y: 30, w: 34 }, { img: "food-meatballs", x: 31.5, y: 64, w: 11 }],
                bubble: { text: "I am eating meatballs!", x: 52, y: 42 }, strip: "<b><u>I</u> am</b> eating meatballs.", line: { text: "I am eating meatballs.", who: "kim" } },
              { scene: "scene-street", dim: true, actors: [{ img: "g-girl-plate", x: 20, y: 30, w: 34 }, { img: "food-meatballs", x: 31.5, y: 64, w: 11 }],
                strip: "<b><u>I</u></b> → always a big letter!", line: { text: "I is always a big letter!" } },
              { scene: "scene-street", strip: "<b>He is</b> eating …<br><b>She is</b> eating …<br><b>I am</b> eating …", line: { text: "He is eating. She is eating. I am eating. Now tap and listen!" } }
            ] },
          { type: "chunks", id: "g-explore", title: "Tap and read", instruction: "Tap a card and listen.",
            cards: [
              { chunk: "He's eating", img: "g-bill-burger", full: "He is eating a burger.", short: "He's eating a burger.", rest: "a burger." },
              { chunk: "She's eating", img: "g-sue-chicken", full: "She is eating chicken.", short: "She's eating chicken.", rest: "chicken." },
              { chunk: "I'm eating", img: "g-girl-plate", food: "food-meatballs", full: "I am eating meatballs.", short: "I'm eating meatballs.", rest: "meatballs.", who: "kim" }
            ] },

          /* P1 · Reading — Look and read ✓ / ✗ (Starters R&W Part 1; DLP HW Ex1). Wrong ones: confusable food or wrong person. */
          { type: "choose", id: "g-p1", skill: "R", title: "Look and read", layout: "mark",
            intro: "Look and read. Is it right? Tap tick or cross!",
            items: [
              look("hw-q4a", "He is eating rice.", true),
              look("hw-q1b", "She is eating meatballs.", false, "She is eating meat."),
              look("hw-q2b", "He is eating a burger.", true),
              look("hw-q3c", "She is eating chicken.", false, "She is eating fish."),
              look("hw-q4b", "He is eating rice.", false, "He is eating bread."),
              look("hw-q5b", "She is eating an egg.", true),
              look("hw-q2a", "She is eating a sausage.", false, "He is eating a sausage.")
            ] },

          /* P2 · Writing — Build a Burger (DLP Ex7): bun = He is / She is / I am · patty = eating · bun = food */
          { type: "build", id: "g-p2", skill: "W", title: "Build a burger", style: "burger",
            intro: "Look at the picture. Build the burger sentence!",
            items: [
              { img: "hw-p3", tiles: ["She is", "eating", "an egg."], decoys: ["He is", "egg."], whyWrong: { "egg.": "An egg!" } },
              { img: "hw-q4a", tiles: ["He is", "eating", "rice."], decoys: ["He", "eat"], whyWrong: { "He": "He is!", "eat": "Eating!" } },
              { img: "hw-q1c", tiles: ["He is", "eating", "meatballs."], decoys: ["She is", "meat."] },
              { img: "hw-q2c", tiles: ["She is", "eating", "a burger."], decoys: ["She", "a sausage."], whyWrong: { "She": "She is!" } },
              { imgs: ["i-hand", "food-chips"], tiles: ["I am", "eating", "chips."], decoys: ["i am", "He is"], whyWrong: { "i am": "I is always a big letter!" }, who: "kim", tray: "food-chips" },
              { img: "hw-q3b", tiles: ["He is", "eating", "fish."], decoys: ["eatting", "She is"] }
            ] },
          { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "📖 Look and read"], ["g-p2", "🍔 Build a burger"]] }
        ]
      },

      /* ======================= FUNCTIONAL LANGUAGE (short R&W review — decision #35) ======================= */
      {
        id: "fl", name: "Let's Talk",
        steps: [
          { type: "qa", id: "f-explore", title: "Questions and answers", instruction: "Tap a card. Read the question and the answer.",
            cards: [
              { img: "fl-tony-chips", q: "What is he eating?", a: "He's eating chips.", chunk: "He's eating" },
              { img: "fl-pat-egg", q: "What is she eating?", a: "She's eating an egg.", chunk: "She's eating" },
              { img: "g-girl-plate", food: "food-rice", q: "What are you eating?", a: "I'm eating rice.", chunk: "I'm eating" }
            ] },
          /* P1 · Reading — Read and match (DLP Ex8, HW Ex4): wrong answers differ in one thing (he / she / I, or a confusable food) */
          { type: "choose", id: "f-p1", skill: "R", title: "Read and match", layout: "stack",
            intro: "Read the question. Tap the right answer!",
            items: [
              { prompt: { img: "hw-p4", text: "What is he eating?", say: ["What is he eating?", "He is eating chicken."] },
                opts: [{ text: "He is eating chicken." }, { text: "She is eating chicken." }, { text: "He is eating fish." }], answer: 0 },
              { prompt: { img: "hw-q1a", text: "What is she eating?", say: ["What is she eating?", "She is eating meatballs."] },
                opts: [{ text: "She is eating meatballs." }, { text: "She is eating meat." }, { text: "I am eating meatballs." }], answer: 0 },
              { prompt: { imgs: ["i-hand", "food-sausage"], text: "What are you eating?", say: ["What are you eating?", { text: "I am eating a sausage.", who: "kim" }] },
                opts: [{ text: "I am eating a sausage." }, { text: "He is eating a sausage." }, { text: "I am eating a burger." }], answer: 0, tray: "food-sausage" },
              { prompt: { img: "hw-q4c", text: "What is she eating?", say: ["What is she eating?", "She is eating rice."] },
                opts: [{ text: "She is eating rice." }, { text: "She is eating bread." }, { text: "He is eating rice." }], answer: 0 },
              { prompt: { img: "hw-q6b", text: "What is he eating?", say: ["What is he eating?", "He is eating fish."] },
                opts: [{ text: "He is eating fish." }, { text: "He is eating chicken." }, { text: "I am eating fish." }], answer: 0 }
            ] },
          { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "📖 Read and match"]] }
        ]
      }
    ]
  };
})();
