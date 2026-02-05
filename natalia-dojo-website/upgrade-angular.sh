#!/bin/bash

# Angular Upgrade Script
# This script helps automate the Angular upgrade process
# Usage: ./upgrade-angular.sh [version] (e.g., ./upgrade-angular.sh 18)

set -e  # Exit on error

VERSION=${1:-19}  # Default to Angular 19
CURRENT_VERSION=$(node -p "require('./package.json').dependencies['@angular/core']" | sed 's/[^0-9.]//g' | cut -d. -f1)

echo "========================================="
echo "Angular Upgrade Script"
echo "========================================="
echo "Current Angular Version: $CURRENT_VERSION"
echo "Target Angular Version: $VERSION"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create backup branch
echo "📦 Creating backup branch..."
git checkout -b "upgrade/angular-$VERSION-backup" || echo "Branch may already exist"
git add .
git commit -m "Backup before Angular $VERSION upgrade" || echo "No changes to commit"

# Check Node.js version
echo ""
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo "✅ Node.js version is compatible (v$(node -v))"
else
    echo "⚠️  Warning: Node.js version $(node -v) may not be compatible with Angular $VERSION"
    echo "   Recommended: Node.js 20.x LTS or 22.x LTS"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Clean install
echo ""
echo "🧹 Cleaning node_modules..."
rm -rf node_modules package-lock.json

# Update Angular CLI globally
echo ""
echo "⬆️  Updating Angular CLI globally..."
npm install -g @angular/cli@$VERSION

# Update Angular packages
echo ""
echo "⬆️  Updating Angular core packages to v$VERSION..."
ng update @angular/core@$VERSION @angular/cli@$VERSION --force --allow-dirty || {
    echo "⚠️  ng update failed. Trying manual update..."
    npm install @angular/core@^$VERSION.0.0 \
                @angular/common@^$VERSION.0.0 \
                @angular/compiler@^$VERSION.0.0 \
                @angular/forms@^$VERSION.0.0 \
                @angular/platform-browser@^$VERSION.0.0 \
                @angular/platform-browser-dynamic@^$VERSION.0.0 \
                @angular/platform-server@^$VERSION.0.0 \
                @angular/router@^$VERSION.0.0 \
                @angular/ssr@^$VERSION.0.0 \
                @angular/animations@^$VERSION.0.0 \
                @angular/localize@^$VERSION.0.0
}

# Update build tools
echo ""
echo "⬆️  Updating build tools..."
npm install --save-dev @angular-devkit/build-angular@^$VERSION.0.0 \
                       @angular/compiler-cli@^$VERSION.0.0

# Update dependencies
echo ""
echo "⬆️  Updating dependencies..."
npm install typescript@~5.6.0 --save-dev
npm install zone.js@~0.15.0
npm install rxjs@~7.8.1

# Update @ng-bootstrap (if upgrading to 18+)
if [ "$VERSION" -ge 18 ]; then
    echo ""
    echo "⬆️  Updating @ng-bootstrap to v$VERSION..."
    npm install @ng-bootstrap/ng-bootstrap@$VERSION || {
        echo "⚠️  @ng-bootstrap update failed. Check compatibility."
    }
fi

# Install all dependencies
echo ""
echo "📥 Installing all dependencies..."
npm install

# Run control flow migration (Angular 17+)
if [ "$VERSION" -ge 17 ]; then
    echo ""
    echo "🔄 Running control flow migration..."
    ng generate @angular/core:control-flow --skip-confirmation || {
        echo "⚠️  Control flow migration failed or not needed."
    }
fi

# Build test
echo ""
echo "🔨 Testing build..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please check errors above."
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Upgrade to Angular $VERSION completed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff"
echo "2. Test the application: npm start"
echo "3. Run tests: npm test"
echo "4. Check for breaking changes in:"
echo "   - https://angular.dev/reference/upgrade"
echo "   - https://ng-bootstrap.github.io/#/migration"
echo ""
echo "If everything works, commit the changes:"
echo "  git add ."
echo "  git commit -m 'Upgrade to Angular $VERSION'"
echo ""
