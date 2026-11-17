/* EXPLORE Homework — Lesson pack
 * Unit I · Lesson 5 — Integrated Revision: breakfast, lunch and dinner (L, S, R, W)
 * DLP: WHW EXPLORE › tab I5. All 18 words (Set 1 from I1, Set 2 from I3) + breakfast / lunch / dinner.
 * Mental model: FOOD / DRINK / DESSERT → food + dessert = eating, drink = drinking. Sort first, then name.
 * Homework items are new (not the in-class Hugo / Lucy families or the in-class Does-it-match pairs).
 */
(function () {
  const S1 = (id, label, say, extra) => Object.assign({ label, img: "@i1/img/food-" + id, audio: "@i1/audio/word-" + id, verb: "eating", group: "food", say }, extra || {});
  const S2 = (id, label, verb, group, say) => ({ label, img: "@i3/img/item-" + id, audio: "@i3/audio/word-" + id, verb, group, say });
  const W = {
    bread: S1("bread", "bread", ["bread", "bred"]),
    egg: S1("egg", "an egg", ["egg"]),
    meatballs: S1("meatballs", "meatballs", ["meatball", "meat ball"]),
    sausage: S1("sausage", "a sausage", ["sausage", "sossage"]),
    burger: S1("burger", "a burger", ["burger", "berger"]),
    chips: S1("chips", "chips", ["chip"]),
    rice: S1("rice", "rice", ["rice", "rise"]),
    chicken: S1("chicken", "chicken", ["chicken"]),
    fish: S1("fish", "fish", ["fish"]),
    meat: S1("meat", "meat", ["meat", "meet"], { reject: ["ball"] }),
    water: S2("water", "water", "drinking", "drink", ["water", "walter"]),
    milk: S2("milk", "milk", "drinking", "drink", ["milk"]),
    juice: S2("juice", "juice", "drinking", "drink", ["juice", "jews"]),
    lemonade: S2("lemonade", "lemonade", "drinking", "drink", ["lemonade", "lemon aid"]),
    cake: S2("cake", "cake", "eating", "dessert", ["cake"]),
    "ice-cream": S2("ice-cream", "ice cream", "eating", "dessert", ["ice cream", "icecream", "ice-cream"]),
    chocolate: S2("chocolate", "chocolate", "eating", "dessert", ["chocolate"]),
    sweets: S2("sweets", "sweets", "eating", "dessert", ["sweets", "suites"]),
    /* meal words (shown in the review only) */
    breakfast: { label: "breakfast", img: "icon-breakfast", audio: "word-breakfast", meal: true },
    lunch: { label: "lunch", img: "icon-lunch", audio: "word-lunch", meal: true },
    dinner: { label: "dinner", img: "icon-dinner", audio: "word-dinner", meal: true }
  };
  const FOOD18 = Object.keys(W).filter((k) => !W[k].meal);
  const TICK = { text: "✓", mark: "tick" }, CROSS = { text: "✗", mark: "cross" };
  const match = (q, a, ok, fix) => ({ prompt: { say: [q, { text: a, who: "kim" }] }, opts: [TICK, CROSS], answer: ok ? 0 : 1, fixedOrder: true, fix: ok ? null : fix, tray: "@i1/img/i-hand" });
  const pics = (ids) => ids.map((x) => ({ img: W[x].img }));

  window.LESSON = {
    id: "I5",
    unit: "Unit I · Food & drink",
    title: "Breakfast, Lunch & Dinner",
    subtitle: "Lesson 5 · Integrated revision",
    skills: ["L", "S", "R", "W"],
    img: "assets/i5/img/",
    aud: "assets/i5/audio/",
    backdrop: "sky",
    finishLine: "Hooray! You finished Food Street!",
    plan: [
      { id: "vocab",   label: "Vocabulary", img: "icon-breakfast", awning: "#e5534b" },
      { id: "grammar", label: "Grammar",    img: "model1",         awning: "#e8b33a" },
      { id: "fl",      label: "Let's Talk", img: "tony-dinner",    awning: "#4aa3a2" }
    ],
    mapDeco: [{ img: "@i3/img/item-juice", x: 72, y: 6, r: 12 }, { img: "@i1/img/food-egg", x: 6, y: 46, r: -10 }, { img: "@i3/img/item-cake", x: 80, y: 80, r: 18 }],
    words: W,
    confusable: { meat: "meatballs", meatballs: "meat", juice: "lemonade", lemonade: "juice", water: "milk", milk: "water", sweets: "chocolate", chocolate: "sweets", cake: "ice-cream", "ice-cream": "cake", burger: "sausage", sausage: "burger", chicken: "fish", fish: "chicken", rice: "bread", bread: "rice" },

    blocks: [
      /* ============================ VOCABULARY ============================ */
      {
        id: "vocab", name: "Vocabulary",
        steps: [
          { type: "watch", id: "v-watch", title: "Breakfast, lunch and dinner",
            cues: [
              { scene: "sky", line: { text: "Look at the sky. Morning… noon… and night." } },
              { scene: "sky-breakfast", clear: true, food: "breakfast" },
              { scene: "sky-breakfast", line: { text: "In the morning, we have breakfast." } },
              { scene: "sky-lunch", clear: true, food: "lunch" },
              { scene: "sky-lunch", line: { text: "At noon, we have lunch." } },
              { scene: "sky-dinner", clear: true, food: "dinner" },
              { scene: "sky-dinner", line: { text: "At night, we have dinner." } },
              { scene: "sky", clear: true, line: { text: "Breakfast, lunch, dinner! Now let's sort the food, the drinks and the desserts." } }
            ] },
          /* P1 · Reading — Three Trays (DLP Ex3): sort first, the tray names appear after */
          { type: "sort", id: "v-p1", skill: "R", title: "Three trays", showWords: true, nameAfter: true,
            intro: "Read the word. Tap it, then tap the right tray!",
            trays: [{ id: "food", label: "FOOD", start: "bread", say: "Food!" }, { id: "drink", label: "DRINK", start: "water", say: "Drink!" }, { id: "dessert", label: "DESSERT", start: "cake", say: "Dessert!" }],
            items: ["egg", "meatballs", "sausage", "chips", "rice", "chicken", "milk", "juice", "lemonade", "ice-cream", "chocolate", "sweets"],
            after: ["Food and desserts… we eat them.", "Drinks… we drink them."], doneLine: "Well done!" },
          /* P2 · Writing — Unlock the Fridge (DLP Ex2): spell it, letters mixed up */
          { type: "spell", id: "v-p2", skill: "W", title: "Unlock the fridge", intro: "Spell the word to open the fridge!",
            items: [{ word: "chicken", gaps: "all" }, { word: "juice", gaps: "all" }, { word: "sausage", gaps: "all" }, { word: "chocolate", gaps: "all" },
                    { word: "egg", gaps: "all" }, { word: "lemonade", gaps: "all" }, { word: "chips", gaps: "all" }, { word: "sweets", gaps: "all" }] },
          /* P3 · Listening — Family Meal Plan (DLP Ex1 idea, new family): tap everything they have at that meal */
          { type: "choose", id: "v-p3", skill: "L", title: "Max's family", keepOrder: true,
            intro: "Listen to Max's family. What do they have? Tap three pictures!",
            items: [
              { prompt: { img: "icon-breakfast", note: "Breakfast", say: "It's breakfast time. Max's family is eating bread and an egg. They're drinking juice." },
                opts: pics(["bread", "egg", "juice", "rice", "lemonade", "meat"]), answer: [0, 1, 2], tray: "icon-breakfast" },
              { prompt: { img: "icon-lunch", note: "Lunch", say: "It's lunch time. Max's family is eating rice and fish. They're drinking water." },
                opts: pics(["rice", "fish", "water", "bread", "chicken", "milk"]), answer: [0, 1, 2], tray: "icon-lunch" },
              { prompt: { img: "icon-dinner", note: "Dinner", say: "It's dinner time. Max's family is eating meatballs and chips. Then they're eating ice cream!" },
                opts: pics(["meatballs", "chips", "ice-cream", "meat", "sausage", "cake"]), answer: [0, 1, 2], tray: "icon-dinner" }
            ] },
          { type: "recap", id: "v-recap", title: "All the words", heading: "Food, drinks & desserts", words: FOOD18,
            scores: [["v-p1", "🍽️ Three trays"], ["v-p2", "🔓 Fridge"], ["v-p3", "👂 Max's family"]] }
        ]
      },

      /* ============================ GRAMMAR ============================ */
      {
        id: "grammar", name: "Grammar",
        steps: [
          { type: "watch", id: "g-watch", title: "Eating or drinking?",
            cues: [
              { scene: "sky", strip: "FOOD → <b class='m'>eating</b><br>DESSERT → <b class='m'>eating</b><br>DRINK → <b>drinking</b>", line: { text: "Food and desserts… eating. Drinks… drinking." } },
              { scene: "model1", line: { text: "Look! Bill is having lunch." } },
              { scene: "model1", strip: "He's <b class='m'>eating</b> chicken.<br>He's <b>drinking</b> juice.", line: { text: "He's eating chicken. He's drinking juice." } },
              { scene: "model2", strip: "She's <b class='m'>eating</b> rice <b>and</b> cake.", line: { text: "Rice and cake… both eating. One sentence with and! She's eating rice and cake." } },
              { scene: "model3", strip: "She's <b class='m'>eating</b> rice.<br>She's <b>drinking</b> milk.", line: { text: "Rice and milk… eating and drinking. Two sentences! She's eating rice. She's drinking milk." } },
              { scene: "sky", strip: "same verb → <b>and</b><br>eating + drinking → <b>two sentences</b>", line: { text: "Same verb, use and. Eating and drinking, say two sentences!" } }
            ] },
          /* P1 · Speaking — Snapshots: one or two sentences, the verb chosen by group */
          { type: "answer", id: "g-p1", skill: "S", title: "Snapshots", checkVerb: true,
            intro: "Look at the picture. Say what they're eating and drinking!",
            items: [
              { s: "he",  img: "quick1", q: "What is he eating?", parts: [{ verb: "eating", foods: ["burger", "chips"] }] },
              { s: "she", img: "quick2", q: "What is she eating and drinking?", parts: [{ verb: "eating", foods: ["fish"] }, { verb: "drinking", foods: ["lemonade"] }] },
              { s: "i",   img: "quick3", q: "What are you eating and drinking?", parts: [{ verb: "eating", foods: ["meatballs"] }, { verb: "drinking", foods: ["juice"] }] },
              { s: "she", img: "quick4", q: "What is she eating?", parts: [{ verb: "eating", foods: ["chicken", "chocolate"] }] },
              { s: "he",  img: "quick5", q: "What is he eating and drinking?", parts: [{ verb: "eating", foods: ["egg"] }, { verb: "drinking", foods: ["water"] }] },
              { s: "i",   img: "quick6", q: "What are you eating?", parts: [{ verb: "eating", foods: ["bread", "ice-cream"] }] }
            ] },
          /* P2 · Reading — A Day at Food Street: each gap offers words; only one fits the verb */
          { type: "gaptext", id: "g-p2", skill: "R", title: "Tom's day", heading: "Tom's day", wordsOnly: true,
            intro: "Read about Tom's day. Tap the word that fits the gap!",
            text: "It's breakfast time. Tom is eating {bread|water,juice}. He is drinking {milk|chicken,cake}. At lunch, Tom is eating {rice|lemonade,milk}. He is drinking {lemonade|fish,sweets}. At dinner, he is eating a burger and {chips|water,juice}. Then he is eating {cake|milk,lemonade}. Yummy!",
            lines: ["It's breakfast time. Tom is eating bread. He is drinking milk.", "At lunch, Tom is eating rice. He is drinking lemonade.", "At dinner, he is eating a burger and chips. Then he is eating cake. Yummy!"] },
          /* P3 · Writing — Food Street Snapshots (DLP Ex7): build the sentence, choose the verb */
          { type: "build", id: "g-p3", skill: "W", title: "Write it", intro: "Look at the picture. Eating or drinking? Build the sentence!",
            items: [
              { img: "p1", tiles: ["He is", "eating", "a sausage."], decoys: ["drinking", "He"] },
              { img: "p2", tiles: ["She is", "eating", "meatballs."], decoys: ["drinking", "meat."] },
              { img: "p6", tiles: ["I am", "drinking", "lemonade."], decoys: ["eating", "i am"], whyWrong: { "i am": "I is always a big letter!", "eating": "Lemonade… drinking!" }, who: "kim" },
              { img: "p7", tiles: ["She is", "drinking", "juice."], decoys: ["eating", "a juice."], whyWrong: { "a juice.": "No A! Just juice." } },
              { img: "p3", tiles: ["I am", "eating", "ice cream."], decoys: ["drinking", "He is"], whyWrong: { "drinking": "Ice cream… eating!" }, who: "kim" },
              { img: "p5", tiles: ["He is", "eating", "a burger", "and chips."], decoys: ["drinking", "chips."] }
            ] },
          { type: "done", id: "g-done", title: "Grammar done!", scores: [["g-p1", "📸 Snapshots"], ["g-p2", "📖 Tom's day"], ["g-p3", "✏️ Write it"]] }
        ]
      },

      /* ============================ FUNCTIONAL LANGUAGE ============================ */
      {
        id: "fl", name: "Let's Talk",
        steps: [
          { type: "watch", id: "f-watch", title: "What or Is?",
            cues: [
              { scene: "tony-dinner", line: { text: "Look! Tony is having dinner." } },
              { scene: "tony-dinner", strip: "<span class='q'>What is he eating?</span><br><b>He's eating</b> chicken.", line: { text: "What is he eating? He's eating chicken." } },
              { scene: "tony-dinner", strip: "<span class='q'>What is he drinking?</span><br><b>He's drinking</b> water.", line: { text: "What is he drinking? He's drinking water." } },
              { scene: "tony-dinner", strip: "<span class='q'>Is he drinking milk?</span><br><b class='m'>No, he isn't.</b>", line: { text: "Is he drinking milk? No, he isn't." } },
              { scene: "tony-dinner", strip: "<span class='q'>Is he eating chicken?</span><br><b>Yes, he is.</b>", line: { text: "Is he eating chicken? Yes, he is." } },
              { scene: "sky", strip: "<b>WHAT</b> → tell me the food<br><b>IS</b> → yes or no", line: { text: "What… tell me the food. Is… say yes or no!" } }
            ] },
          /* P1 · Listening — Does it match? (DLP Ex8 idea, new pairs) */
          { type: "choose", id: "f-p1", skill: "L", title: "Does it match?", layout: "mark",
            intro: "Listen to the question and the answer. Do they match? Tap tick or cross!",
            items: [
              match("What is he eating?", "He's eating chips.", true),
              match("Is she drinking milk?", "Milk.", false, "Yes, she is. / No, she isn't."),
              match("What is she drinking?", "She's eating cake.", false, "She's drinking …"),
              match("Is he eating an egg?", "Yes, he is.", true),
              match("What are you drinking?", "I'm drinking water.", true),
              match("What is he eating?", "Yes, he is.", false, "He's eating …"),
              match("Is she eating sweets?", "No, she isn't.", true),
              match("Is he drinking juice?", "Yes, he's.", false, "Yes, he is.")
            ] },
          /* P2 · Reading + Speaking — Race Home (DLP Ex9): read the question card, answer, move */
          { type: "answer", id: "f-p2", skill: "S", title: "Race home", board: true, checkVerb: true,
            intro: "Read the question. Look and answer. Right answer? Move one step home!",
            items: [
              { s: "he",  img: "tony-dinner", q: "What is he drinking?", parts: [{ verb: "drinking", foods: ["water"] }] },
              { s: "she", img: "model3", q: "Is she drinking milk?", short: "Yes, she is.", foods: ["milk"], trayImg: "@i3/img/item-milk" },
              { s: "he",  img: "model1", q: "What is he eating?", parts: [{ verb: "eating", foods: ["chicken"] }] },
              { s: "she", img: "model2", q: "Is she eating chocolate?", short: "No, she isn't.", foods: ["cake"], trayImg: "@i3/img/item-cake" },
              { s: "she", img: "@i3/img/sc-pat-lemonade", q: "What is she drinking?", parts: [{ verb: "drinking", foods: ["lemonade"] }] },
              { s: "he",  img: "@i3/img/sc-bill-cake", q: "Is he eating cake?", short: "Yes, he is.", foods: ["cake"], trayImg: "@i3/img/item-cake" }
            ] },
          { type: "done", id: "f-done", title: "Let's Talk done!", scores: [["f-p1", "👂 Does it match?"], ["f-p2", "🎲 Race home"]] }
        ]
      }
    ]
  };
})();
