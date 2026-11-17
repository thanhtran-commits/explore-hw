/* EXPLORE Homework — catalog of units and lessons (the home screens read this).
 * skills: what the lesson practises in class (DLP "Skill focus"). The engine only runs practice steps
 * whose `skill` is in the lesson pack's `skills` — L = Listening, S = Speaking, R = Reading, W = Writing.
 * ready:false → shown as "Sắp có".
 */
window.CATALOG = {
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
      id: "I", title: "Food & drink", ready: true, cover: "assets/i1/img/scene-main.webp",
      lessons: [
        { id: "I1", title: "What are they eating?", skills: ["L", "S"], file: "lessons/i1.js", ready: true },
        { id: "I2", title: "Read and write: food", skills: ["R", "W"], file: "lessons/i2.js", ready: true },
        { id: "I3", title: "Eating or drinking?", skills: ["L", "S"], file: "lessons/i3.js", ready: true },
        { id: "I4", title: "Read and write: drinks & desserts", skills: ["R", "W"], file: "lessons/i4.js", ready: true },
        { id: "I5", title: "Breakfast, lunch and dinner", skills: ["L", "S", "R", "W"], file: "lessons/i5.js", review: true, ready: true }
      ]
    },
    { id: "J", title: "Actions & activities" }
  ]
};
