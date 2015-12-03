//
// This program will pull information off the status/filter on twitter
// and stuff the tweets into kafka. This assumes that the topic has
// already been created in kafka
//
var twitter       = require('twitter')
  , term          = 'beer'
  , url           = require('url')
  , zk_url        = url.parse(process.env.HEROKU_KAFKA_ZOOKEEPER_URL)
  , kafka         = require('kafka-node')
  , kafka_client  = new kafka.Client(
                      zk_url.host,
                      'demo-data-driven-producer'
                    )
  , producer      = new kafka.Producer(kafka_client)
  , topic         = 'twitter';

//
// Override the search term if an env var exists
//
if(process.env.SEARCH_TERM && process.env.SEARCH_TERM !== "") {
  term = process.env.SEARCH_TERM;
}

var twitter_client = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

producer.on('error', function(err) {
  console.log(err);
});

producer.on('ready', function() {
  console.log("Kafka Producer Ready");

  twitter_client.stream('statuses/filter', { track: term }, function(stream) {
    stream.on('data', function(msg) {
      var tweet = {
        tweet_id: msg.id_str,
        username: msg.user.name,
        screen_name: msg.user.screen_name,
        tweet: msg.text,
        profile_url: msg.user.profile_image_url,
        created_at: msg.timestamp_ms
      };
      producer.send([{ topic: topic, messages: JSON.stringify(tweet) }], function(err, data) {
        console.log(data);
      });
    });

    stream.on('error', function(msg) {
      console.log(msg);
    });
  });
});
