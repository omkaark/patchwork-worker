-- Migration number: 0004 	 2025-12-27T21:02:09.331Z
ALTER TABLE users ADD COLUMN github_username TEXT;
ALTER TABLE users ADD COLUMN github_avatar_url TEXT;
ALTER TABLE users ADD COLUMN github_name TEXT;
ALTER TABLE users ADD COLUMN github_html_url TEXT;
ALTER TABLE users ADD COLUMN github_created_at TEXT;
ALTER TABLE users ADD COLUMN github_company TEXT;
ALTER TABLE users ADD COLUMN github_location TEXT;
ALTER TABLE users ADD COLUMN github_bio TEXT;
ALTER TABLE users ADD COLUMN github_followers INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN github_twitter_username TEXT;