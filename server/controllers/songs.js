const Song = require('../models/song')
const logger = require('../logging/logger')
const sanitizeSvc = require('../services/sanitizeService')

const getAllHandler = [
  async function getAllFunc(req, res) {
    try {
      const songs = await Song.find().exec()
      res.send(songs)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to retrieve songs' })
    }
  }
]

const createHandler = [
  async function createFunc(req, res) {
    try {
      const userId = res.locals.user._id
      logger.info(`user ${userId} creating song`, req.body)
      const body = req.body
      const newSong = new Song()

      newSong.title = body.title
      newSong.alternateTitle = body.alternateTitle
      newSong.artist = body.artist
      newSong.bpm = body.bpm
      newSong.difficulty = body.difficulty
      newSong.rating = body.rating
      newSong.imageUrl = body.imageUrl
      newSong.isSingles = body.isSingles

      const savedSong = await newSong.save()
      res.send(savedSong)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to create song' })
    }
  }
]

const updateHandler = [
  async function createFunc(req, res) {
    try {
      const userId = res.locals.user._id
      const songId = res.params.id
      logger.info(`user ${userId} updating song ${songId}`, req.body)
      const body = req.body

      const nullableData = {
        alternateTitle: body.alternateTitle,
        imageUrl: body.imageUrl
      }
      const updateableProperties = [
        'title',
        'artist',
        'bpm',
        'difficulty',
        'rating',
        'imageUrl',
        'isSingles'
      ]
      
      const updatedData = Object.assign(nullableData, sanitizeSvc.sanitize(body, updateableProperties))
      
      const updatedSong = await Song.findOneAndUpdate(
        { _id: songId },
        updatedData,
        { new: true }).exec()
        
      if (!updatedSong) {
        throw new Error('update returned null')
      }

      res.send(updatedSong)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to update song' })
    }
  }
]

module.exports = {
  getAllHandler,
  createHandler,
  updateHandler,
}