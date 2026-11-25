/* EXPLORE Homework — Lesson pack
 * Unit H · Lesson 5 — Integrated Revision: Photo Day (L, S, R, W) · map: HANDOVER.md §3 · DLP: WHW EXPLORE › tab H5
 * All 16 words (Set 1 clothes from H1–H2, Set 2 accessories from H3–H4) · describe it (ONE word: a colour OR clean / dirty) ·
 *   wearing + wearing → one sentence with "and", holding → its own sentence · WHAT → tell me, IS → yes or no.
 * Mental model (slides L5): the Photo Day wardrobe — CLOTHES on the rail, ACCESSORIES on the shelf (shoes, boots and socks too).
 * Pictures: assets/h5/img (slides H5, HTML version: the Photo Day shop, the wardrobe boards, the 16 things natural / in a colour /
 *   clean / dirty, children wearing or holding with the things to say marked by corners, as on the slides). No generated pictures.
 * Reading / Writing steps say the answer only after it is given (decision #36).
 * Voice: lessons/h5.voice.js (Voice Pipeline); words have no `audio` → the engine speaks the label.
 */
(function () {
  /* how the speech engine may hear each thing (lower case, punctuation → space: "T-shirt" → "t shirt") */
  const NS = {
    shirt: ["shirt"], tshirt: ["t shirt", "tshirt", "tee shirt"], jacket: ["jacket"], skirt: ["skirt"], dress: ["dress"],
    trousers: ["trouser"], jeans: ["jean"], shorts: ["short"],
    hat: ["hat"], cap: ["baseball cap", "cap"], handbag: ["handbag", "hand bag"], watch: ["watch"], glasses: ["glass"],
    shoes: ["shoe"], boots: ["boot"], socks: ["sock", "sox"]
  };
  /* group: c = clothes (on the rail) · a = accessories (on the shelf) — the slides' Ex4 board */
  const w = (label, spell, group, verb) => ({ label, spell, group, verb: verb || "wearing" });
  const W = {
    shirt:    w("a shirt",        "a s[h]irt",        "c"),
    tshirt:   w("a T-shirt",      "a [T-]shirt",      "c"),
    jacket:   w("a jacket",       "a ja[ck]et",       "c"),
    skirt:    w("a skirt",        "a s[k]irt",        "c"),
    dress:    w("a dress",        "a dre[ss]",        "c"),
    trousers: w("trousers",       "tr[ou]sers",       "c"),
    jeans:    w("jeans",          "j[ea]ns",          "c"),
    shorts:   w("shorts",         "sho[rt]s",         "c"),
    hat:      w("a hat",          "a h[a]t",          "a"),
    cap:      w("a baseball cap", "a [baseball] cap", "a"),
    handbag:  w("a handbag",      "a hand[bag]",      "a", "holding"),
    watch:    w("a watch",        "a wa[tch]",        "a"),
    glasses:  w("glasses",        "gla[ss]es",        "a"),
    shoes:    w("shoes",          "sh[oe]s",          "a"),
    boots:    w("boots",          "b[oo]ts",          "a"),
    socks:    w("socks",          "so[ck]s",          "a")
  };
  const WORDS16 = Object.keys(W);
  WORDS16.forEach((k) => Object.assign(W[k], { img: "item-" + k, say: NS[k] }));
  /* describe it: "a green T-shirt", "blue trousers" — answer-only words (phrase: no own voice line, not in the recap) */
  const D = (adj, noun, more) => {
    const m = W[noun].label.match(/^a (.+)$/);
    W[adj + "-" + noun] = { label: m ? `a ${adj} ${m[1]}` : `${adj} ${W[noun].label}`, verb: "wearing", phrase: true,
                            say: NS[noun].map((n) => `${adj} ${n}`).concat(more || []) };
    return adj + "-" + noun;
  };
  /* DLP: confusable words — shirt / skirt / T-shirt, shorts / shoes / socks, shoes / boots, trousers / jeans, hat / baseball cap */
  const CONF = { shirt: "skirt", skirt: "shirt", tshirt: "shirt", shorts: "shoes", shoes: "socks", socks: "shoes", boots: "shoes",
                 trousers: "jeans", jeans: "trousers", hat: "cap", cap: "hat", handbag: "hat", watch: "glasses", glasses: "watch",
                 jacket: "shirt", dress: "skirt" };
  const I = (k) => "item-" + k;
  /* Listening Maze: hear one thing → 1 of 3 pictures (the two confusable ones are always there) */
  const maze = (say, k, a, b) => ({ say, opts: [I(k), I(a), I(b)], answer: 0 });
  /* Look and Choose (Ex5): read the phrase → A or B; the two pictures differ in ONE thing */
  const ab = (text, right, wrong) => ({ prompt: { text, say: text }, opts: [{ img: right }, { img: wrong }], answer: 0, tray: right });
  /* Ring and Describe: what is he / she wearing (and) — holding (a new sentence) */
  const desc = (img, s, wear, hold) => {
    const P = s === "he" ? "he" : "she";
    const q = wear && hold ? `What is ${P} wearing and holding?` : wear ? `What is ${P} wearing?` : `What is ${P} holding?`;
    return { s, img, q, parts: [].concat(wear ? [{ verb: "wearing", foods: wear }] : [], hold ? [{ verb: "holding", foods: hold }] : []) };
  };
  const YES = (s) => (s === "he" ? "Yes, he is." : "Yes, she is."), NO = (s) => (s === "he" ? "No, he isn't." : "No, she isn't.");
  const isQ = (img, s, q, yes) => ({ s, img, q, short: yes ? YES(s) : NO(s) });
  /* Does it match? (question ↔ answer form; "Yes, she's." is the STS Insights error) */
  const TICK = { text: "✓", mark: "tick" }, CROSS = { text: "✗", mark: "cross" };
  const match = (img, q, a, ok, fix) => ({ prompt: { img, say: [q, { text: a, who: "kim" }] }, opts: [TICK, CROSS], answer: ok ? 0 : 1, fixedOrder: true, fix: ok ? null : fix, tray: img });
  const pair = (a, b) => [{ img: a, x: 10, y: 18, w: 34 }, { img: b, x: 56, y: 18, w: 34 }];
  const one = (a) => [{ img: a, x: 33, y: 16, w: 34 }];
  const BOARD = "board-words";

  window.LESSON = {
    id: "H5",
    unit: "Unit H · Clothes",
    title: "Photo Day",
    subtitle: "Lesson 5 · Integrated revision",
    skills: ["L", "S", "R", "W"],
    img: "assets/h5/img/",
    aud: "assets/h5/audio/",
    finishLine: "Hooray! Say cheese! You finished Photo Day!",
    plan: [
      { id: "vocab",   label: "Vocabulary", img: "item-jacket", frame: "scene-wardrobe", awning: "#e5534b" },
      { id: "grammar", label: "Grammar",    img: "pic-grace-2",                          awning: "#e8b33a" },
      { id: "fl",      label: "Let's Talk", img: "pic-jill-1",                           awning: "#4aa3a2" }
    ],
    mapDeco: [{ img: "item-tshirt-red", x: 72, y: 6, r: 12 }, { img: "item-cap-green", x: 6, y: 46, r: -10 }, { img: "item-boots-red", x: 80, y: 80, r: 18 }],
    words: W,
    confusable: CONF,

    blocks: [
      /* ============================ VOCABULARY ============================ */
      {
        id: "vocab", name: "Vocabulary",
        steps: [
          /* H5-S1: Photo Day at Manny's shop, one thing circled at a time → the wardrobe: clothes on the rail, accessories on the shelf */
          { type: "watch", id: "v-watch", title: "It's Photo Day!",
            cues: [
              { scene: "scene-main", line: { text: "It's Photo Day at Manny's shop! What are they wearing?" } },
              { scene: "photo-shirt", strip: "a shirt", line: { text: "Look at Matt. A shirt." } },
              { scene: "photo-dress", strip: "a dress", line: { text: "Look at Grace. A dress." } },
              { scene: "photo-shoes", strip: "shoes", line: { text: "Shoes. No A!" } },
              { scene: "photo-jeans", strip: "jeans", line: { text: "Jeans. No A!" } },
              { scene: BOARD, strip: "<b>CLOTHES</b><br>a shirt · a T-shirt · a jacket · a skirt · a dress · trousers · jeans · shorts",
                line: { text: "These are clothes. A shirt, a T-shirt, a jacket, a skirt, a dress. Trousers, jeans, shorts." } },
              { scene: BOARD, strip: "<b>ACCESSORIES</b><br>a hat · a baseball cap · a handbag · a watch · glasses · <b class='m'>shoes · boots · socks</b>",
                line: { text: "These are accessories. A hat, a baseball cap, a handbag, a watch, glasses. Shoes, boots and socks too!" } },
              { scene: BOARD, strip: "s<b>h</b>irt · s<b>k</b>irt · <b>T-</b>shirt<br>sh<b>or</b>ts · sh<b>oe</b>s · so<b>ck</b>s",
                line: { text: "Shirt, skirt, T-shirt. Shorts, shoes, socks. Listen carefully!" } }
            ] },

          /* P1 · Listening — Listening Maze (Ex2): hear the thing, find it; the confusable pictures are always there */
          { type: "pick", id: "v-p1", skill: "L", title: "Listening Maze",
            intro: "Listen. Tap the right picture! Listen carefully: shirt or skirt?",
            items: [
              maze("a skirt", "skirt", "shirt", "tshirt"),
              maze("socks", "socks", "shoes", "shorts"),
              maze("a baseball cap", "cap", "hat", "handbag"),
              maze("trousers", "trousers", "jeans", "shorts"),
              maze("shorts", "shorts", "shoes", "socks"),
              maze("a shirt", "shirt", "skirt", "tshirt"),
              maze("boots", "boots", "shoes", "socks"),
              maze("a handbag", "handbag", "hat", "watch")
            ] },

          /* P2 · Reading — My Wardrobe (Ex4 board): read the word, put it on the rail or the shelf */
          { type: "sort", id: "v-p2", skill: "R", title: "My Wardrobe", showWords: true,
            intro: "Read the word. Clothes or accessories? Tap the right place in the wardrobe!",
            trays: [{ id: "c", label: "Clothes", start: "shirt", say: "These are clothes." },
                    { id: "a", label: "Accessories", start: "hat", say: "These are accessories." }],
            items: ["tshirt", "glasses", "jeans", "socks", "dress", "cap", "shorts", "shoes", "jacket", "boots"],
            after: ["Shoes, boots and socks are accessories!"], doneLine: "Well done!" },

          /* P3 · Writing — Write it (My Wardrobe: write the word under the picture): the tricky letters of the confusable words */
          { type: "spell", id: "v-p3", skill: "W", title: "Write it",
            intro: "Look at the picture. Tap the missing letters!",
            items: [
              { word: "shirt", gaps: [1], decoys: "k" },          /* s_irt */
              { word: "skirt", gaps: [1], decoys: "h" },          /* s_irt */
              { word: "shorts", gaps: [3, 4], decoys: "e" },      /* sho__s */
              { word: "shoes", gaps: [2, 3], decoys: "r" },       /* sh__s */
              { word: "socks", gaps: [2, 3], decoys: "x" },       /* so__s */
              { word: "trousers", gaps: [2, 3], decoys: "a" },    /* tr__sers */
              { word: "jeans", gaps: [1, 2], decoys: "i" },       /* j__ns */
              { word: "watch", gaps: [2, 3, 4], decoys: "s" }     /* wa___ */
            ] },

          { type: "recap", id: "v-recap", title: "Your Photo Day words", heading: "Clothes and accessories", words: WORDS16,
            scores: [["v-p1", "👂 Listening Maze"], ["v-p2", "🗄️ My Wardrobe"], ["v-p3", "✏️ Write it"]] }
        ]
      },

      /* ============================ GRAMMAR ============================ */
      {
        id: "grammar", name: "Grammar",
        steps: [
          /* H5-S2: describe it (ONE word: a colour OR clean / dirty), then the sentence frames */
          { type: "watch", id: "g-watch", title: "Describe it!",
            cues: [
              { scene: BOARD, dim: true, actors: one("item-tshirt-outline"), strip: "a T-shirt", line: { text: "A T-shirt." } },
              { scene: BOARD, dim: true, actors: pair("item-tshirt-red", "item-tshirt-dirty"),
                strip: "a <b>red</b> T-shirt · a <b class='m'>dirty</b> T-shirt", line: { text: "A red T-shirt. A dirty T-shirt." } },
              { scene: BOARD, dim: true, actors: pair("item-jeans-blue", "item-jeans-clean"),
                strip: "<b>blue</b> jeans · <b class='m'>clean</b> jeans", line: { text: "Blue jeans. Clean jeans. No A!" } },
              { scene: BOARD, dim: true, actors: pair("item-hat-red", "item-hat-dirty"),
                strip: "<s>a red dirty hat</s> → one word only!", line: { text: "A red dirty hat? No! A red hat, or a dirty hat. One word only!" } },
              { scene: "pic-matt-1", strip: "He's <b>wearing</b> a blue T-shirt.", line: { text: "Look at Matt. What is he wearing? He's wearing a blue T-shirt." } },
              { scene: "pic-matt-2", strip: "He's <b>wearing</b> a blue T-shirt <b class='m'>and</b> dirty jeans.", line: { text: "He's wearing a blue T-shirt and dirty jeans." } },
              { scene: "pic-grace-1", strip: "She's <b>wearing</b> a pink skirt <b class='m'>and</b> black shoes.", line: { text: "Look at Grace. She's wearing a pink skirt and black shoes." } },
              { scene: "pic-grace-2", strip: "She's <b>holding</b> a dirty handbag.", line: { text: "And the handbag? She's holding a dirty handbag. A new sentence!" } },
              { scene: "board-verbs", strip: "wearing + wearing → <b>and</b><br>holding → <b class='m'>a new sentence</b>",
                line: { text: "Two things she's wearing… one sentence with and. The thing she's holding… a new sentence!" } }
            ] },
          { type: "chunks", id: "g-explore", title: "Tap and read", instruction: "Tap a card and listen.",
            cards: [
              { chunk: "He's wearing", img: "pic-matt-2", full: "He is wearing a blue T-shirt and dirty jeans.", short: "He's wearing a blue T-shirt and dirty jeans.", rest: "a blue T-shirt and dirty jeans." },
              { chunk: "She's wearing", img: "pic-grace-1", full: "She is wearing a pink skirt and black shoes.", short: "She's wearing a pink skirt and black shoes.", rest: "a pink skirt and black shoes." },
              { chunk: "She's holding", img: "pic-grace-2", full: "She is holding a dirty handbag.", short: "She's holding a dirty handbag.", rest: "a dirty handbag." }
            ] },

          /* P1 · Reading — Look and Choose (Ex5 rounds 1–2): A or B, the pictures differ in ONE thing */
          { type: "choose", id: "g-p1", skill: "R", title: "Look and Choose",
            intro: "Read. Look at the two pictures. Which one is it?",
            items: [
              ab("a dirty shirt", "item-shirt-dirty", "item-shirt-clean"),
              ab("blue jeans", "item-jeans-blue", "item-trousers-blue"),
              ab("a pink skirt", "item-skirt-pink", "item-shirt-pink"),
              ab("a clean hat", "item-hat-clean", "item-hat-dirty"),
              ab("a green baseball cap", "item-cap-green", "item-hat-green"),
              ab("red boots", "item-boots-red", "item-shoes-red"),
              ab("clean socks", "item-socks-clean", "item-socks-dirty"),
              ab("black trousers", "item-trousers-black", "item-trousers-blue")
            ] },

          /* P2 · Speaking — Ring and Describe (Ex7): the verb is checked; wearing things with "and", the held thing in its own sentence */
          { type: "answer", id: "g-p2", skill: "S", title: "Ring and Describe", checkVerb: true,
            verbSet: ["wearing", "holding"], verbLine: "Wearing or holding? Look again!", moreLine: "Good! Now say all the things in the corners!",
            foodLine: "Say the colour, or clean or dirty! Try again!",
            intro: "Look at the corners. Say what they're wearing and holding!",
            items: [
              desc("pic-ex7-1", "she", [D("green", "tshirt"), D("blue", "trousers", ["blue jean"])], [D("dirty", "hat")]),
              desc("pic-ex7-2", "he", [D("red", "shirt"), D("clean", "boots")]),
              desc("pic-ex7-3", "she", null, [D("black", "glasses")]),
              desc("pic-ex7-4", "he", [D("yellow", "jacket"), D("black", "shorts")], [D("blue", "cap")]),
              desc("pic-ex7-5", "she", [D("blue", "skirt"), D("clean", "shoes")]),
              desc("pic-ex7-6", "he", null, [D("clean", "boots")])
            ] },

          /* P3 · Writing — Put the Words in Order (Ex6): decoys = "a" before -s things, the other verb, a second describing word */
          { type: "build", id: "g-p3", skill: "W", title: "Put the words in order",
            intro: "Look at the picture. Put the words in order!",
            items: [
              { img: "pic-ex6-1", tiles: ["She's wearing", "dirty", "boots."], decoys: ["a", "She's holding"], whyWrong: { "a": "Boots — no A!", "She's holding": "On her feet… wearing!" } },
              { img: "pic-ex6-2", tiles: ["He's holding", "a", "red", "hat."], decoys: ["He's wearing", "dirty"], whyWrong: { "He's wearing": "In his hand… holding!", "dirty": "One word only!" } },
              { img: "pic-ex6-3", tiles: ["She's wearing", "a pink T-shirt", "and", "blue jeans."], decoys: ["a blue jeans."], whyWrong: { "a blue jeans.": "Jeans — no A!" } },
              { img: "pic-ex6-4", tiles: ["He's wearing", "clean", "socks."], decoys: ["a", "dirty"], whyWrong: { "a": "Socks — no A!", "dirty": "Look! Clean!" } },
              { img: "pic-ex6-5", tiles: ["She's holding", "a", "green", "handbag."], decoys: ["She's wearing", "dirty"], whyWrong: { "She's wearing": "In her hand… holding!" } },
              { img: "pic-ex6-6", tiles: ["He's wearing", "a yellow shirt", "and", "black shorts."], decoys: ["a black shorts."], whyWrong: { "a black shorts.": "Shorts — no A!" } }
            ] },
          { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "📖 Look and Choose"], ["g-p2", "🔔 Ring and Describe"], ["g-p3", "✏️ Words in order"]] }
        ]
      },

      /* ============================ FUNCTIONAL LANGUAGE (Let's Talk) ============================ */
      {
        id: "fl", name: "Let's Talk",
        steps: [
          /* H5-S3: Jill — WHAT → tell me, IS → yes or no */
          { type: "watch", id: "f-watch", title: "What or Is?",
            cues: [
              { scene: "pic-jill-1", line: { text: "Look! This is Jill." } },
              { scene: "pic-jill-1", strip: "<span class='q'>What is she wearing?</span><br><b>She's wearing</b> a yellow dress and dirty boots.",
                line: { text: "What is she wearing? She's wearing a yellow dress and dirty boots." } },
              { scene: "pic-jill-2", strip: "<span class='q'>Is she wearing a hat?</span><br><b class='m'>No, she isn't.</b>", line: { text: "Is she wearing a hat? No, she isn't." } },
              { scene: "pic-jill-3", strip: "<span class='q'>Is she holding a handbag?</span><br><b>Yes, she is.</b>", line: { text: "Is she holding a handbag? Yes, she is." } },
              { scene: "board-qs", strip: "<b>WHAT</b> → tell me<br><b>IS</b> → yes or no · <s>Yes, she's.</s>",
                line: { text: "What… tell me. Is… say yes or no! Yes, she is. Not yes, she's!" } }
            ] },

          /* P1 · Listening — Does it match? (the answer fits the question: WHAT ↔ a sentence, IS ↔ yes / no) */
          { type: "choose", id: "f-p1", skill: "L", title: "Does it match?", layout: "mark",
            intro: "Listen to the question and the answer. Do they match? Tap tick or cross!",
            items: [
              match("pic-qp1", "What is he wearing?", "He's wearing a green jacket and clean shoes.", true),
              match("pic-qp2", "Is she holding a hat?", "Yes, she's.", false, "Yes, she is."),
              match("pic-qp3", "What is she holding?", "Yes, she is.", false, "She's holding black glasses."),
              match("pic-qp4", "Is he holding a baseball cap?", "Yes, he is.", true),
              match("pic-ex7-5", "Is she wearing a hat?", "No, she isn't.", true),
              match("pic-ex7-2", "What is he holding?", "He's wearing a red shirt.", false, "He's holding a black handbag."),
              match("pic-ex7-3", "What is she wearing?", "She's wearing a pink dress and dirty socks.", true),
              match("pic-ex7-4", "Is he wearing black shorts?", "Black shorts.", false, "Yes, he is.")
            ] },

          /* P2 · Speaking — Let's Play Cards (Ex9): WHAT → the full sentence, IS → the short answer; right answer → one step home (6 cards: the board fits a phone) */
          { type: "answer", id: "f-p2", skill: "S", title: "Let's Play Cards", board: true, checkVerb: true,
            verbSet: ["wearing", "holding"], verbLine: "Wearing or holding? Look again!", moreLine: "Good! Now say all the things in the corners!",
            foodLine: "Say the colour, or clean or dirty! Try again!",
            intro: "Turn over a card. Listen to the question. Look and answer! Right answer? One step home!",
            items: [
              desc("pic-qp1", "he", [D("green", "jacket"), D("clean", "shoes")]),
              isQ("pic-qp2", "she", "Is she holding a hat?", true),
              desc("pic-ex6-3", "she", [D("pink", "tshirt"), D("blue", "jeans")]),
              isQ("pic-qp3", "she", "Is she wearing glasses?", false),
              desc("pic-qp4", "he", null, [D("blue", "cap")]),
              isQ("pic-ex6-2", "he", "Is he wearing a hat?", false),
            ] },
          { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "👂 Does it match?"], ["f-p2", "🃏 Let's Play Cards"]] }
        ]
      }
    ]
  };
})();
