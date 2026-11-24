/* EXPLORE Homework — Lesson pack
 * Unit H · Lesson 1 — What are they wearing? (Listening & Speaking) · map: HANDOVER.md §3
 * Pictures: slides H1 (Canva) + H2 p.81–86 (FL P2) → assets/h1/img/ (built 2026-11-24, see SOURCE_OF_TRUTH changelog).
 * Voice: no recordings yet → every line / word is browser TTS until the Voice Pipeline makes lessons/h1.voice.js.
 * Clothes words have no `audio` → Audio_.word() speaks the label.
 */
(function () {
  const ALL = ["shirt", "tshirt", "jacket", "skirt", "dress", "trousers", "jeans", "shorts"];
  const TICK = { text: "✓", mark: "tick" }, CROSS = { text: "✗", mark: "cross" };
  /* listen ✓/✗: a wrong sentence changes ONE thing — a confusable piece of clothing (STS: shirt/T-shirt, trousers/jeans/shorts, skirt/dress) */
  const tf = (pic, say, ok, fix) => ({ prompt: { img: pic, say }, opts: [TICK, CROSS], answer: ok ? 0 : 1, fixedOrder: true, fix: ok ? null : fix, after: ok ? null : fix });
  const ME = "@i1/img/i-hand";

  window.LESSON = {
    id: "H1",
    unit: "Unit H · Clothes",
    title: "Dress-up Box",
    subtitle: "Lesson 1 · What are they wearing?",
    skills: ["L", "S"],
    img: "assets/h1/img/",
    aud: "assets/h1/audio/",
    finishLine: "Hooray! You finished the Dress-up Box!",

    plan: [
      { id: "vocab",   label: "Vocabulary", img: "item-tshirt", frame: "box-1", awning: "#e5534b" },
      { id: "grammar", label: "Grammar",    img: "g-jill-skirt",               awning: "#e8b33a" },
      { id: "fl",      label: "Let's Talk", img: "fl-alex-you",                awning: "#4aa3a2" }
    ],
    focus: {
      "box-1": { x: 26, y: 14, w: 48, h: 84 }, "box-2": { x: 26, y: 14, w: 48, h: 84 },
      "g-alex-jacket": { x: 36, y: 6, w: 28, h: 90 }, "g-jill-skirt": { x: 36, y: 6, w: 28, h: 90 }, "g-matt-me": { x: 36, y: 6, w: 28, h: 90 },
      "fl-alex-you": { x: 35, y: 6, w: 30, h: 90 },
      "tf-grace-dress": { x: 36, y: 8, w: 28, h: 88 }, "tf-alex-shorts": { x: 36, y: 8, w: 28, h: 88 }
    },
    mapDeco: [
      { img: "item-skirt", x: 72, y: 6, r: 12 },
      { img: "item-jeans", x: 6, y: 46, r: -10 },
      { img: "item-jacket", x: 80, y: 80, r: 18 }
    ],

    /* ---------- Vocabulary: 8 clothes (verb "wearing" → the engine's sentences say "wearing", not "eating") ---------- */
    words: {
      shirt:    { label: "a shirt",   img: "item-shirt",    verb: "wearing", say: ["shirt", "shirts"], reject: ["t shirt", "tshirt", "tee shirt", "teeshirt"] },
      tshirt:   { label: "a T-shirt", img: "item-tshirt",   verb: "wearing", say: ["t shirt", "tshirt", "tee shirt", "teeshirt"] },
      jacket:   { label: "a jacket",  img: "item-jacket",   verb: "wearing", say: ["jacket", "jackets"] },
      skirt:    { label: "a skirt",   img: "item-skirt",    verb: "wearing", say: ["skirt", "skirts"] },
      dress:    { label: "a dress",   img: "item-dress",    verb: "wearing", say: ["dress", "dresses"] },
      trousers: { label: "trousers",  img: "item-trousers", verb: "wearing", say: ["trouser", "trousers", "trowser"] },
      jeans:    { label: "jeans",     img: "item-jeans",    verb: "wearing", say: ["jeans", "jean", "genes"] },
      shorts:   { label: "shorts",    img: "item-shorts",   verb: "wearing", say: ["shorts", "short"] }
    },
    /* the pairs the slides warn about (H1 p.14–18 "Note!") — the bubble game always shows the pair */
    confusable: { shirt: "tshirt", tshirt: "shirt", jacket: "shirt", skirt: "dress", dress: "skirt", trousers: "jeans", jeans: "trousers", shorts: "trousers" },

    /* Mental model: the Dress-up Box for photo day — two boxes, the clothes in the order of the slides */
    street: {
      scene: "scene-boxes",
      name: "Dress-up Box",
      carts: [
        { id: "box1", name: "Box 1", scene: "box-1", foods: ["shirt", "tshirt", "jacket", "skirt"], hot: { x: 15, y: 55.9, w: 30, h: 32.1 } },
        { id: "box2", name: "Box 2", scene: "box-2", foods: ["dress", "trousers", "jeans", "shorts"], hot: { x: 55, y: 55.9, w: 30, h: 32.1 } }
      ]
    },

    blocks: [
      {
        id: "vocab",
        name: "Vocabulary",
        steps: [
          { type: "watch", id: "v-watch", title: "The Dress-up Box", skipLabel: "Go to the boxes ▶",
            cues: [
              { scene: "scene-main", line: { text: "It's photo day! Let's dress up!" } },
              { scene: "scene-boxes", point: "cart:box1", line: { text: "Look! Box 1…" }, after: 200 },
              { scene: "scene-boxes", point: "cart:box2", line: { text: "and box 2. Boxes of clothes!" } },

              { scene: "box-1", clear: true, line: { text: "Let's open box 1. What clothes are here?" } },
              { scene: "box-1", food: "shirt" },
              { scene: "box-1", food: "tshirt" },
              { scene: "box-1", line: { text: "A shirt has buttons. A T-shirt has no buttons!" } },
              { scene: "box-1", food: "jacket" },
              { scene: "box-1", food: "skirt" },

              { scene: "box-2", clear: true, line: { text: "Now box 2!" } },
              { scene: "box-2", food: "dress" },
              { scene: "box-2", food: "trousers" },
              { scene: "box-2", food: "jeans" },
              { scene: "box-2", food: "shorts" },
              { scene: "box-2", line: { text: "Trousers are long. Shorts are short!" } },

              { scene: "scene-boxes", clear: true, line: { text: "Now it's your turn. Tap a box!" } }
            ] },

          { type: "explore", id: "v-explore", title: "Open the boxes", instruction: "Tap a box. Then tap the clothes and listen.", readyWhen: "always" },

          /* P1 · Listening — Bubbles: the confusable pair is always there */
          { type: "bubbles", id: "v-p1", skill: "L", title: "Pop the bubble", instruction: "Listen. Pop the right bubble!",
            intro: "Let's play! Listen to the word. Then pop the right bubble!",
            targets: ["shirt", "tshirt", "trousers", "jeans", "shorts", "skirt", "dress", "jacket"], options: 3 },

          /* P2 · Speaking — Say it */
          { type: "say", id: "v-p2", skill: "S", title: "Say it!", instruction: "What's this? Say it!",
            intro: "Now it's your turn to talk! Look at the clothes and say the word. I'm listening!",
            ask: "What's this?", doneLine: "Well done! You said all the clothes words!",
            items: ["tshirt", "jacket", "jeans", "shorts", "skirt"] },

          { type: "recap", id: "v-recap", title: "Your clothes words", heading: "Clothes words" }
        ]
      },

      /* ============================ GRAMMAR ============================ */
      {
        id: "grammar",
        name: "Grammar",
        steps: [
          { type: "watch", id: "g-watch", title: "Who is wearing it?", skipLabel: "Go to the cards ▶",
            cues: [
              { scene: "g-alex-jacket", line: { text: "Look! This is Alex." } },
              { scene: "g-alex-jacket", strip: "<b>He is wearing</b> a jacket.", line: { text: "He is wearing a jacket." } },
              { scene: "g-alex-jacket", strip: "<b class='m'>He's wearing</b> a jacket.", line: { text: "He… is… He's! He's wearing a jacket." } },

              { scene: "g-jill-skirt", line: { text: "And this is Jill." } },
              { scene: "g-jill-skirt", strip: "<b>She is wearing</b> a skirt.", line: { text: "She is wearing a skirt." } },
              { scene: "g-jill-skirt", strip: "<b class='m'>She's wearing</b> a skirt.", line: { text: "She… is… She's! She's wearing a skirt." } },

              { scene: "g-matt-me", line: { text: "And this is Matt. Listen!" } },
              { scene: "g-matt-me", bubble: { text: "I am wearing a jacket!", x: 60, y: 20 }, strip: "<b>I am wearing</b> a jacket.", line: { text: "I am wearing a jacket!", who: "kim" } },
              { scene: "g-matt-me", bubble: { text: "I'm wearing a jacket!", x: 60, y: 20 }, strip: "<b class='m'>I'm wearing</b> a jacket.", line: { text: "I… am… I'm! I'm wearing a jacket!", who: "kim" } },

              { scene: "scene-room", strip: "<b>He's wearing</b> · <b>She's wearing</b> · <b>I'm wearing</b>",
                line: { text: "He's wearing. She's wearing. I'm wearing. Now tap and listen!" } }
            ] },

          { type: "chunks", id: "g-explore", title: "Tap and listen", instruction: "Tap a card and listen.",
            cards: [
              { chunk: "He's wearing", img: "g-alex-jacket", full: "He is wearing a jacket.", short: "He's wearing a jacket.", rest: "a jacket." },
              { chunk: "She's wearing", img: "g-jill-skirt", full: "She is wearing a skirt.", short: "She's wearing a skirt.", rest: "a skirt." },
              { chunk: "I'm wearing", img: "g-matt-me", full: "I am wearing a jacket.", short: "I'm wearing a jacket.", rest: "a jacket.", who: "kim" }
            ] },

          /* P1 · Listening — Right or silly? (slides p.62–69 "Red flags, Blue flags") */
          { type: "choose", id: "g-p1", skill: "L", title: "Right or silly?", layout: "mark",
            intro: "Listen to the sentence. Is it right, or silly? Tap tick or cross!",
            items: [
              tf("tf-jill-skirt", "She's wearing a skirt.", true),
              tf("tf-alex-shirt", "He's wearing a T-shirt.", false, "He's wearing a shirt."),
              tf("tf-grace-trousers", "She's wearing jeans.", false, "She's wearing trousers."),
              tf("tf-matt-jacket", "He's wearing a jacket.", true),
              tf("tf-grace-dress", "She's wearing a skirt.", false, "She's wearing a dress."),
              tf("tf-jill-jeans", "She's wearing jeans.", true),
              tf("tf-alex-shorts", "He's wearing trousers.", false, "He's wearing shorts."),
              tf("tf-matt-tshirt", "He's wearing a T-shirt.", true)
            ] },

          /* P2 · Speaking — Look and say (slides p.53–60 "Quick practice"). alsoOk: anything else the child really wears counts too */
          { type: "answer", id: "g-p2", skill: "S", title: "Look and say",
            intro: "Look at the picture. Say a full sentence: He's wearing… She's wearing… I'm wearing…",
            moreLine: "Good! Now say the full sentence!",
            items: [
              { s: "he",  img: "say-matt-trousers", foods: ["trousers"], alsoOk: ["tshirt"], q: "Look at him!" },
              { s: "she", img: "say-grace-dress",   foods: ["dress"],                         q: "Look at her!" },
              { s: "he",  img: "say-matt-shirt",    foods: ["shirt"],    alsoOk: ["shorts"], q: "Look at him!" },
              { s: "she", img: "say-jill-jeans",    foods: ["jeans"],    alsoOk: ["tshirt"], q: "Look at her!" },
              { s: "she", img: "say-jill-skirt",    foods: ["skirt"],    alsoOk: ["tshirt"], q: "Look at her!" },
              { s: "i",   img: ME,                  foods: ["tshirt"],   alsoOk: ALL,        q: "Look! It's you!" }
            ] },

          { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "👂 Right or silly?"], ["g-p2", "🗣️ Look and say"]] }
        ]
      },

      /* ======================= FUNCTIONAL LANGUAGE (Let's Talk) ======================= */
      {
        id: "fl",
        name: "Let's Talk",
        steps: [
          { type: "watch", id: "f-watch", title: "What is she wearing?", skipLabel: "Go to the cards ▶",
            cues: [
              { scene: "tf-grace-dress", line: { text: "Look! This is Grace." } },
              { scene: "tf-grace-dress", strip: "<span class='q'>What is she wearing?</span>", line: { text: "What is she wearing?" } },
              { scene: "tf-grace-dress", strip: "<span class='q'>What is she wearing?</span><br><b>She's wearing</b> a dress.", line: { text: "She's wearing a dress.", who: "kim" } },

              { scene: "tf-alex-shorts", line: { text: "And this is Alex." } },
              { scene: "tf-alex-shorts", strip: "<span class='q'>What is he wearing?</span>", line: { text: "What is he wearing?" } },
              { scene: "tf-alex-shorts", strip: "<span class='q'>What is he wearing?</span><br><b>He's wearing</b> shorts.", line: { text: "He's wearing shorts.", who: "kim" } },

              { scene: "fl-alex-you", strip: "<span class='q'>What are you wearing?</span>", line: { text: "And you? What are you wearing?" } },
              { scene: "fl-alex-you", strip: "<span class='q'>What are you wearing?</span><br><b>I'm wearing</b> a T-shirt.", line: { text: "I'm wearing a T-shirt!", who: "kim" } },

              { scene: "scene-room", strip: "<span class='q'>What is he / she wearing?</span> → <b>He's / She's wearing</b> …<br><span class='q'>What are you wearing?</span> → <b>I'm wearing</b> …",
                line: { text: "Ask with what. Answer with a full sentence. Now tap and listen!" } }
            ] },

          { type: "qa", id: "f-explore", title: "Ask and answer", instruction: "Tap a card. Listen to the question and the answer.",
            cards: [
              { img: "tf-grace-dress", q: "What is she wearing?", a: "She's wearing a dress.", chunk: "She's wearing" },
              { img: "tf-alex-shorts", q: "What is he wearing?", a: "He's wearing shorts.", chunk: "He's wearing" },
              { img: "fl-alex-you", q: "What are you wearing?", a: "I'm wearing a T-shirt.", chunk: "I'm wearing" }
            ] },

          /* P1 · Listening — Find the friends (slides p.80–86 "Listen and draw lines"; NEW faces, one friend too many).
           * Tom (shirt) vs the boy in a T-shirt, Nick (trousers + jacket) vs Alice (jeans): the confusable pairs again. */
          { type: "names", id: "f-p1", skill: "L", title: "Find the friends",
            intro: "Listen. Who is it? Tap the right friend. The name goes there!",
            kids: [
              { id: "k2", img: "new-kid2", foods: ["skirt"] },
              { id: "k3", img: "new-kid3", foods: ["jacket", "trousers"] },
              { id: "k4", img: "new-kid4", foods: ["tshirt", "jeans"] },
              { id: "k5", img: "new-kid5", foods: ["shirt", "shorts"] },
              { id: "k6", img: "new-kid6", foods: ["dress"] },
              { id: "k7", img: "new-kid7", foods: ["tshirt", "shorts"] }
            ],
            rounds: [
              { name: "Anna", kid: "k2", q: "What is Anna wearing?", a: "She's wearing a skirt." },
              { name: "Nick", kid: "k3", q: "What is Nick wearing?", a: "He's wearing a jacket." },
              { name: "Alice", kid: "k4", q: "What is Alice wearing?", a: "She's wearing jeans." },
              { name: "Tom", kid: "k5", q: "What is Tom wearing?", a: "He's wearing a shirt." },
              { name: "May", kid: "k6", q: "What is May wearing?", a: "She's wearing a dress." }
            ] },

          /* P2 · Speaking — Answer Kim (pictures: slides H2 p.81–86). "What are you wearing?" → any clothes word counts */
          { type: "answer", id: "f-p2", skill: "S", title: "Answer Kim",
            intro: "Kim asks you a question. Answer with a full sentence!",
            moreLine: "Good! Now say the full sentence!",
            items: [
              { s: "she", img: "ask-jill-skirt",  foods: ["skirt"],  alsoOk: ["tshirt"], q: "What is she wearing?" },
              { s: "he",  img: "ask-alex-jeans",  foods: ["jeans"],  alsoOk: ["tshirt"], q: "What is he wearing?" },
              { s: "he",  img: "ask-matt-tshirt", foods: ["tshirt"], alsoOk: ["shorts"], q: "What is he wearing?" },
              { s: "she", img: "ask-grace-dress", foods: ["dress"],                      q: "What is she wearing?" },
              { s: "she", img: "ask-jill-jacket", foods: ["jacket"], alsoOk: ["skirt"],  q: "What is she wearing?" },
              { s: "i",   img: ME,                foods: ["tshirt"], alsoOk: ALL,        q: "What are you wearing?" }
            ] },

          { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "👂 Find the friends"], ["f-p2", "💬 Answer Kim"]] }
        ]
      }
    ]
  };
})();
