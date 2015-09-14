var express = require('express')
  , http    = require('http')
  , appfunc = require('./appfunc')
  , debug   = require('debug')('twitter:listenter')
  , app     = express()
  , port    = appfunc.normalizePort(process.env.PORT || '3000')
  , logger  = require('morgan')
  , twitter = require('twitter');


app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.send('Hello World');
});


/*
 *  Setup Twitter to start pulling tweets
 *
 */
var client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});

client.stream('statuses/filter', {track: ''}, function(stream) {
  stream.on('data', function(tweet) {
    console.log(tweet.text);
  });
});


// catch 404 and forward to error handler
//
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/******************
 * error handlers
 ******************/
// development error handler
// will print stacktrace
//
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
//
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * start the webserver
 */
var server = http.createServer(app);
server.listen(port);
server.on('error', appfunc.onError);
server.on('listening', function() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
});
