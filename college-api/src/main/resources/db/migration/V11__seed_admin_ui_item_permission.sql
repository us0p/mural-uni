INSERT INTO ui_item (name) VALUES ('admin_ui_item')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO ui_permission_objects (ui_item_name, permission_id)
SELECT 'admin_ui_item', po.id
FROM permission_objects po
WHERE po.name = 'admin'
ON CONFLICT DO NOTHING;
