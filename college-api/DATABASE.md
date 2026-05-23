Table permission_objects {
    id int PK
    name varchar(20) UNIQUE NOT NULL
}

Table roles {
    id int PK
    name varchar(20) UNIQUE NOT NULL
}

Table ui_item {
    name varchar(20) PK
}

Table ui_permission_objects {
    id int PK
    ui_item_name NOT NULL references ui_item(name)
    permission_id int NOT NULL references permission_objects(id)
}

Table role_permissions {
    id int PK
    role_id int NOT NULL references roles(id)
    permission_id int NOT NULL references permission_objects(id)
}

Table users {
    id int PK
    username varchar(20) UNIQUE NOT NULL
    password_hash varchar(60)
    email varchar(254) UNIQUE NOT NULL
    phone_number varchar(20) UNIQUE
    role_id int NOT NULL references roles(id)
    ra varchar(10) UNIQUE
}

Table password_reset_tokens {
    id int PK
    user_id int NOT NULL references users(id)
    token varchar(64) UNIQUE NOT NULL
    expires_at datetimetz NOT NULL
    used_at datetimetz
}

Table notices {
    id int PK
    user_id int NOT NULL references users(id)
    title varchar(200) NOT NULL
    markdown_content text NOT NULL
    created_at datetimetz NOT NULL
    updated_at datetimetz NOT NULL
    deleted_at datetimetz
    cover_img_url text
    category_id int NOT NULL references notice_category(id)
}

Table notice_category {
    id int PK
    name varchar(20) NOT NULL UNIQUE
}

Table documents {
    id int PK
    user_id int NOT NULL references users(id)
    file_name varchar(100) UNIQUE NOT NULL
    description text
    file_size int NOT NULL
    bucket_url varchar(255) UNIQUE NOT NULL
    knowledge_base boolean NOT NULL default false
}

Table document_embedding {
    id int PK
    document_id int NOT NULL references documents(id)
    embedding vector(768) NOT NULL
}
