let router = require('express').Router();
let Users = require('../models/User');
let session = require('./session')

//NEVER TELL USERS WHICH FAILED
let loginError = new Error('Bad Email or Password')

//CHECK FOR USERNAME ALREADY IN USE
router.get('/auth/exists/:name', (req, res, next) => {
  Users.findOne({ username: req.params.name }, 'username')
    //cant send user.length because throws an error and prohibits new users from successfully registering
    //may need to look into .findOne ...
    .then(username => res.send(username))
    .catch(err => {
      console.log(err)
      next()
    })
})

//CREATE A NEW USER
router.post('/auth/register', (req, res, next) => {
  //VALIDATE PASSWORD LENGTH
  if (req.body.password.length < 5) {
    return res.status(400).send({
      error: 'Password must be at least 6 characters'
    })
  }
  //CHANGE THE PASSWORD TO A HASHED PASSWORD
  //@ts-ignore
  req.body.password = Users.generateHash(req.body.password)
  //CREATE THE USER
  Users.create(req.body)
    .then(user => {
      //REMOVE THE PASSWORD BEFORE RETURNING
      delete user._doc.password
      //SET THE SESSION UID (SHORT FOR USERID)
      req.session.uid = user._id
      res.send(user)
    })
    .catch(err => {
      console.log(err)
      next()
    })
})

//LOGIN AN EXISTING USER
router.post('/auth/login', (req, res) => {
  //FIND A USER BASED ON UNIQUE USERNAME
  Users.findOne({
    username: req.body.username
  })
    .then(user => {
      if (!user) {
        return res.status(400).send(loginError)
      }
      //CHECK THE PASSWORD
      if (!user.validatePassword(req.body.password)) {
        return res.status(400).send(loginError)
      }
      //ALWAYS REMOVE THE PASSWORD FROM THE USER OBJECT
      delete user._doc.password
      req.session.uid = user._id
      res.send(user)
    }).catch(err => {
      res.status(400).send(loginError)
    })
})

//REMOVE THE ACTIVE SESSION FROM THE DATABASE
router.delete('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send(err)
    }
    return res.send({
      message: 'Logout Successful'
    })
  })
}),

  //DELETE A USER ACCOUNT
  router.delete('/auth/delete', (req, res, next) => {
    Users.findByIdAndRemove(req.session.uid, function (err) { })
      .then(() => res.send({ message: 'User Account Deleted' }))
      .catch(next)
  })

//VERIFIES USER HAS A VALID SESSION
router.get('/auth/authenticate', (req, res) => {
  Users.findById(req.session.uid)
    .then(user => {
      if (!user) {
        return res.status(401).send({
          error: 'Please login to continue'
        })
      }
      delete user._doc.password
      res.send(user)
    }).catch(err => {
      res.status(500).send(err)
    })
})

//RETRIEVE ANOTHER USER OBJECT TO VIEW THEIR PROFILE
router.get('/auth/find/byUsername/:username', (req, res, next) => {
  Users.findOne({ username: req.params.username })
    .then(user => {
      let obj = {
        userId: user._id,
        username: user.username,
        troll: user.troll,
        created: user.created,
        reliability: user.reliability,
        email: user.email
      }
      res.send(obj)
    })
    .catch(err => {
      console.log(err)
      next()
    })
}),

  //ADD A USER ID TO THE BLOCKED USERS DICTIONARY
  router.post('/auth/block', (req, res, next) => {
    Users.findById(req.session.uid)
      .then(user => {
        if (!user.blockedUsers) { user.blockedUsers = {} }
        user.blockedUsers[req.body.userId] = req.body.username
        user.markModified('blockedUsers')
        user.save((err) => {
          if (err) {
            return res.status(500).send(err)
          }
          delete user._doc.password
          return res.send(user)
        })
      })
  }),

  //REMOVE A USERID FROM THE BLOCKED USERS DICTIONARY
  router.post('/auth/unblock', (req, res, next) => {
    Users.findById(req.session.uid)
      .then(user => {
        delete user.blockedUsers[req.body.userId]
        user.markModified('blockedUsers')
        user.save((err) => {
          if (err) {
            return res.status(500).send(err)
          }
          delete user._doc.password
          return res.send(user)
        })
      })
  }),

  //ADD A POST ID & TITLE TO THE USER'S FAVORITES DICTIONARY
  router.post('/auth/favorite', (req, res, next) => {
    Users.findById(req.session.uid)
      .then(user => {
        if (!user.favorites) user.favorites = {}
        user.favorites[req.body._id] = req.body.title
        user.markModified('favorites')
        user.save((err) => {
          if (err) {
            return res.status(500).send(err)
          }
          delete user._doc.password
          return res.send(user)
        })
      })
  })

//REMOVE A POST ID/TITLE FROM THE USER'S FAVORITES DICTIONARY
router.post('/auth/unfavorite', (req, res, next) => {
  Users.findById(req.session.uid)
    .then(user => {
      delete user.favorites[req.body._id]
      user.markModified('favorites')
      user.save((err) => {
        if (err) {
          return res.status(500).send(err)
        }
        delete user._doc.password
        return res.send(user)
      })
    })
})

//strickly updates users posts with their current posts hopefully this hasnt been done anywhere else lol
router.post('/auth/post', (req, res, next) => {
  let toObj = {}
  for (let i = 0; i < req.body.voteArr.length; i++) {
    toObj[i] = req.body.voteArr[i]
  }
  Users.findById(req.body.userId)
    .then(user => {
      if (!user.posts) { user.posts = {} }
      user.posts = toObj
      user.markModified('posts')
      user.save((err) => {
        if (err) {
          console.log(err)
          return res.status(401).send(err)
        }
        return res.send(toObj)
      })
    })
    .catch(err => {
      console.log(err)
      next()
    })
})

//this one just updates the users reliabiliy based on about 200 other lines of code xD
router.post('/auth/reliability', (req, res, next) => {
  Users.findById(req.body.userId)
    .then(user => {
      let r = 50 + req.body.reliabliltyValue
      user.reliability = r
      user.markModified('reliability')
      user.save((err) => {
        if (err) {
          console.log(err)
          return res.status(401).send(err)
        }
        return res.send(user)
      })
    })
    .catch(err => {
      console.log(err)
      next()
    })
})




module.exports = {
  router,
  session
}