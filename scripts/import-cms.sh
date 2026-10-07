#!/bin/bash

# Script to import CMS content model files into the configured CMS hub.
# Usage: ./scripts/import-cms.sh
# Requires CMS_PROVIDER=amplience and Amplience credentials in .env

set -e

SCHEMAS_DIR=".scayle/cms/contentModel/amplience/schemas"
CONTENT_TYPES_DIR=".scayle/cms/contentModel/amplience/content-types"

# Load environment variables from .env file if it exists
# This approach safely handles:
# - Empty lines
# - Comment lines (lines starting with #)
# - Inline comments (e.g., KEY=value # comment)
# - Values with quotes (e.g., KEY='value' or KEY="value")
# - Values with special characters or spaces
if [ -f ".env" ]; then
    echo "📄 Loading environment variables from .env file..."
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comment-only lines
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

        # Remove inline comments (everything after # on the line)
        line=$(echo "$line" | sed 's/#.*$//')

        # Remove surrounding quotes from values (both single and double quotes)
        # Pattern 1: Remove quotes after = sign (handles KEY='value' -> KEY=value)
        # Pattern 2: Remove trailing quotes and whitespace
        # Use [[:space:]]* not \s*: BSD sed treats \s as literal "s", which strips
        # the first "s" from values like storyblok.
        line=$(echo "$line" | sed "s/=[[:space:]]*['\"]*/=/;s/['\"]*[[:space:]]*$//")

        # Export the cleaned variable
        export "$line"
    done < .env
fi

if [ -z "$CMS_PROVIDER" ]; then
    echo "Error: CMS_PROVIDER environment variable is not set"
    echo "Please set CMS_PROVIDER to 'amplience' before importing"
    exit 1
fi

case "$CMS_PROVIDER" in
    "amplience")
        echo "🚀 Importing Amplience content model into hub..."

        REQUIRED_AMPLIENCE_VARS=("AMPLIENCE_PERSONAL_ACCESS_TOKEN" "AMPLIENCE_HUB_ID")

        for VAR in "${REQUIRED_AMPLIENCE_VARS[@]}"; do
            if ! grep -q "^$VAR=" ".env"; then
                echo "❌ Error: Required variable '$VAR' not found in .env"
                exit 1
            fi
        done

        if ! grep -q "^NUXT_PUBLIC_CMS_HUB_NAME=" ".env"; then
            echo "❌ Error: Required variable 'NUXT_PUBLIC_CMS_HUB_NAME' not found in .env"
            exit 1
        fi

        HUB_NAME="$NUXT_PUBLIC_CMS_HUB_NAME"

        if [ ! -d "$SCHEMAS_DIR" ]; then
            echo "❌ Error: Schema directory not found at $SCHEMAS_DIR"
            exit 1
        fi

        if [ ! -d "$CONTENT_TYPES_DIR" ]; then
            echo "❌ Error: Content type directory not found at $CONTENT_TYPES_DIR"
            exit 1
        fi

        if ! pnpm exec dc-cli --version >/dev/null 2>&1; then
            echo "❌ Error: dc-cli is not available. Run 'pnpm install' in v2/boilerplate first."
            exit 1
        fi

        echo "📝 Configuring dc-cli for hub '$HUB_NAME' (ID: $AMPLIENCE_HUB_ID)..."
        pnpm exec dc-cli configure --patToken "$AMPLIENCE_PERSONAL_ACCESS_TOKEN" --hubId "$AMPLIENCE_HUB_ID"

        echo "📤 Importing content type schemas from $SCHEMAS_DIR..."
        pnpm exec dc-cli content-type-schema import "$SCHEMAS_DIR"

        echo "📤 Importing content types from $CONTENT_TYPES_DIR..."
        pnpm exec dc-cli content-type import "$CONTENT_TYPES_DIR"

        echo "✅ Amplience import completed successfully!"
        ;;
    *)
        echo "ℹ️  No import steps defined for CMS_PROVIDER value '$CMS_PROVIDER'. Nothing to import."
        exit 1
        ;;
esac

echo "🎉 CMS import process completed!"
