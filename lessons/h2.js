/* EXPLORE Homework — Lesson pack
 * Unit H · Lesson 2 — Read and Dress (Reading & Writing) · map: HANDOVER.md §3 · DLP: WHW EXPLORE › tab H2
 * Skills R, W only (decision #34): the word / sentence is read aloud only after the answer (decision #36).
 * Pictures: assets/h2/img (slides H2: colours, coloured clothes, children) + H1's boxes, clothes and children (@h1/img/…). No generated pictures.
 * Colours: only red, blue, green, yellow, pink, black · the colour comes before the clothes word · no "a" before trousers / jeans / shorts.
 * Voice: browser TTS until the Voice Pipeline makes lessons/h2.voice.js (words have no `audio` → the engine speaks the label).
 */
(function () {
  const H1 = (n) => "@h1/img/" + n;
  const ME = "@i1/img/i-hand";
  /* group: "a" = one thing → a … · "s" = two legs → …s, no "a" (Vocab sort) */
  const W = {
    shirt:    { label: "a shirt",   spell: "a [sh]irt",     img: H1("item-shirt"),    group: "a" },
    tshirt:   { label: "a T-shirt", spell: "a [T-]shirt",   img: H1("item-tshirt"),   group: "a" },
    jacket:   { label: "a jacket",  spell: "a ja[ck]et",    img: H1("item-jacket"),   group: "a" },
    skirt:    { label: "a skirt",   spell: "a [sk]irt",     img: H1("item-skirt"),    group: "a" },
    dress:    { label: "a dress",   spell: "a dre[ss]",     img: H1("item-dress"),    group: "a" },
    trousers: { label: "trousers",  spell: "tr[ou]sers",    img: H1("item-trousers"), group: "s" },
    jeans:    { label: "jeans",     spell: "j[ea]ns",       img: H1("item-jeans"),    group: "s" },
    shorts:   { label: "shorts",    spell: "short[s]",      img: H1("item-shorts"),   group: "s" }
  };
  /* STS Insights / slides "Note!": the pairs children mix up */
  const CONF = { shirt: "skirt", skirt: "shirt", tshirt: "shirt", jacket: "shirt", dress: "skirt", trousers: "jeans", jeans: "trousers", shorts: "trousers" };
  const others = (w, n) => Object.keys(W).filter((x) => x !== w && x !== CONF[w]).sort(() => Math.random() - 0.5).slice(0, n);
  /* read a word → pick its picture (the right one + its confusable + one more) */
  const readPick = (w) => ({ prompt: { text: W[w].label, say: { word: w } }, opts: [w, CONF[w], ...others(w, 1)].map((x) => ({ img: W[x].img })), answer: 0, tray: W[w].img });
  const TICK = { text: "✓", mark: "tick" }, CROSS = { text: "✗", mark: "cross" };
  const look = (pic, sent, ok, fix) => ({ prompt: { img: pic, text: sent, say: ok ? sent : fix }, opts: [TICK, CROSS], answer: ok ? 0 : 1, fixedOrder: true, fix: ok ? null : fix, tray: pic });
  /* read the question → pick the answer (the wrong ones change ONE thing: he / she / I, the colour or the clothes) */
  const ask = (prompt, q, right, wrong1, wrong2, who) => ({ prompt: Object.assign(prompt, { text: q, say: [q, who ? { text: right, who } : right] }), opts: [{ text: right }, { text: wrong1 }, { text: wrong2 }], answer: 0 });
  /* a colour equation in the Watch: paint + plain clothes = coloured clothes */
  const eq = (paint, line, coloured) => [{ img: "item-paint-" + paint, x: 6, y: 30, w: 20 }, { img: line, x: 38, y: 22, w: 24 }, { img: coloured, x: 70, y: 22, w: 24 }];
  const ROOM = H1("scene-room");

  window.LESSON = {
    id: "H2",
    unit: "Unit H · Clothes",
    title: "Read and Dress",
    subtitle: "Lesson 2 · Read and dress (Reading & Writing)",
    skills: ["R", "W"],
    img: "assets/h2/img/",
    aud: "assets/h2/audio/",
    finishLine: "Hooray! You can read and write about clothes and colours!",
    plan: [
      { id: "vocab",   label: "Vocabulary", img: H1("item-skirt"), frame: H1("box-2"), awning: "#e5534b" },
      { id: "grammar", label: "Grammar",    img: "g-jill-pink-skirt",            awning: "#e8b33a" },
      { id: "fl",      label: "Let's Talk", img: "fl-grace-pink-dress",          awning: "#4aa3a2" }
    ],
    focus: {
      [H1("box-1")]: { x: 26, y: 14, w: 48, h: 84 }, [H1("box-2")]: { x: 26, y: 14, w: 48, h: 84 },
      "g-jill-pink-skirt": { x: 37, y: 6, w: 28, h: 90 }, "g-alex-blue-jeans": { x: 38, y: 6, w: 28, h: 90 },
      "g-girl-yellow-dress": { x: 50, y: 8, w: 26, h: 88 },
      "fl-grace-pink-dress": { x: 22, y: 8, w: 28, h: 88 }, "fl-boy-blue-shorts": { x: 19, y: 8, w: 28, h: 88 }
    },
    mapDeco: [{ img: "item-paint-red", x: 72, y: 6, r: 12 }, { img: "item-tshirt-red", x: 6, y: 46, r: -10 }, { img: "item-paint-blue", x: 80, y: 80, r: 18 }],
    words: W,
    confusable: CONF,
    /* the Dress-up Box of H1, now with the words to read */
    street: {
      scene: H1("scene-boxes"),
      name: "Dress-up Box",
      carts: [
        { id: "box1", name: "Box 1", scene: H1("box-1"), foods: ["shirt", "tshirt", "jacket", "skirt"], hot: { x: 15, y: 55.9, w: 30, h: 32.1 } },
        { id: "box2", name: "Box 2", scene: H1("box-2"), foods: ["dress", "trousers", "jeans", "shorts"], hot: { x: 55, y: 55.9, w: 30, h: 32.1 } }
      ]
    },

    blocks: [
      /* ============================ VOCABULARY ============================ */
      {
        id: "vocab", name: "Vocabulary",
        steps: [
          /* DLP stage 2.1: picture → word, the tricky letters */
          { type: "watch", id: "v-watch", title: "Read the clothes words",
            cues: [
              { scene: H1("scene-boxes"), line: { text: "Let's read the clothes words in the Dress-up Box!" } },
              { scene: H1("box-1"), clear: true, line: { text: "Box 1." } },
              { scene: H1("box-1"), food: "shirt", line: { text: "Shirt starts with S and H." }, wordFirst: true },
              { scene: H1("box-1"), food: "tshirt", line: { text: "T-shirt. A big T, a little line… then shirt!" }, wordFirst: true },
              { scene: H1("box-1"), food: "jacket", line: { text: "Jacket. C and K in the middle." }, wordFirst: true },
              { scene: H1("box-1"), food: "skirt", line: { text: "Skirt starts with S and K. Shirt… skirt. Look at the start!" }, wordFirst: true },
              { scene: H1("box-2"), clear: true, line: { text: "Box 2." } },
              { scene: H1("box-2"), food: "dress", line: { text: "Dress has two Ss at the end." }, wordFirst: true },
              { scene: H1("box-2"), food: "trousers", line: { text: "Trousers. O and U together." }, wordFirst: true },
              { scene: H1("box-2"), food: "jeans", line: { text: "Jeans. E and A together." }, wordFirst: true },
              { scene: H1("box-2"), food: "shorts", line: { text: "Shorts. Two legs… an S at the end. No A!" }, wordFirst: true },
              { scene: H1("scene-boxes"), clear: true, line: { text: "Now tap a box. Read and listen!" } }
            ] },
          { type: "explore", id: "v-explore", title: "Read in the boxes", instruction: "Tap a box. Read the word, then tap and listen.", readyWhen: "always" },

          /* P1 · Reading — Read & match (DLP Ex4 Sticky Ball): the confusable picture is always there */
          { type: "choose", id: "v-p1", skill: "R", title: "Read & match",
            intro: "Read the word. Tap the right picture!",
            items: ["shirt", "skirt", "tshirt", "trousers", "jeans", "shorts", "dress", "jacket"].map(readPick) },

          /* P2 · Writing — Missing letters (HW Ex2: the gap is at a different place from class Ex5) */
          { type: "spell", id: "v-p2", skill: "W", title: "Missing letters",
            intro: "Look at the picture. Tap the missing letter!",
            items: [
              { word: "shirt", gaps: [1], decoys: "kc" },      /* s_irt: h or k? */
              { word: "skirt", gaps: [1], decoys: "hc" },      /* s_irt: k or h? */
              { word: "tshirt", gaps: [0], decoys: "tl" },     /* a big T */
              { word: "jacket", gaps: [2], decoys: "ks" },     /* ja_ket */
              { word: "dress", gaps: [2], decoys: "ai" },      /* dr_ss */
              { word: "jeans", gaps: [1], decoys: "ai" },      /* j_ans */
              { word: "trousers", gaps: [4], decoys: "zc" },   /* trou_ers */
              { word: "shorts", gaps: [2], decoys: "iu" }      /* sh_rts — not shirts! */
            ] },

          /* P3 · Reading — a … or …s? (map: sort into "a ___" / "___s"; picture only, the word shows after) */
          { type: "sort", id: "v-p3", skill: "R", title: "A or S?", showWords: false,
            intro: "Look at the picture. One thing → A. Two legs → S. Tap the right box!",
            trays: [{ id: "a", label: "a ___", start: "shirt", say: "A shirt, a T-shirt, a jacket, a skirt, a dress." },
                    { id: "s", label: "___s", start: "trousers", say: "Trousers, jeans, shorts. No A!" }],
            items: ["tshirt", "jeans", "jacket", "shorts", "skirt", "dress"],
            after: ["Two legs… S at the end, and no A!"], doneLine: "Well done!" },

          { type: "recap", id: "v-recap", title: "Your clothes words", heading: "Clothes words to read",
            scores: [["v-p1", "📖 Read & match"], ["v-p2", "✏️ Missing letters"], ["v-p3", "🧺 A or S?"]] }
        ]
      },

      /* ============================ GRAMMAR ============================ */
      {
        id: "grammar", name: "Grammar",
        steps: [
          /* DLP stage 3.1–3.2: colours, colour equations, the colour goes first, then sentences */
          { type: "watch", id: "g-watch", title: "Colours and clothes",
            cues: [
              { scene: ROOM, dim: true, actors: ["red", "blue", "green", "yellow", "pink", "black"].map((c, k) => ({ img: "item-paint-" + c, x: 3 + k * 16, y: 34, w: 14 })),
                strip: "red · blue · green · yellow · pink · black", line: { text: "Let's add some colours! Red, blue, green, yellow, pink, black." } },
              { scene: ROOM, dim: true, actors: eq("red", "item-line-tshirt", "item-tshirt-red"),
                strip: "red + a T-shirt = a <b>red</b> T-shirt", line: { text: "Red… a T-shirt… a red T-shirt!" } },
              { scene: ROOM, dim: true, actors: eq("pink", "item-line-shirt", "item-shirt-pink"),
                strip: "pink + a shirt = a <b>pink</b> shirt", line: { text: "Pink… a shirt… a pink shirt!" } },
              { scene: ROOM, dim: true, actors: eq("blue", "item-line-trousers", "item-trousers-blue"),
                strip: "blue + trousers = <b>blue</b> trousers", line: { text: "Blue… trousers… blue trousers. No A!" } },
              { scene: ROOM, strip: "a + <b>colour</b> + clothes → a <b>red</b> T-shirt<br><b>colour</b> + clothes(-s) → <b>blue</b> trousers",
                line: { text: "The colour comes first. Then the clothes!" } },

              { scene: "g-jill-pink-skirt", line: { text: "Look! This is Jill." } },
              { scene: "g-jill-pink-skirt", strip: "<b>She's wearing</b> a <b class='m'>pink</b> skirt.", line: { text: "She's wearing a pink skirt." } },
              { scene: "g-alex-blue-jeans", line: { text: "And this is Alex." } },
              { scene: "g-alex-blue-jeans", strip: "<b>He's wearing</b> <b class='m'>blue</b> jeans.", line: { text: "He's wearing blue jeans. No A!" } },
              { scene: "g-girl-yellow-dress", bubble: { text: "I'm wearing a yellow dress!", x: 36, y: 16 },
                strip: "<b>I'm wearing</b> a <b class='m'>yellow</b> dress.", line: { text: "I'm wearing a yellow dress!", who: "kim" } },
              { scene: ROOM, strip: "<b>He's wearing</b> … · <b>She's wearing</b> … · <b>I'm wearing</b> …",
                line: { text: "He's wearing, she's wearing, I'm wearing… then the colour, then the clothes. Now tap and read!" } }
            ] },
          { type: "chunks", id: "g-explore", title: "Tap and read", instruction: "Tap a card and listen.",
            cards: [
              { chunk: "She's wearing", img: "g-jill-pink-skirt", full: "She is wearing a pink skirt.", short: "She's wearing a pink skirt.", rest: "a pink skirt." },
              { chunk: "He's wearing", img: "g-alex-blue-jeans", full: "He is wearing blue jeans.", short: "He's wearing blue jeans.", rest: "blue jeans." },
              { chunk: "I'm wearing", img: "g-girl-yellow-dress", full: "I am wearing a yellow dress.", short: "I'm wearing a yellow dress.", rest: "a yellow dress.", who: "kim" }
            ] },

          /* P1 · Reading — Look and read ✓ / ✗ (Starters R&W Part 1; DLP HW Ex1). A wrong sentence names clothes that are NOT in the picture,
           * from the pairs children mix up: shirt/dress, shirt/skirt, trousers/shorts, trousers/jeans, T-shirt/shirt. */
          { type: "choose", id: "g-p1", skill: "R", title: "Look and read", layout: "mark",
            intro: "Look and read. Is it right? Tap tick or cross!",
            items: [
              look(H1("ask-alex-jeans"), "He's wearing jeans.", true),
              look(H1("ask-jill-skirt"), "She's wearing a shirt.", false, "She's wearing a skirt."),
              look("pic-boy-blue-shorts", "He's wearing trousers.", false, "He's wearing shorts."),
              look("pic-boy-blue-shirt", "He's wearing a shirt.", true),
              look(H1("ask-matt-tshirt"), "He's wearing a shirt.", false, "He's wearing a T-shirt."),
              look(H1("ask-jill-jacket"), "She's wearing a jacket.", true),
              look("pic-alex-red-jacket", "He's wearing trousers.", false, "He's wearing jeans."),
              look("pic-grace-pink-dress", "She's wearing a dress.", true)
            ] },

          /* P2 · Writing — Build the sentence (DLP Ex6 Human Train: "a" steps out for -s clothes) */
          { type: "build", id: "g-p2", skill: "W", title: "Build the sentence",
            intro: "Look at the picture. Build the sentence. The colour comes first!",
            items: [
              { img: H1("ask-jill-skirt"), tiles: ["She's wearing", "a", "pink", "skirt."], decoys: ["He's wearing", "shirt."], whyWrong: { "shirt.": "Look! A skirt!", "He's wearing": "It's a girl. She's wearing!" } },
              { img: H1("ask-alex-jeans"), tiles: ["He's wearing", "blue", "jeans."], decoys: ["a", "trousers."], whyWrong: { "a": "Jeans — no A!", "trousers.": "Look! Jeans!" } },
              { img: H1("ask-grace-dress"), tiles: ["She's wearing", "a", "yellow", "dress."], decoys: ["pink", "I'm wearing"] },
              { img: H1("ask-jill-jacket"), tiles: ["She's wearing", "a", "red", "jacket."], decoys: ["green", "shirt."] },
              { img: "pic-alex-black-shorts", tiles: ["He's wearing", "black", "shorts."], decoys: ["a", "trousers."], whyWrong: { "a": "Shorts — no A!", "trousers.": "Look! Shorts!" } },
              { img: H1("ask-matt-tshirt"), tiles: ["He's wearing", "a", "green", "T-shirt."], decoys: ["shirt.", "red"], whyWrong: { "shirt.": "No buttons… a T-shirt!" } },
              { imgs: [ME, "item-tshirt-red"], tiles: ["I'm wearing", "a", "red", "T-shirt."], decoys: ["He's wearing", "T-shirt red."], whyWrong: { "He's wearing": "It's you! I'm wearing!" }, who: "kim", tray: "item-tshirt-red" }
            ] },
          { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "📖 Look and read"], ["g-p2", "🧱 Build the sentence"]] }
        ]
      },

      /* ======================= FUNCTIONAL LANGUAGE (short R&W review — decision #35) ======================= */
      {
        id: "fl", name: "Let's Talk",
        steps: [
          { type: "qa", id: "f-explore", title: "Questions and answers", instruction: "Tap a card. Read the question and the answer.",
            cards: [
              { img: "fl-grace-pink-dress", q: "What is she wearing?", a: "She's wearing a pink dress.", chunk: "She's wearing" },
              { img: "fl-boy-blue-shorts", q: "What is he wearing?", a: "He's wearing blue shorts.", chunk: "He's wearing" },
              { img: "g-girl-yellow-dress", q: "What are you wearing?", a: "I'm wearing a yellow dress.", chunk: "I'm wearing" }
            ] },
          /* P1 · Reading — Read and match (DLP Ex8, HW Ex4) */
          { type: "choose", id: "f-p1", skill: "R", title: "Read and match", layout: "stack",
            intro: "Read the question. Tap the right answer!",
            items: [
              ask({ img: "pic-jill-blue-dress" }, "What is she wearing?", "She's wearing a blue dress.", "She's wearing a pink dress.", "I'm wearing a blue dress."),
              ask({ img: "pic-alex-red-jacket" }, "What is he wearing?", "He's wearing a red jacket.", "He's wearing a red T-shirt.", "She's wearing a red jacket."),
              ask({ img: "pic-girl-pink-skirt" }, "What is she wearing?", "She's wearing a pink skirt.", "She's wearing a pink shirt.", "She's wearing a red skirt."),
              Object.assign(ask({ imgs: [ME, "item-shorts-black"] }, "What are you wearing?", "I'm wearing black shorts.", "He's wearing black shorts.", "I'm wearing blue shorts.", "kim"), { tray: "item-shorts-black" }),
              ask({ img: "pic-matt-black-shorts" }, "What is he wearing?", "He's wearing a blue T-shirt.", "He's wearing a blue shirt.", "I'm wearing a blue T-shirt."),
              ask({ img: "pic-boy-green-shorts" }, "What is he wearing?", "He's wearing green shorts.", "He's wearing green trousers.", "He's wearing a green T-shirt.")
            ] },
          { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "📖 Read and match"]] }
        ]
      }
    ]
  };
})();
