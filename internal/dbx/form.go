package dbx

import (
	"context"

	"dragonbytelabs/dz/internal/models"
)

// GetAllForms returns all forms
func (d *DB) GetAllForms(ctx context.Context) ([]models.Form, error) {
	query := MustQuery("get_all_forms.sql")
	rows, err := d.DBX.QueryxContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var forms []models.Form
	for rows.Next() {
		var form models.Form
		if err := rows.StructScan(&form); err != nil {
			return nil, err
		}
		forms = append(forms, form)
	}

	return forms, nil
}

// GetFormByID returns a form by its ID
func (d *DB) GetFormByID(ctx context.Context, id int64) (*models.Form, error) {
	query := MustQuery("get_form_by_id.sql")
	rows, err := d.DBX.NamedQueryContext(ctx, query, map[string]interface{}{"id": id})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		var form models.Form
		if err := rows.StructScan(&form); err != nil {
			return nil, err
		}
		return &form, nil
	}

	return nil, nil
}

// CreateForm creates a new form
func (d *DB) CreateForm(ctx context.Context, name, description, fields string) (int64, error) {
	query := MustQuery("create_form.sql")
	result, err := d.DBX.NamedExecContext(ctx, query, map[string]interface{}{
		"name":        name,
		"description": description,
		"fields":      fields,
	})
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// UpdateForm updates an existing form
func (d *DB) UpdateForm(ctx context.Context, id int64, name, description, fields string) error {
	query := MustQuery("update_form.sql")
	_, err := d.DBX.NamedExecContext(ctx, query, map[string]interface{}{
		"id":          id,
		"name":        name,
		"description": description,
		"fields":      fields,
	})
	return err
}
