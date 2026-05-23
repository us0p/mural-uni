INSERT INTO permission_objects (name) VALUES ('admin')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO ui_item (name) VALUES
    ('admin_dashboard'),
    ('admin_blog_post'),
    ('admin_documents'),
    ('admin_users'),
    ('admin_access_groups');

INSERT INTO ui_permission_objects (ui_item_name, permission_id)
SELECT ui.name, po.id
FROM ui_item ui
CROSS JOIN permission_objects po
WHERE ui.name IN ('admin_dashboard','admin_blog_post','admin_documents','admin_users','admin_access_groups')
  AND po.name = 'admin';
