db.runCommand(
   {
      insert: "users",
      documents: [
         { realName: "John Bo", facebookId: "12345", accessToken: "abc" },
         { realName: "Keisha Smuck", facebookId: "4625", accessToken: "efweg" },
         { realName: "Karry Perry", facebookId: "624626", accessToken: "segvesc" },
         { realName: "Smithy Bee", facebookId: "62465674", accessToken: "esvgthdr" },
         { realName: "Smooth J", facebookId: "2346756", accessToken: "svges" },
         { realName: "Sheryl Mack", facebookId: "76745634", accessToken: "hdrytjrdes" },
      ],
      ordered: false,
      writeConcern: { w: "majority", wtimeout: 5000 }
   }
)
