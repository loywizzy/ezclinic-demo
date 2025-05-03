package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// PermissionDetail represents a module permission
type PermissionDetail struct {
	Module    string `json:"module" db:"module"`
	CanView   bool   `json:"can_view" db:"can_view"`
	CanCreate bool   `json:"can_create" db:"can_create"`
	CanUpdate bool   `json:"can_update" db:"can_update"`
	CanDelete bool   `json:"can_delete" db:"can_delete"`
}

// PermissionGroup represents a group with its details
type PermissionGroup struct {
	ID      int                `json:"id" db:"id"`
	Name    string             `json:"name" db:"name"`
	Details []PermissionDetail `json:"details"`
}

// ListPermissions returns all groups with their module permissions
func ListPermissions(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		const query = `
		SELECT
		  g.id,
		  g.name,
		  COALESCE(d.module, '')      AS module,
		  COALESCE(d.can_view, false) AS can_view,
		  COALESCE(d.can_create, false) AS can_create,
		  COALESCE(d.can_update, false) AS can_update,
		  COALESCE(d.can_delete, false) AS can_delete
		FROM permission_groups g
		LEFT JOIN permission_details d ON g.id = d.group_id
		ORDER BY g.id, module
		`

		rows, err := db.Queryx(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		groups := make([]PermissionGroup, 0)
		var current *PermissionGroup

		for rows.Next() {
			var (
				gid    int
				gname  string
				detail PermissionDetail
			)
			if err := rows.Scan(
				&gid, &gname,
				&detail.Module, &detail.CanView, &detail.CanCreate,
				&detail.CanUpdate, &detail.CanDelete,
			); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			if current == nil || current.ID != gid {
				grp := PermissionGroup{ID: gid, Name: gname}
				groups = append(groups, grp)
				current = &groups[len(groups)-1]
			}

			// append detail if module is present
			if detail.Module != "" {
				current.Details = append(current.Details, detail)
			}
		}

		c.JSON(http.StatusOK, groups)
	}
}

// CreatePermissionGroup creates a group and its details
func CreatePermissionGroup(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var grp PermissionGroup
		if err := c.ShouldBindJSON(&grp); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// start transaction
		tx := db.MustBegin()

		// fetch existing IDs
		var ids []int
		if err := tx.Select(&ids, "SELECT id FROM permission_groups ORDER BY id ASC"); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// find smallest missing ID
		nextID := 1
		for _, id := range ids {
			if id == nextID {
				nextID++
			} else if id > nextID {
				break
			}
		}

		// insert group with explicit ID
		if _, err := tx.Exec(
			"INSERT INTO permission_groups (id, name) VALUES ($1, $2)",
			nextID, grp.Name,
		); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// update sequence to max(id)
		if _, err := tx.Exec(
			"SELECT setval(pg_get_serial_sequence('permission_groups','id'), (SELECT MAX(id) FROM permission_groups))",
		); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// insert details
		for _, d := range grp.Details {
			if _, err := tx.Exec(
				"INSERT INTO permission_details (group_id, module, can_view, can_create, can_update, can_delete) VALUES ($1,$2,$3,$4,$5,$6)",
				nextID, d.Module, d.CanView, d.CanCreate, d.CanUpdate, d.CanDelete,
			); err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		// commit transaction
		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// return new ID
		c.JSON(http.StatusCreated, gin.H{"id": nextID})
	}
}

// UpdatePermissionGroup updates a group name & its details
func UpdatePermissionGroup(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		grpID, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}

		var grp PermissionGroup
		if err := c.ShouldBindJSON(&grp); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		tx := db.MustBegin()

		// update group name
		if _, err := tx.Exec(
			`UPDATE permission_groups SET name=$1 WHERE id=$2`, grp.Name, grpID,
		); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// delete old details
		if _, err := tx.Exec(
			`DELETE FROM permission_details WHERE group_id=$1`, grpID,
		); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// insert new details
		for _, d := range grp.Details {
			if _, err := tx.Exec(
				`INSERT INTO permission_details
				  (group_id, module, can_view, can_create, can_update, can_delete)
				VALUES ($1,$2,$3,$4,$5,$6)`,
				grpID, d.Module, d.CanView, d.CanCreate, d.CanUpdate, d.CanDelete,
			); err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	}
}

// DeletePermissionGroup deletes a group (cascade deletes details)
func DeletePermissionGroup(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		gid := c.Param("id")
		if _, err := db.Exec(`DELETE FROM permission_groups WHERE id=$1`, gid); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	}
}
