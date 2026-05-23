INSERT INTO ui_item (name) VALUES ('admin_notice_categories')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO ui_permission_objects (ui_item_name, permission_id)
SELECT 'admin_notice_categories', po.id
FROM permission_objects po
WHERE po.name = 'admin'
ON CONFLICT DO NOTHING;
