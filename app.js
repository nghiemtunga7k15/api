var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var cors = require('cors')

/*---------------router main--------*/
var usersMainRouter = require('./routes/api');


var app = express();
require('dotenv').config()


var mongoose = require('mongoose');


// Connect To Database
const MONGODB_URI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;
const authData =  {
    "user": `${process.env.DB_USERNAME}`,
    "pass": `${process.env.DB_PASSWORD}`,
    "useNewUrlParser": true,
    "useCreateIndex": true
}; 
mongoose.connect(
    MONGODB_URI, 
    authData,
    (err) => {
        if (!err) { console.log('MongoDB connection succeeded.'); }
        else { console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2)); }
    }
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: null }}))
app.use(cors());

//api user main
app.use('/', usersMainRouter);

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
