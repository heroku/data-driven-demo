CREATE TABLE IF NOT EXISTS tweets (
  id           serial,
  tweet_id     text,
  username     text,
  screen_name   text,
  tweet        text,
  profile_url  text,
  created_at   timestamp without time zone
);

CREATE INDEX tweets_created_at ON tweets (created_at);
CREATE INDEX tweets_id ON tweets (id);

CREATE TABLE IF NOT EXISTS fact_aggregate_tweet (
  num_of_tweets  integer,
  topic          text,
  created_at     timestamp without time zone
);

CREATE INDEX fct_agg_topic_and_created_at ON fact_aggreagte_tweet (topic, created_at);
