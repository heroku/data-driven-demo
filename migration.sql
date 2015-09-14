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
