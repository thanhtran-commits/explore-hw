/* EXPLORE Homework — catalog of units and lessons (the home screens read this).
 * skills: what the lesson practises in class (DLP "Skill focus"). The engine only runs practice steps
 * whose `skill` is in the lesson pack's `skills` — L = Listening, S = Speaking, R = Reading, W = Writing.
 * ready:false → shown as "Coming soon".
 * Pictures (optional): cover = picture of the unit / lesson · bg = people-free theme scene behind the splash, the unit path
 * and the lesson roadmap (blurred + washed; temporary art until the Image Pipeline draws the final scenes).
 */
window.CATALOG = {
  splash: { bg: "assets/i1/img/cart-rice.webp" },
  units: [
    { id: "A", title: "At school" },
    { id: "B", title: "Unit B" },
    { id: "C", title: "At the farm" },
    { id: "D", title: "Unit D" },
    { id: "E", title: "Transportation" },
    { id: "F", title: "People around us" },
    { id: "G", title: "Appearance & body" },
    { id: "H", title: "Clothes" },
    {
      id: "I", title: "Food & drink", ready: true, cover: "assets/i1/img/scene-main.webp", bg: "assets/i3/img/cart-dessert.webp",
      lessons: [
        { id: "I1", title: "What are they eating?", skills: ["L", "S"], file: "lessons/i1.js", ready: true, cover: "assets/i1/img/scene-main.webp", bg: "assets/i1/img/cart-rice.webp" },
        { id: "I2", title: "Read and write: food", skills: ["R", "W"], file: "lessons/i2.js", ready: true, cover: "assets/i1/img/g-bill-burger.webp", bg: "assets/i1/img/cart-bread.webp" },
        { id: "I3", title: "Eating or drinking?", skills: ["L", "S"], file: "lessons/i3.js", ready: true, cover: "assets/i3/img/scene-street5.webp", bg: "assets/i3/img/cart-drinks.webp" },
        { id: "I4", title: "Read and write: drinks & desserts", skills: ["R", "W"], file: "lessons/i4.js", ready: true, cover: "assets/i4/img/fs-scene.webp", bg: "assets/i3/img/cart-dessert.webp" },
        { id: "I5", title: "Breakfast, lunch and dinner", skills: ["L", "S", "R", "W"], file: "lessons/i5.js", review: true, ready: true, cover: "assets/i5/img/sky-lunch.webp", bg: "assets/i5/img/sky.webp" }
      ]
    },
    { id: "J", title: "Actions & activities" }
  ]
};
