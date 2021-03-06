let router = require('express').Router()
let Post = require('../models/post')
let User = require('../models/User')

//THANKS A TON https://www.movable-type.co.uk/scripts/latlong.html for the help with this math by supplying this function template!!
//This formula calculated the distance between two map coordinates, in this case between
//the post location and current user location
function haversine(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371000
  let yourLat = lat1 * (Math.PI / 180)
  let targetLat = lat2 * (Math.PI / 180)
  let latDif = (lat2 - lat1) * (Math.PI / 180)
  let lngDif = (lng2 - lng1) * (Math.PI / 180)

  let a = (Math.sin(latDif / 2) * Math.sin(latDif / 2)) +
    (Math.cos(yourLat) * Math.cos(targetLat) *
      Math.sin(lngDif / 2) * Math.sin(lngDif / 2))

  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return (earthRadius * c) / 1000
}

//get all posts within given radius of user coords
router.get('/:lat/:lng/:radius', (req, res, next) => {
  Post.find({})
    .then(posts => {
      let inRangePosts = posts.filter(post => {
        let distanceKm = haversine(req.params.lat, req.params.lng, post.coordinates.lat, post.coordinates.lng)
        let distanceMiles = distanceKm * .6213
        post.distance = distanceMiles
        if (distanceMiles <= req.params.radius) {
          return post
        }
      })
      res.send(inRangePosts)
    })
    .catch(err => {
      console.log(err)
      next()
    })
})

//get a user's favorite posts
router.get('/user/favorites/:lat/:lng', (req, res, next) => {
  User.findById(req.session.uid)
    .then(user => {
      Post.find({})
        .then(posts => {
          let favorites = posts.filter(post => user.favorites[post._id])
          //calculate and add distance to posts
          favorites.forEach(post => {
            let distanceKm = haversine(req.params.lat, req.params.lng, post.coordinates.lat, post.coordinates.lng)
            let distanceMiles = distanceKm * .6213
            post.distance = distanceMiles
          })
          return res.send(favorites)
        })
    })
    .catch(next)
})

//get all posts for specific user
router.get('/:userId', (req, res, next) => {
  Post.find({ userId: req.params.userId })
    .then(posts => {
      return res.send(posts)
    })
    .catch(next)
})

//edit a post
router.put('/:postId', (req, res, next) => {
  Post.findByIdAndUpdate(req.params.postId, req.body)
    .then(() => res.send({
      message: 'Edited'
    }))
})

//create a post
router.post('/', (req, res, next) => {
  Post.create(req.body)
    .then(post => {
      res.send(post)
    })
    .catch(next)
})

//delete a specific post
router.delete('/:postId', (req, res, next) => {
  console.log("here")
  Post.findById(req.params.postId)
    .then(post => {
      if (!post.userId.toString() == req.session.uid) {
        return res.status(401).send("You cannot delete another user's post!")
      }
      post.remove(() => {
        res.status(200).send("Post Deleted")
      })
    })
    .catch(next)
})

//delete all posts from a specified user
router.delete('/by-user/:userId', (req, res, next) => {
  Post.deleteMany({ userId: req.params.userId }, function (err) { })
    .then(() => res.send({ message: 'user posts deleted!' }))
    .catch(next)
})

// vote on post
router.post('/:postId/vote', (req, res, next) => {
  if (req.body.vote >= -2 && req.body.vote <= 2) {
    Post.findById(req.params.postId)
      .then(post => {
        if (!post.votes) { post.votes = {} }
        post.votes[req.session.uid] = req.body.vote
        post.markModified('votes')
        post.save((err) => {
          if (err) {
            console.log(err)
            return res.status(500).send(err)
          }
          return res.send(post)
        })
      })
      .catch(err => {
        console.log(err)
        next()
      })
  }
})

module.exports = router