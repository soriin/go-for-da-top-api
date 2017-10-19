db.users.findAndModify({
  query: { facebookId: "119835545261188" },
  update: {
    $setOnInsert: { realName: "Sheryl Mack", facebookId: "119835545261188", accessToken: "1" }
  },
  new: true,
  upsert: true
})

db.users.findAndModify({
  query: { facebookId: "100016950498814" },
  update: {
    $setOnInsert: { realName: "Keisha Smuck", facebookId: "100016950498814", accessToken: "1" }
  },
  new: true,
  upsert: true
})

db.users.findAndModify({
  query: { facebookId: "133241767253155" },
  update: {
    $setOnInsert: { realName: "Karry Perry", facebookId: "133241767253155", accessToken: "1" }
  },
  new: true,
  upsert: true
})

db.users.findAndModify({
  query: { facebookId: "100016987721871" },
  update: {
    $setOnInsert: { realName: "Smithy Bee", facebookId: "100016987721871", accessToken: "1" }
  },
  new: true,
  upsert: true
})
