SELECT id, name, display_name, description, version, is_active, sidebar_icon, sidebar_title, sidebar_link, created_at, updated_at
FROM dz_plugins
WHERE name = :name;
