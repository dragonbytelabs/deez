UPDATE site_settings 
SET setting_value = :setting_value, updated_at = CURRENT_TIMESTAMP 
WHERE setting_key = :setting_key;
