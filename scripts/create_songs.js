db.songs.findAndModify({
  query: { title: "Bad Apple !! feat.nomico", artist: "Alstroemeria Records", rating: Number(12) },
  update: {
    $setOnInsert: { title: "Bad Apple !! feat.nomico", alternateTitle: "", artist: "Alstroemeria Records", rating: NumberInt(12),  difficulty: "expert", bpm: "138", isSingles: true}
  },
  new: true,
  upsert: true
})
db.songs.findAndModify({
  query: { title: "Break Free", artist: "Ariana Grande feat. Zedd", rating: Number(11) },
  update: {
    $setOnInsert: { title: "Break Free", alternateTitle: "", artist: "Ariana Grande feat. Zedd", rating: NumberInt(11),  difficulty: "expert", bpm: "130", isSingles: true}
  },
  new: true,
  upsert: true
})
db.songs.findAndModify({
  query: { title: "Happy", artist: "Pharrell Williams", rating: Number(12) },
  update: {
    $setOnInsert: { title: "Happy", alternateTitle: "", artist: "Pharrell Williams", rating: NumberInt(12),  difficulty: "expert", bpm: "160", isSingles: true}
  },
  new: true,
  upsert: true
})