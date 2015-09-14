var express   = require('express')
  , path      = require('path')
  , http      = require('http')
  , appfunc   = require('./appfunc')
  , debug     = require('debug')
  , app       = express()
  , socket_io = require('socket.io')
  , port      = appfunc.normalizePort(process.env.PORT || '3000')
  , logger    = require('morgan')
  , twitter   = require('twitter')
  , pg        = require('pg')
  , db        = new pg.Client(process.env.DATABASE_URL)
  , moment    = require('moment');


/*********************************************************
 *
 * Initial Setup
 *
 */
var server = http.createServer(app)
  , io     = socket_io(server);
db.connect();
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


/*********************************************************
 *
 * App Routes and Logic
 *
 */
app.get('/', function(req, res) {
  res.render('index');
});

io.on('connection', function(socket) {
  console.log('Client Connected');
});


/*********************************************************
 *
 *  Setup Twitter to start pulling tweets
 *
 */
var client = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

client.stream('statuses/filter', {track: 'rimas dreamforce'}, function(stream) {
  stream.on('data', function(tweet) {
    var short_tweet = {
      tweet_id: tweet.id_str,
      username: tweet.user.name,
      tweet: tweet.text,
      profile_url: tweet.user.profile_image_url,
      created_at: moment(tweet.timestamp_ms, 'x')
    };
    console.log(short_tweet);
    io.sockets.emit('data',short_tweet);
    //db.query("INSERT into tweets () values ()", );
  });
});

/************************************************************
 *
 *  Error handling and rest of the middle ware to get going
 *
 */
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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


/*******************************************************
 *
 * Starting the Webserver
 *
 */
server.listen(port);
server.on('error', appfunc.onError);
server.on('listening', function() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
});
