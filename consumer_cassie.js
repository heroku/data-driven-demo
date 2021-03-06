var cassandra     = require('cassandra-driver')
  , url           = require('url')
  , moment        = require('moment')
  , topic         = 'twitter'
  , zk_url        = url.parse(process.env.HEROKU_KAFKA_ZOOKEEPER_URL)
  , kafka         = require('kafka-node')
  , kafka_client  = new kafka.Client(
                      zk_url.host,
                      'demo-data-driven-producer'
                    )
  , consumer      = new kafka.Consumer(
                      kafka_client,
                      [{ topic: topic, partition: 0 }],
                      {
                        autoCommit: false
                      }
                    );

//
// We need to process the cassandra uris from the config var before
// we can actually connect to cluster.
//
var cassandra_uri  = process.env.CASSANDRA_URL.split(',')
  , contact_points = []
  , username       = ""
  , password       = ""
  , keyspace       = "";

for(var i = 0; i < cassandra_uri.length; i++) {
  var parsed_uri = url.parse(cassandra_uri[i]);
  contact_points.push(parsed_uri.hostname);
  var auth = parsed_uri.auth.split(':');
  username = auth[0];
  password = auth[1];
  keyspace = parsed_uri.path.replace('/','');
}

var authProvider  = new cassandra.auth.PlainTextAuthProvider(username, password)
  , client        = new cassandra.Client({
                      contactPoints: contact_points,
                      authProvider: authProvider,
                      keyspace: keyspace,
                      sslOptions: {
                        cert: process.env.CASSANDRA_TRUSTED_CERT,
                        secureProtocol: 'TLSv1_method'
                      }
                    });

var checkIt = function(err) {
  if(err) {
    client.shutdown();
    return console.log(err);
  }
}

//
// The magic happens here
//
client.connect(function(err) {
  if(err) {
    client.shutdown();
    return console.log("There was an error connecting", err);
  }

  // Create the keyspace and table if it doesn't already exist
  //
  client.execute("CREATE TABLE IF NOT EXISTS tweets (tweet_id bigint, username text, screen_name text, tweet text, profile_url text, created_at timestamp, PRIMARY KEY (username, created_at))", checkIt);

  console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
  console.log('Keyspaces: %j', Object.keys(client.metadata.keyspaces));

  // Stream all of the data from kafka into Cassandra
  //
  consumer.on('message', function(message) {
    var query    = "INSERT INTO tweets (tweet_id, username, screen_name, tweet, profile_url, created_at) values (?, ?, ?, ?, ?, ?)";
    var msg      = JSON.parse(message.value);
    var new_date = moment(msg.created_at, 'x');
    var params   = [msg.tweet_id, msg.username, msg.screen_name, msg.tweet, msg.profile_url, new_date.format("YYYY-MM-DD HH:mm")];
    console.log(msg.tweet_id, "inserted tweet");
    client.execute(query, params, { prepare: true }, checkIt);
  });
});
