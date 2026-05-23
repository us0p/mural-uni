CREATE TABLE IF NOT EXISTS ui_item (
    name VARCHAR(50) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS ui_permission_objects (
    id            SERIAL PRIMARY KEY,
    ui_item_name  VARCHAR(50) NOT NULL REFERENCES ui_item(name) ON DELETE CASCADE,
    permission_id INT         NOT NULL REFERENCES permission_objects(id) ON DELETE CASCADE,
    CONSTRAINT uq_ui_item_permission UNIQUE (ui_item_name, permission_id)
);
