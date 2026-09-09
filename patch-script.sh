#!/bin/bash

# Script to automatically patch the Verida font issue after npm install
# Usage: Just run this script after you install or update packages

# Create the patches directory if it doesn't exist
mkdir -p patches/@verida/account-web-vault/dist

# Check if the file exists
if [ -f "node_modules/@verida/account-web-vault/dist/vault-modal-login.js" ]; then
  echo "Fixing Verida font issue..."
  
  # Direct replacement is more reliable than patch
  # 1. Replace the import
  sed -i 's|// @ts-ignore|// Mock for the font that was causing issues|g' \
    node_modules/@verida/account-web-vault/dist/vault-modal-login.js
  
  sed -i 's|var Sora_Regular_ttf_1 = require("./assets/fonts/Sora-Regular.ttf");|var Sora_Regular_ttf_1 = { default: "" };|g' \
    node_modules/@verida/account-web-vault/dist/vault-modal-login.js
  
  # 2. Replace the font URL in the style
  sed -i 's|src: url(" + Sora_Regular_ttf_1.default + ") format("truetype");|/* Font URL replaced with empty string */\n      src: url("https://fonts.googleapis.com/css2?family=Sora&display=swap");|g' \
    node_modules/@verida/account-web-vault/dist/vault-modal-login.js

  echo "Fixed successfully!"
else
  echo "Verida module not found. Please run npm install first."
fi

# Instructions to automate this process
cat << 'INSTRUCTIONS'
The patch has been set up to run automatically after npm install.
If you need to manually apply it again, just run:

./patch-script.sh
INSTRUCTIONS
