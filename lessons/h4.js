/* EXPLORE Homework — Lesson pack
 * Unit H · Lesson 4 — Lost and Found (Reading & Writing) · map: HANDOVER.md §3 · DLP: WHW EXPLORE › tab H4
 * Skills R, W only (decision #34): the word / sentence is read aloud only after the answer (decision #36).
 * Pictures: assets/h4/img (slides H4, HTML version: the Lost and Found box, the 8 things natural / clean / dirty / in a colour,
 *   children wearing or holding one thing). No generated pictures.
 * Grammar rule (DLP): ONE word before the clothes word — a colour OR clean / dirty ("a red dirty hat" ✗); no "a" before -s things.
 * Let's Talk: no new language in H4 (map) → a short R&W review of H3's "Is he / she wearing / holding …?" (decision #35, like I2 / I4).
 * Voice: lessons/h4.voice.js (Voice Pipeline); words have no `audio` → the engine speaks the label.
 */
(function () {
  /* the eight things (Set 2), now to read and spell; spell = the tricky letters (DLP: ss, oe, oo, ck, tch; hand+bag; baseball cap = 2 words) */
  const W = {
    hat:     { label: "a hat",          spell: "a h[a]t",          img: "item-hat" },
    cap:     { label: "a baseball cap", spell: "a [baseball] cap", img: "item-cap" },
    handbag: { label: "a handbag",      spell: "a hand[bag]",      img: "item-handbag" },
    watch:   { label: "a watch",        spell: "a wa[tch]",        img: "item-watch" },
    glasses: { label: "glasses",        spell: "gla[ss]es",        img: "item-glasses" },
    shoes:   { label: "shoes",          spell: "sh[oe]s",          img: "item-shoes" },
    boots:   { label: "boots",          spell: "b[oo]ts",          img: "item-boots" },
    socks:   { label: "socks",          spell: "so[ck]s",          img: "item-socks" }
  };
  /* DLP Ex4: confusable words — shoes / socks, hat / handbag, boots / baseball cap (+ STS Insights: hat / cap) */
  const CONF = { shoes: "socks", socks: "shoes", hat: "handbag", handbag: "hat", boots: "cap", cap: "boots", glasses: "shoes", watch: "hat" };
  const others = (w, n) => Object.keys(W).filter((x) => x !== w && x !== CONF[w]).sort(() => Math.random() - 0.5).slice(0, n);
  const readPick = (w) => ({ prompt: { text: W[w].label, say: { word: w } }, opts: [w, CONF[w], ...others(w, 1)].map((x) => ({ img: W[x].img })), answer: 0, tray: W[w].img });
  /* Starters R&W Part 2: Look and read. Yes or no? A "no" sentence is wrong in ONE thing: clean / dirty, wearing / holding, the colour or the thing */
  const yn = (pic, sent, ok, fix) => ({ prompt: { img: pic, text: sent, say: ok ? sent : fix }, opts: [{ text: "yes" }, { text: "no" }], answer: ok ? 0 : 1, fixedOrder: true, fix: ok ? null : fix, tray: pic });
  /* Let's Talk review: read the question → the short answer ("Yes, she's." is the STS Insights error, so it is a choice) */
  const qa = (img, s, q, yes) => {
    const Y = s === "he" ? "Yes, he is." : "Yes, she is.", N = s === "he" ? "No, he isn't." : "No, she isn't.", bad = s === "he" ? "Yes, he's." : "Yes, she's.";
    return { prompt: { img, text: q, say: [q, yes ? Y : N] }, opts: [{ text: yes ? Y : N }, { text: yes ? N : Y }, { text: bad }], answer: 0 };
  };
  const BOX = "scene-box";
  const pair = (a, b) => [{ img: a, x: 10, y: 18, w: 34 }, { img: b, x: 56, y: 18, w: 34 }];

  window.LESSON = {
    id: "H4",
    unit: "Unit H · Clothes",
    title: "Lost and Found",
    subtitle: "Lesson 4 · Lost and Found (Reading & Writing)",
    skills: ["R", "W"],
    img: "assets/h4/img/",
    aud: "assets/h4/audio/",
    finishLine: "Hooray! You found all the lost things!",
    plan: [
      { id: "vocab",   label: "Vocabulary", img: "item-glasses", frame: BOX, awning: "#e5534b" },
      { id: "grammar", label: "Grammar",    img: "pic-jill-dirty-handbag",  awning: "#e8b33a" },
      { id: "fl",      label: "Let's Talk", img: "on-jill-hat",             awning: "#4aa3a2" }
    ],
    mapDeco: [{ img: "item-boots-dirty", x: 72, y: 6, r: 12 }, { img: "item-hat-red", x: 6, y: 46, r: -10 }, { img: "item-socks-clean", x: 80, y: 80, r: 18 }],
    words: W,
    confusable: CONF,

    blocks: [
      /* ============================ VOCABULARY ============================ */
      {
        id: "vocab", name: "Vocabulary",
        steps: [
          /* DLP stage 1 + 2.1: the things come out of the Lost and Found box, one by one; the word (tricky letters marked) sits under the picture —
           * no food row: the scene already shows the thing big, coming out of the box */
          { type: "watch", id: "v-watch", title: "The Lost and Found box",
            cues: [
              { scene: BOX, line: { text: "After Photo Day, the children lost lots of things! Look, the Lost and Found box!" } },
              { scene: "out-hat", strip: "a h<b>a</b>t", line: { text: "A hat. H, A, T." } },
              { scene: "out-cap", strip: "a <b>baseball</b> cap", line: { text: "Base… ball… cap. Two words!" } },
              { scene: "out-handbag", strip: "a hand<b>bag</b>", line: { text: "Hand… bag. One word!" } },
              { scene: "out-watch", strip: "a wa<b>tch</b>", line: { text: "Watch. T, C, H at the end." } },
              { scene: "out-glasses", strip: "gla<b>ss</b>es", line: { text: "Glasses. Two Ss in the middle." } },
              { scene: "out-shoes", strip: "sh<b>oe</b>s", line: { text: "Shoes. O and E." } },
              { scene: "out-boots", strip: "b<b>oo</b>ts", line: { text: "Boots. Two Os." } },
              { scene: "out-socks", strip: "so<b>ck</b>s", line: { text: "Socks. C and K, like jacket!" } },
              { scene: BOX, clear: true, strip: "gla<b>ss</b>es · sh<b>oe</b>s · b<b>oo</b>ts · so<b>ck</b>s → <b class='m'>-s</b>, no <b class='m'>a</b>",
                line: { text: "Glasses, shoes, boots, socks. Two eyes, two feet… S at the end, and no A!" } }
            ] },

          /* P1 · Reading — Read & match (DLP Ex4 Lost and Found Hunt): the confusable picture is always there */
          { type: "choose", id: "v-p1", skill: "R", title: "Read & match",
            intro: "Read the word. Tap the right picture!",
            items: ["shoes", "socks", "hat", "handbag", "boots", "cap", "glasses", "watch"].map(readPick) },

          /* P2 · Writing — Missing letters (DLP Ex6 Tag the Lost Things: the tricky letters) */
          { type: "spell", id: "v-p2", skill: "W", title: "Tag the lost things",
            intro: "Look at the lost thing. Tap the missing letters!",
            items: [
              { word: "glasses", gaps: [3, 4], decoys: "c" },      /* gla__es */
              { word: "shoes", gaps: [2, 3], decoys: "u" },        /* sh__s */
              { word: "boots", gaps: [1, 2], decoys: "a" },        /* b__ts */
              { word: "socks", gaps: [2, 3], decoys: "x" },        /* so__s */
              { word: "watch", gaps: [2, 3, 4], decoys: "s" },     /* wa___ */
              { word: "handbag", gaps: [4, 5, 6], decoys: "p" },   /* hand___ */
              { word: "hat", gaps: [1], decoys: "e" },             /* h_t */
              { word: "cap", gaps: [4, 5, 6, 7], decoys: "o" }     /* base____ cap */
            ] },

          /* P3 · Writing — Find my other half (DLP Ex5): two halves make the word */
          { type: "build", id: "v-p3", skill: "W", title: "Find my other half", glue: "",
            intro: "Look at the picture. Tap the two halves of the word!",
            items: [
              { img: "item-glasses", tiles: ["gla", "sses"], decoys: ["oes"], say: { word: "glasses" } },
              { img: "item-shoes", tiles: ["sh", "oes"], decoys: ["cks"], say: { word: "shoes" } },
              { img: "item-boots", tiles: ["bo", "ots"], decoys: ["sses"], say: { word: "boots" } },
              { img: "item-socks", tiles: ["so", "cks"], decoys: ["ots"], say: { word: "socks" } },
              { img: "item-watch", tiles: ["wa", "tch"], decoys: ["bag"], say: { word: "watch" } },
              { img: "item-handbag", tiles: ["hand", "bag"], decoys: ["tch"], say: { word: "handbag" } },
              { img: "item-hat", tiles: ["h", "at"], decoys: ["oes"], say: { word: "hat" } },
              { img: "item-cap", tiles: ["baseball", "cap"], decoys: ["bag"], say: { word: "cap" } }
            ] },

          { type: "recap", id: "v-recap", title: "Your lost things", heading: "Lost and Found words",
            scores: [["v-p1", "📖 Read & match"], ["v-p2", "🏷️ Tag the lost things"], ["v-p3", "🧩 Find my other half"]] }
        ]
      },

      /* ============================ GRAMMAR ============================ */
      {
        id: "grammar", name: "Grammar",
        steps: [
          /* DLP stage 3.1–3.2: clean / dirty, the same place as a colour, ONE word only, then sentences */
          { type: "watch", id: "g-watch", title: "Clean or dirty?",
            cues: [
              { scene: BOX, dim: true, actors: pair("item-hat-clean", "item-hat-dirty"),
                strip: "a <b>clean</b> hat · a <b class='m'>dirty</b> hat", line: { text: "A clean hat. A dirty hat." } },
              { scene: BOX, dim: true, actors: pair("item-boots-clean", "item-boots-dirty"),
                strip: "<b>clean</b> boots · <b class='m'>dirty</b> boots", line: { text: "Clean boots. Dirty boots. No A!" } },
              { scene: BOX, strip: "cl<u>ea</u>n · d<u>ir</u>ty", line: { text: "Clean… E and A, like jeans. Dirty… I and R, like shirt." } },
              { scene: BOX, dim: true, actors: pair("item-hat-red", "item-hat-dirty"),
                strip: "a <b>red</b> hat → a <b class='m'>dirty</b> hat", line: { text: "A red hat. A dirty hat. The same place… before hat!" } },
              { scene: BOX, strip: "<s>a red dirty hat</s> → one word only!", line: { text: "A red dirty hat? No! One word only!" } },
              { scene: "pic-jill-dirty-handbag", strip: "She's <b>holding</b> a <b class='m'>dirty</b> handbag.", line: { text: "She's holding a dirty handbag." } },
              { scene: "pic-matt-clean-boots", strip: "He's <b>wearing</b> <b class='m'>clean</b> boots.", line: { text: "He's wearing clean boots. No A!" } },
              { scene: BOX, dim: true, actors: [{ img: "item-hat-red", x: 34, y: 22, w: 30 }], bubble: { text: "I'm holding a red hat!", x: 58, y: 18 },
                strip: "I'm <b>holding</b> a <b class='m'>red</b> hat.", line: { text: "I'm holding a red hat!", who: "kim" } },
              { scene: BOX, strip: "a + <b>colour / clean / dirty</b> + clothes<br><b>colour / clean / dirty</b> + clothes(-s)",
                line: { text: "One word before the clothes. Now tap and read!" } }
            ] },
          { type: "chunks", id: "g-explore", title: "Tap and read", instruction: "Tap a card and listen.",
            cards: [
              { chunk: "She's holding", img: "pic-jill-dirty-handbag", full: "She is holding a dirty handbag.", short: "She's holding a dirty handbag.", rest: "a dirty handbag." },
              { chunk: "He's wearing", img: "pic-matt-clean-boots", full: "He is wearing clean boots.", short: "He's wearing clean boots.", rest: "clean boots." },
              { chunk: "I'm holding", img: "item-hat-red", full: "I am holding a red hat.", short: "I'm holding a red hat.", rest: "a red hat.", who: "kim" }
            ] },

          /* P1 · Writing — Build the sentence (DLP Ex9 idea): decoys = "a" before -s things, the other verb, a second word */
          { type: "build", id: "g-p1", skill: "W", title: "Build the sentence",
            intro: "Look at the picture. Build the sentence. One word before the clothes!",
            items: [
              { img: "pic-grace-pink-cap", tiles: ["She's wearing", "a", "pink", "baseball cap."], decoys: ["She's holding", "red"], whyWrong: { "She's holding": "On her head… wearing!" } },
              { img: "pic-alex-dirty-shoes", tiles: ["He's holding", "dirty", "shoes."], decoys: ["a", "clean"], whyWrong: { "a": "Shoes — no A!", "clean": "Look! Dirty!" } },
              { img: "pic-jill-clean-socks", tiles: ["She's wearing", "clean", "socks."], decoys: ["a", "dirty"], whyWrong: { "a": "Socks — no A!", "dirty": "Look! Clean!" } },
              { img: "pic-matt-green-hat", tiles: ["He's holding", "a", "green", "hat."], decoys: ["He's wearing", "dirty"], whyWrong: { "He's wearing": "In his hand… holding!" } },
              { img: "pic-grace-dirty-boots", tiles: ["She's holding", "dirty", "boots."], decoys: ["a", "She's wearing"], whyWrong: { "a": "Boots — no A!", "She's wearing": "In her hands… holding!" } },
              { img: "pic-boy-dirty-cap", tiles: ["He's holding", "a", "dirty", "baseball cap."], decoys: ["clean", "red"], whyWrong: { "red": "One word only!" } }
            ] },

          /* P2 · Reading — Look and read. Yes or no? (Starters R&W Part 2; DLP HW Ex1) */
          { type: "choose", id: "g-p2", skill: "R", title: "Yes or no?",
            intro: "Look and read. Yes or no?",
            items: [
              yn("pic-jill-dirty-handbag", "She's holding a clean handbag.", false, "She's holding a dirty handbag."),
              yn("pic-matt-clean-boots", "He's wearing clean boots.", true),
              yn("pic-matt-green-hat", "He's holding a green hat.", true),
              yn("pic-grace-pink-cap", "She's wearing a red baseball cap.", false, "She's wearing a pink baseball cap."),
              yn("pic-alex-black-glasses", "He's holding black glasses.", false, "He's wearing black glasses."),
              yn("pic-boy-yellow-watch", "He's wearing a yellow watch.", true),
              yn("pic-jill-clean-socks", "She's wearing clean socks.", true),
              yn("pic-grace-dirty-boots", "She's wearing dirty boots.", false, "She's holding dirty boots.")
            ] },
          { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "🧱 Build the sentence"], ["g-p2", "📖 Yes or no?"]] }
        ]
      },

      /* ======================= LET'S TALK (short R&W review of H3 — no new language in H4) ======================= */
      {
        id: "fl", name: "Let's Talk",
        steps: [
          { type: "qa", id: "f-explore", title: "Questions and answers", instruction: "Tap a card. Read the question and the answer.",
            cards: [
              { img: "on-jill-hat", q: "Is she holding a hat?", a: "Yes, she is.", chunk: "Yes, she is." },
              { img: "on-matt-cap", q: "Is he wearing a baseball cap?", a: "Yes, he is.", chunk: "Yes, he is." },
              { img: "on-matt-glasses", q: "Is he wearing glasses?", a: "No, he isn't.", chunk: "No, he isn't." }
            ] },
          { type: "choose", id: "f-p1", skill: "R", title: "Read and answer", layout: "stack",
            intro: "Read the question. Tap the right answer!",
            items: [
              qa("on-alex-boots", "he", "Is he holding boots?", true),
              qa("on-jill-socks", "she", "Is she wearing socks?", true),
              qa("on-grace-watch", "she", "Is she holding a watch?", false),
              qa("on-alex-handbag", "he", "Is he holding a handbag?", true),
              qa("on-grace-shoes", "she", "Is she holding shoes?", false),
              qa("on-matt-glasses", "he", "Is he wearing glasses?", false)
            ] },
          { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "📖 Read and answer"]] }
        ]
      }
    ]
  };
})();
