'use strict'

const express = require('express')
const router = express.Router()

// models - for the database info
const Users = require('../../models/users')

class UserRoute {
  // Define the routes
  constructor () {
    // Get Routes
    router.get('/:user', this.getUser)

    // Post Routes
    router.post('/create', this.createUser)
    router.post('/login', this.loginUser)

    return router
  }

  // Get all of the users and return a formatted array
  async getUsers(req, res) {
    const users = await Users.find()
    const users_formatted = users.map(user => {
        return user.toJSON()
    })
    res.status(200).send(users_formatted)
  }

  // Get a single user back
  async getUser(req, res) {
    const user = await Users.find({name: req.params.user})
    if (!user) {
      return res.status(204).send('No user with that name')
    }
    user = user.toJSON()
    res.status(200).send(user)
  }  
  
  async loginUser (req, res) {
    const body = req.body.user

    // Find user and then check their password
    const user = await Users.findOne({ email: body.email })
    if (!user?.validPassword(body.password)) return res.status(401).send('Username or Password incorrect')

    const response = user.toAuthJSON()

    // Return the user to ther client
    res.status(200).send(response)
  }

  // Create a new user
  async createUser(req, res) {
    const body = req.body.user

    // Create user
    const user = new Users({

      // Name field is an object in the database, so we fill in the two expected results
      name: {
        first: body.name.first,
        last: body.name.last
      },
      email: body.email,
    })
    user.setPassword(body.password)

    // save user to database
    try {
      const created = await user.save()
      console.log('Created User')
      
      res.send(created)
    } catch (error) {
      console.error(error)
      return res.status(500).send('A problem occured trying to save the user')
    }

  }
}

module.exports = new UserRoute()
