const Tournament = require('../models/tournament')
const Matchup = require('../models/matchup')
const moment = require('moment')
const logger = require('../logging/logger')

const createEntries = function createEntriesFunc(tournament) {
  // Get list of all games that need to be played
  let games = []
  const { weeks, entrants } = tournament
  const startDate = moment(tournament.startDate)

  for (let i = 0; i < entrants.length; i++) {
    const player1 = entrants[i]
    for (let j = i + 1; j < entrants.length; j++) {
      const player2 = entrants[j]
      games.push({ player1, player2 })
    }
  }

  // Figure out how many games need to be played per week
  const gamesPerWeek = Math.ceil(games.length / weeks)

  // Spread the games out across the weeks
  for (let week = 0; week < weeks && games.length > 0; week++) {
    for (let i = 0; i < gamesPerWeek && games.length > 0; i++) {
      const game = games.pop()
      const match = new Matchup()
      match.tournament = tournament._id
      match.startDate = startDate.clone().add(week, 'weeks')
      match.endDate = startDate.clone().add(week + 1, 'weeks')
      match.players = [{
        user: game.player1
      },
      {
        user: game.player2
      }]
      match.battles = [
        {
          chooser: game.player1
        },
        {
          chooser: game.player2
        }
      ]

      match.save(match)
    }
  }
}

module.exports = {
  createEntries
}