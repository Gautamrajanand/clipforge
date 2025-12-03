#!/bin/bash

# Fix admin access for Clerk user

echo "🔧 Fixing admin access..."

# Update the user with Clerk email to be admin
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "
UPDATE \"User\" 
SET \"isAdmin\" = true 
WHERE email LIKE '%@clerk.local';
"

echo "✅ Admin access granted!"
echo ""
echo "Now refresh your browser and try again."
