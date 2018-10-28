var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator()) //for using validation in form post methods
var User = require('../models/user')
var Vehicle = require('../models/vehicle')

/* GET users listing. */
router.get('/', function (req, res, next) {
    // res.send('respond with a resource');
    // User.find(function (err, users) {
    // if (err) return console.error(err);
    // var count;
    User.count(function (err, user_count) {
        if (err) throw err
        Vehicle.count(function (err,vehicle_count) {
            if(err) throw err
            res.render('admin', {
                title: 'admin',
                user_count: (user_count - 1),
                vehicle_count: vehicle_count
            })
        })
        
    })



    // })
});
router.get('/allusers', function (req, res, next) {
    User.find(function (err, users) {
        if (err) return console.error(err);
        res.render('allusers', {
            title: 'admin',
            users: users
        })
    })
});
router.get('/allvehicles', function (req, res, next) {
    Vehicle.find(function (err, vehicles) {
        if (err) return console.error(err);
        console.log(vehicles)
        res.render('allvehicles', {
            title: 'allvehicles',
            vehicles: vehicles
        })
    })
});
router.get('/addvehicle', function (req, res, next) {
    // res.send('respond with a resource');
    // User.find(function (err, users) {
    // if (err) return console.error(err);
    res.render('addvehicle', {
        title: 'addvehicle',
        // users: users
    })
    // })
});
router.post('/addvehicle', function (req, res, next) {

    var vehicle_id = req.body.vehicle_id;
    var vehicle_type = req.body.vehicle_type;
    var vehicle_name = req.body.vehicle_name;
    var vehicle_manuf = req.body.vehicle_manuf;

    req.checkBody('vehicle_id', 'Vehicle plate number is required').notEmpty();

    var errors = req.validationErrors();

    if (errors)
        res.render('addvehicle', {
            errors: errors
        });
    else {
        Vehicle.findOne({
            vehicle_id: vehicle_id
        }, function (err, vehicle) {
            if (err) throw err
            if (vehicle) {
                res.render('addvehicle', {
                    errors: [{
                        location: 'body',
                        param: '',
                        msg: 'Vehicle ID not Available',
                        value: ''
                    }]
                });
            } else {
                var newVehicle = new Vehicle({
                    vehicle_id: vehicle_id,
                    vehicle_type: vehicle_type,
                    vehicle_name: vehicle_name,
                    vehicle_manuf: vehicle_manuf
                });
                Vehicle.addVehicle(newVehicle, function (err, vehicle) {
                    if (err) throw err
                    console.log(vehicle)
                });
                req.flash('success', 'Vehicle Added')

                res.location('/');
                res.redirect('/admin/addvehicle')
            }
        })

    }
});

module.exports = router;