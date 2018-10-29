var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator()) //for using validation in form post methods
var User = require('../models/user')
var Vehicle = require('../models/vehicle')
var Session = require('../models/session')

var bcrypt = require('bcryptjs');
var flash = require('connect-flash')
var passport = require('passport');
var LocalStratergy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/member/:username', function (req, res, next) {
  // res.send('respond with a resource');
  var user_name = req.params.username;
  console.log(user_name)
  User.findOne({
    username: user_name
  }, function (err, users) {
    if (err) throw (err)
    Session.findOne({
      username: user_name
    }, function (err, session) {
      if (err) throw err
      if (session) {
        Vehicle.findOne({
          vehicle_id: session.vehicle_id,
        }, function (err, vehicle) {
          if (err) throw err
          res.render('member', {
            title: 'member',
            users: users,
            vehicle: vehicle,
            session: session
          })
          console.log("veh " + vehicle)
          console.log("users " + users)
          console.log("sessions " + session)
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
  Vehicle.find({vehicle_inuse:false},function (err, vehicles) {
    if (err) throw err
    res.render('bookvehicle', {
      title: 'bookvehicle',
      vehicles: vehicles
    });
  })
});

router.post('/member/:username/bookvehicle', function (req, res, next) {

  var username = req.params.username;
  console.log("inside bookvehicle " + username)
  var vehicle_id = req.body.vehicle_id;

  var newSession = new Session({
    username: username,
    vehicle_id: vehicle_id,
    session_start: Date.now()
  });
  Session.findOne({username: username,session_end: null}, function (err, user) {
    if (err) throw err
    if (user) {
      if (err) throw err
      req.flash('error', "user already in session")
      res.location('/');
      res.redirect('/users/member/'+username)
    } else {
      Session.addSession(newSession, function (err, session) {
        if (err) throw err
        console.log("/bookv post "+session)
        Vehicle.findOneAndUpdate({
          vehicle_id : session.vehicle_id
        },{
          vehicle_inuse : true
        },function (err,vehicle) {
          if(err) throw err
          console.log(vehicle)
        })
      });
      req.flash('success', 'you are now registered')
      res.location('/');
      res.redirect('/users/member/'+username)
    }
  })
  // }
  // }
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Login'
  });
});

router.post('/login',passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Invalid Username or password.'
  }),function (req, res) {
    req.flash('success', 'You are now logged in.')
    res.redirect('/')
  }
);

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
  var password2 = req.body.password2;

  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Invalid Email').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    // console.log(errors)
    res.render('register', {
      errors: errors
    });
  } else {
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
        req.flash('error', 'User already in session')
      } else {
        User.createUser(newUser, function (err, user) {
          if (err) throw err
        });
        req.flash('success', 'you are now registered')
        res.location('/');
        res.redirect('/')
      }
    })
  }
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
      res.redirect('/users/member/'+req.params.username)
    }
  })
});


router.post('/member/:username/returnvehicle', function (req, res) {
  Session.findOneAndUpdate({
    username: req.params.username,
    session_end: null
  }, {
    session_end: Date.now()
  }, function (err, session) {
    if (err) throw err
    if (session) {
      Vehicle.findOneAndUpdate({
        vehicle_id : session.vehicle_id
      },{
        vehicle_inuse : false
      },function (err,vehicle) {
        if(err) throw err
        console.log(vehicle)
        req.flash('success', 'you have returned the vehicle')
        res.redirect('/users/member/'+req.params.username)
        console.log('username')
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