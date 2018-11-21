var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var expressValidator = require('express-validator')
var LocalStratergy = require('passport-local').Strategy;
var multer = require('multer')
//handle file uploads
var upload = multer({dest:'./public/uploads/'})

var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var mongodb = require('mongodb');
var mangoose = require('mongoose');

var db = mangoose.connection;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//handle sessions
app.use(session({
  secret:'secret',
  saveUninitialized:true,
  resave:true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//validator
app.use(expressValidator({
  errorFormatter: function (param,msg,value) {
    var namespace = param.split('.')
    ,root = namespace.shift()
    , formParam = root;
    
    while(namespace.length){
      formParam+="["+namespace.shift()+"]"
    }
    return{
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*',function (req, res, next) {
  res.locals.user = req.user || null;
  next();
})


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  // req.flash('error','The URL Entered is wrong, Please Check and try again.')
  // res.location('/')
  // res.redirect('/')
});


module.exports = app;
