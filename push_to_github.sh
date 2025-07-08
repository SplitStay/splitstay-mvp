#!/bin/bash

# Script to push SplitStay MVP code to GitHub
echo "Pushing SplitStay MVP code to GitHub..."

# Remove lock files
rm -f .git/index.lock
rm -f .git/objects/maintenance.lock

# Add all files
git add .

# Commit with descriptive message
git commit -m "Update SplitStay MVP: 
- Fixed room-sharing validation for twin beds
- Enhanced booking link parsing
- Improved navigation and back button functionality
- Added comprehensive currency detection (70+ currencies)
- Enhanced accommodation details extraction"

# Push to GitHub
git push origin main

echo "Code pushed to GitHub successfully!"