#!/bin/bash

# Script to fix catch blocks that reference error but were incorrectly renamed to _error
# This will find files with catch (_error) that still reference 'error' and fix them

echo "Finding files with catch (_error) that reference error..."

# Find all files with catch (_error)
files_with_catch_error=$(grep -r "catch (_error)" . --include="*.js" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules -l)

for file in $files_with_catch_error; do
  echo "Checking file: $file"
  
  # Check if this file has references to 'error' (not _error) after catch blocks
  if grep -q "catch (_error)" "$file" && grep -A 10 "catch (_error)" "$file" | grep -q "\berror\b" && ! grep -A 10 "catch (_error)" "$file" | grep -q "_error"; then
    echo "  -> Found references to 'error' after catch (_error), fixing..."
    # Replace catch (_error) back to catch (error) in this file
    sed -i '' 's/catch (_error)/catch (error)/g' "$file"
  else
    echo "  -> No error references found, keeping _error"
  fi
done

echo "Completed fixing catch blocks!"
