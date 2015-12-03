# Data Driven Demo

This is a demonstration of everything that you can do with new-fangled data
concepts. The heart of this demo is Heroku Kafka and the Twitter Search API. The
intention is to show both sides of producing and consuming information.

## Architecture

Need to add an image here of what's going on

## Deploying Project

Put a button deploy here

1. Deploy the project. Button deploy yay!
2. Sign up for a [Twitter developer account](https://dev.twitter.com/)
3. Once you have your OAuth keys, assign them to the appropriate config vars.
4. Set the ```SEARCH_TERM``` config var for what you want to search on in
   Twitter.
5. Start showing things off!

## Running Locally

To run locally, you should use foreman because theres quite a few environment
variables you're going to need to get it running:

```
DATABASE_URL
HEROKU_KAFKA_ZOOKEEPER_URL
CASSANDRA_URL
CONSUMER_KEY
CONSUMER_SECRET
ACCESS_TOKEN
ACCESS_TOKEN_SECRET
```
