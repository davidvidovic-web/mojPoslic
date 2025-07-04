#!/bin/bash

# Fix all files with #getServerSession import and usage
echo "🔧 Fixing all #getServerSession references..."

# Files to fix
files=(
  "src/app/api/jobs/[id]/apply/route.ts"
  "src/app/api/company/jobs/route.ts"
  "src/app/api/stripe/checkout/route.ts"
  "src/app/api/user/change-password/route.ts"
  "src/app/api/user/connections/route.ts"
  "src/app/api/jobs/[id]/applications/route.ts"
  "src/app/api/user/profile/route.ts"
  "src/app/api/user/connections/simple/route.ts"
  "src/app/api/user/connections/history/route.ts"
  "src/app/api/user/delete/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix the import
    sed -i '' 's/import { #getServerSession } from '\''next-auth'\''/import { auth } from '\''@\/lib\/auth'\''/g' "$file"
    sed -i '' 's/import { authOptions } from '\''@\/lib\/auth'\''//g' "$file"
    
    # Fix the usage
    sed -i '' 's/#getServerSession(authOptions)/auth()/g' "$file"
    
    echo "✅ Fixed $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 All files fixed!"
