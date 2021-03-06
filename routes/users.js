var express = require('express');
var router = express.Router();
var User = require('../models/user')
var Vehicle = require('../models/vehicle')
var Session = require('../models/session')
var Locations = require('../models/location')

var bcrypt = require('bcryptjs');
var flash = require('connect-flash')
var passport = require('passport');
var LocalStratergy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/member/:username', function (req, res, next) {
  var user_name = req.params.username;
  console.log(user_name)
  User.findOne({
    username: user_name
  }, function (err, users) {
    if (err) throw (err)
    Session.find({
      username: user_name
    }, function (err, sessions) {
      if (err) throw err
      if (sessions) {
        Vehicle.find({
          vehicle_id: sessions.vehicle_id,
        }, function (err, vehicle) {
          if (err) throw err
          res.render('member', {
            title: 'member',
            users: users,
            vehicle: vehicle,
            sessions: sessions
          })
        })
      } else {
        res.render('member', {
          title: 'member',
          users: users,
          vehicle: null,
          session: null
        })
        // console.log("veh " + vehicle)
        console.log("users " + users)
        // console.log("sessions " + session)
      }
    });
  });
});

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'Register'
  });
});


router.get('/member/:username/bookvehicle', function (req, res, next) {
  Locations.find({},null,{sort:{location_name:1}},function (err, locations) {
    if (err) throw err
    res.render('bookvehicle', {
      title: 'bookvehicle',
      locations : locations
    });
    // console.log(locations)
  })
});

router.post('/member/:username/bookvehicle', function (req, res, next) {

  var username = req.params.username;
  // console.log("inside bookvehicle " + Date.now())
  var vehicle_id = req.body.vehicle_id;

  var newSession = new Session({
    username: username,
    vehicle_id: vehicle_id,
    session_start: Date.now()
  });
  Session.findOne({
    username: username,
    session_end: null
  }, function (err, user) {
    if (err) throw err
    if (user) {
      if (err) throw err
      req.flash('error', "You can book only one Vehicle at a time, Please return the booked Vehicle if you want to book a new Vehicle.")
      res.location('/');
      res.redirect('/users/member/' + username)
    } else {
      Session.addSession(newSession, function (err, session) {
        if (err) throw err
        // console.log("/bookv post " + session)
        Vehicle.findOneAndUpdate({
          vehicle_id: session.vehicle_id
        }, {
          vehicle_inuse: true
        }, function (err, vehicle) {
          if (err) throw err
          // console.log(vehicle)
        })
      });
      req.flash('success', `You have successfully booked vehicle with plate no. ${vehicle_id}`)
      res.location('/');
      res.redirect('/users/member/' + username)
    }
  })
  // }
  // }
});

router.get('/member/:username/bookvehicle/:location', function (req, res, next) {
  var vehicle_location = req.params.location
  Vehicle.find({
    vehicle_inuse: false,
    vehicle_location: vehicle_location
  }, function (err, vehicles) {
    if (err) throw err
    res.json(vehicles)
  })
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Login'
  });
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/users/login',
  failureFlash: 'Invalid Username or password.'
}), function (req, res) {
  req.flash('success', 'You are now logged in.')
  res.redirect('/home')
});

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  // console.log(id + "id")
  User.getUserById(id, function (err, user) {
    // console.log(user.id + "getuser")
    done(err, user);
  });
});

passport.use(new LocalStratergy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      return done(null, false, {
        message: 'Unknown User'
      });
    }

    User.comparePasswords(password, user.password, function (err, isMatch) {
      if (err) return done(err);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: 'Invalid Password'
        });
      }
    });
  });
}));

router.post('/register', function (req, res, next) {

  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;

  var newUser = new User({
    name: name,
    email: email,
    username: username,
    password: password
  });

  User.findOne({
    username: newUser.username
  }, function (err, user) {
    if (err) throw err
    if (user) {
      req.flash('error', 'Username already taken, Please select a different Username.')
      res.location('/');
      res.redirect('/users/register')
      console.log(user)
    } else {
      User.createUser(newUser, function (err, user) {
        if (err) throw err
        req.flash('success', 'You are now a Registered User.')
        res.location('/');
        res.redirect('/home')
      });
    }
  })
});


router.get('/member/:username/returnvehicle', function (req, res) {
  Session.findOne({
    username: req.params.username,
    session_end: null
  }, function (err, session) {
    if (err) throw err
    // console.log("/session "+session)
    if (session) {
      res.render('returnvehicle', {
        title: 'returnvehicle',
        session: session
      });
    } else {
      req.flash('error', 'no booked vehicle')
      res.location('/')
      res.redirect('/users/member/' + req.params.username)
    }
  })
});

router.post('/member/:username/returnvehicle', function (req, res) {
  var session_end = req.body.session_end
  // console.log(session_end)
  Session.findOneAndUpdate({
    username: req.params.username,
    session_end: null
  }, {
    session_end: session_end
  }, function (err, session) {
    if (err) throw err
    if (session) {
      Vehicle.findOneAndUpdate({
        vehicle_id: session.vehicle_id
      }, {
        vehicle_inuse: false
      }, function (err, vehicle) {
        if (err) throw err
        // console.log(vehicle)
        req.flash('success', 'you have returned the vehicle')
        res.redirect('/users/member/' + req.params.username)
        // console.log('username')
      })
    } else {
      console.log("no session")
    }
  })
});

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'You are now Logged out')
  res.redirect('/users/login')
})
module.exports = router;