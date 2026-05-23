INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, po.id
FROM roles r
CROSS JOIN permission_objects po
WHERE r.name = 'admin'
  AND po.name = 'admin'
ON CONFLICT DO NOTHING;
