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
  , moment    = require('moment')
  , term      = 'beer';


/*********************************************************
 *
 * Initial Setup
 *
 */
var server = http.createServer(app)
  , io     = socket_io(server);
db.connect();
app.use(logger('common'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

if(process.env.SEARCH_TERM != "") {
  term = process.env.SEARCH_TERM;
}

/*********************************************************
 *
 * App Routes and Logic
 *
 */
app.get('/', function(req, res) {
  res.render('index', { term: term });
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

client.stream('statuses/filter', {track: term}, function(stream) {
  stream.on('data', function(msg) {
    var tweet = {
      tweet_id: msg.id_str,
      username: msg.user.name,
      screen_name: msg.user.screen_name,
      tweet: msg.text,
      profile_url: msg.user.profile_image_url,
      created_at: moment(msg.timestamp_ms, 'x')
    };
    io.sockets.emit('data', tweet);
    console.log("%j", { tweet_id: tweet.id, tweet: tweet.tweet, username: tweet.username });
    db.query(
      "INSERT into tweets (tweet_id, username, screen_name, tweet, profile_url, created_at) values ($1, $2, $3, $4, $5, $6)",
      [tweet.tweet_id, tweet.username, tweet.screen_name, tweet.tweet, tweet.profile_url, tweet.created_at.format("YYYY-MM-DD HH:mm")]
    );
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
