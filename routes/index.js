var express = require('express');
var router = express.Router();

var Location = require('../models/location')
var Vehicle = require('../models/vehicle')

/* GET home page. */
router.get('/', function (req, res, next) {
  Location.find({}, null,{sort: {location_name: 1}},function (err, locations) {
    if (err) throw err
    res.render('main', {
      title: 'Vehicle Renting',
      locations: locations
    });
  })
});

router.get('/home', function (req, res, next) {
  Location.find({}, null,{sort: {location_name: 1}},function (err, locations) {
    if (err) throw err
    res.render('index', {
      title: 'Vehicle Renting',
      locations: locations
    });
    
  })
});
router.get('/:location_name', function (req, res, next) {
  location_name = req.params.location_name
  Vehicle.count({
    vehicle_location: location_name
  }, function (err, total_count) {
    if (err) throw err
    Vehicle.count({
      vehicle_location: location_name,
      vehicle_inuse: false
    }, function (err, inactive_count) {
      if (err) throw err
      Vehicle.find({
        vehicle_inuse: false,
        vehicle_location: location_name
      }, function (err, vehicles) {
        if (err) throw err
        res.render('location_vehicles', {
          title: 'Vehicle Renting in '+location_name.charAt(0).toUpperCase()+location_name.substring(1),
          location_name:location_name,
          vehicles: vehicles,
          total_count: total_count,
          inactive_count: inactive_count
        });
      })
    })

  })

});

router.get('/members', ensureAuthenticated, function (req, res, next) {
  res.render('member', {
    title: 'Members'
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/member')
}

module.exports = router;