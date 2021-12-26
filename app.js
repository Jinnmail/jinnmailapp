var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const validator = require('express-validator');
const { fileParser } = require('express-multipart-file-parser');
const routes = require("./routes");
const rateLimit = require('express-rate-limit')
require("dotenv").config()

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(validator());
var whitelist = ['http://localhost:3001', 'https://myaccount.jinnmail.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions));
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter); // Apply the rate limiting middleware to all requests
app.use(logger('dev'));
app.use(express.json({
  verify: function (req, res, buf) {
    if (req.originalUrl.includes('webhook')) {
      req.rawBody = buf.toString();
    }
  },
}));
app.use(express.urlencoded({
  extended: false
}));
app.use(fileParser({
    rawBodyOptions: {
        limit: '20mb',
    }
}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes)

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
});

module.exports = app;
