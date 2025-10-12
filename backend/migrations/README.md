# Database Migrations

## Add Cloudinary Public IDs Migration

This migration adds two new columns to the `projects` table to store Cloudinary public IDs for uploaded files:
- `reportPublicId` - Stores the Cloudinary public ID for project reports (PDFs)
- `presentationPublicId` - Stores the Cloudinary public ID for presentations (PPTs)

These columns are required for the delete functionality to work properly.

### Option 1: Run JavaScript Migration (Recommended)

```bash
cd backend
node migrations/add_cloudinary_public_ids.js
```

### Option 2: Run SQL Migration Manually

1. Connect to your MySQL database
2. Run the SQL script:

```bash
mysql -u your_username -p your_database_name < migrations/add_cloudinary_public_ids.sql
```

Or copy and paste the SQL commands from `add_cloudinary_public_ids.sql` into your MySQL client.

### Verify Migration

After running the migration, verify the columns were added:

```sql
DESCRIBE projects;
```

You should see `reportPublicId` and `presentationPublicId` in the column list.

### Important Notes

- This migration is **safe to run** - it only adds new columns and doesn't modify existing data
- The columns are nullable, so existing records won't be affected
- After running this migration, restart your backend server for the changes to take effect
