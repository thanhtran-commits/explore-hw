/* EXPLORE Homework — catalog of units and lessons (the home screens read this).
 * skills: what the lesson practises in class (DLP "Skill focus"). The engine only runs practice steps
 * whose `skill` is in the lesson pack's `skills` — L = Listening, S = Speaking, R = Reading, W = Writing.
 * ready:false → shown as "Coming soon".
 * Pictures (optional): cover = picture of the unit / lesson · bg = people-free theme scene behind the splash, the unit path
 * and the lesson roadmap (blurred + washed evenly by the engine).
 * Rewards (decision #57, optional per unit — a unit without them simply shows no carts / street / logo):
 *   nick, badge     short name + emoji placeholder on the passport cover (until the unit has its own logo art)
 *   logo            { img, text }: round badge; `text` is written on its empty ribbon
 *   street          { img, title, spots: [[x%, y%] centre of each chalk circle, one per lesson], cart: { w: width % of the street, base: wheels below the centre, % of its height } }
 *   rewardPrompt    the line on the "pick a reward" screen · rewardGoal: under the street (*…* = bold) · logoSay: Kim's line when the logo is earned (a recorded line)
 *   lesson.rewards  the 3–4 things the child picks from when the lesson is finished: [{ id, img, name }]
 */
(function () {
  const cart = (id, name) => ({ id, img: "assets/unit-i/cart-" + id + ".webp", name });
  window.CATALOG = {
    splash: { bg: "assets/unit-i/bg-unit.webp" },
    units: [
      { id: "A", title: "At school", badge: "🎒" },
      { id: "B", title: "Unit B", badge: "📦" },
      { id: "C", title: "At the farm", nick: "The farm", badge: "🐄" },
      { id: "D", title: "Unit D", badge: "📦" },
      { id: "E", title: "Transportation", nick: "Transport", badge: "🚌" },
      { id: "F", title: "People around us", nick: "People", badge: "👪" },
      { id: "G", title: "Appearance & body", nick: "Looks", badge: "👀" },
      {
        /* Unit H — in progress (H1–H5 built 2026-11-24/25). No unit backgrounds / rewards / logo yet (Image Pipeline, HANDOVER §2.3). */
        id: "H", title: "Clothes", nick: "Dress-up", badge: "👕", ready: true,
        cover: "assets/h1/img/scene-main.webp",
        lessons: [
          { id: "H1", title: "What are they wearing?", skills: ["L", "S"], file: "lessons/h1.js", ready: true, cover: "assets/h1/img/scene-main.webp" },
          { id: "H2", title: "Read and dress", skills: ["R", "W"], file: "lessons/h2.js", ready: true, cover: "assets/h2/img/g-jill-pink-skirt.webp" },
          { id: "H3", title: "Wearing or holding?", skills: ["L", "S"], file: "lessons/h3.js", ready: true, cover: "assets/h3/img/scene-main.webp" },
          { id: "H4", title: "Lost and Found", skills: ["R", "W"], file: "lessons/h4.js", ready: true, cover: "assets/h4/img/scene-box.webp" },
          { id: "H5", title: "Photo Day", skills: ["L", "S", "R", "W"], file: "lessons/h5.js", review: true, ready: true, cover: "assets/h5/img/scene-main.webp" }
        ]
      },
      {
        id: "I", title: "Food & drink", nick: "Food Street", badge: "🛒", ready: true,
        cover: "assets/i1/img/scene-main.webp", bg: "assets/unit-i/bg-unit.webp",
        logo: { img: "assets/unit-i/logo.webp", text: "FOOD STREET" },
        street: { img: "assets/unit-i/street.webp", title: "My Food Street",
          spots: [[12.5, 73.5], [31.46, 73.5], [49.95, 73.5], [68.28, 73.5], [87.24, 73.5]], cart: { w: 18.6, base: 3 } },
        rewardPrompt: "Pick a cart for your Food Street!",
        rewardGoal: "Fill all 5 spots to get the *Food Street logo*!",
        logoSay: "Hooray! You finished Food Street!",
        lessons: [
          { id: "I1", title: "What are they eating?", skills: ["L", "S"], file: "lessons/i1.js", ready: true, cover: "assets/i1/img/scene-main.webp", bg: "assets/unit-i/bg-i1.webp",
            rewards: [cart("icecream", "Ice cream cart"), cart("noodle", "Noodle cart"), cart("fruit", "Fruit cart"), cart("popcorn", "Popcorn cart")] },
          { id: "I2", title: "Read and write: food", skills: ["R", "W"], file: "lessons/i2.js", ready: true, cover: "assets/i1/img/g-bill-burger.webp", bg: "assets/unit-i/bg-i2.webp",
            rewards: [cart("pizza", "Pizza cart"), cart("juice", "Juice cart"), cart("donut", "Donut cart"), cart("corn", "Corn cart")] },
          { id: "I3", title: "Eating or drinking?", skills: ["L", "S"], file: "lessons/i3.js", ready: true, cover: "assets/i3/img/scene-street5.webp", bg: "assets/unit-i/bg-i3.webp",
            rewards: [cart("lemonade", "Lemonade cart"), cart("smoothie", "Smoothie cart"), cart("tea", "Tea cart"), cart("milk", "Milk cart")] },
          { id: "I4", title: "Read and write: drinks & desserts", skills: ["R", "W"], file: "lessons/i4.js", ready: true, cover: "assets/i4/img/fs-scene.webp", bg: "assets/unit-i/bg-i4.webp",
            rewards: [cart("cake", "Cake cart"), cart("candy", "Candy cart"), cart("cookie", "Cookie cart"), cart("pancake", "Pancake cart")] },
          { id: "I5", title: "Breakfast, lunch and dinner", skills: ["L", "S", "R", "W"], file: "lessons/i5.js", review: true, ready: true, cover: "assets/i5/img/sky-lunch.webp", bg: "assets/unit-i/bg-i5.webp",
            rewards: [cart("soup", "Soup cart"), cart("sandwich", "Sandwich cart"), cart("hotdog", "Hot dog cart"), cart("dumpling", "Dumpling cart")] }
        ]
      },
      { id: "J", title: "Actions & activities", nick: "Actions", badge: "🏃" }
    ]
  };
})();
