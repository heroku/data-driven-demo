//
// Aggergate the amount of tweets we're getting about a particular
// topic over some reporting interval
//
var pg            = require('pg')
  , db            = new pg.Client(process.env.DATABASE_URL)
  , moment        = require('moment')
  , kafka         = require('kafka-node')
  , url           = require('url')
  , zk_url        = url.parse(process.env.HEROKU_KAFKA_ZOOKEEPER_URL)
  , kafka_client  = new kafka.Client(
                      zk_url.host,
                      'demo-data-driven-dbconsumer'
                    )
  , topic         = 'twitter'
  , consumer      = new kafka.Consumer(
                      kafka_client,
                      [{ topic: topic, partition: 0 }],
                      {
                        autoCommit: false
                      }
                    )
  , tweet_counter = 0
  , report_int    = 5000;

db.connect();

var tweet_counter = 0;
consumer.on('message', function(message) {
  tweet_counter = tweet_counter + 1;
});

setInterval(function() {
  db.query(
    'INSERT into fact_aggregate_tweet (num_of_tweets, topic, created_at) values ($1, $2, $3)',
    [tweet_counter, topic, moment().format("YYYY-MM-DD HH:mm")]
  );
}, report_int);
