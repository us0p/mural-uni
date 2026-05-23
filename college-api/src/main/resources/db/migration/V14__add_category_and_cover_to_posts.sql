ALTER TABLE posts ADD COLUMN cover_img_url TEXT;

ALTER TABLE posts ADD COLUMN category_id INT REFERENCES post_category(id);
UPDATE posts SET category_id = (SELECT id FROM post_category WHERE name = 'general') WHERE category_id IS NULL;
ALTER TABLE posts ALTER COLUMN category_id SET NOT NULL;
