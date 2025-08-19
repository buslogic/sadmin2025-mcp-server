# NPM Publishing Setup

## Prerequisites

1. **NPM Account**
   - Create account at https://www.npmjs.com/signup
   - Verify email address
   - Enable 2FA (recommended)

2. **Generate NPM Token**
   - Go to https://www.npmjs.com/settings/[username]/tokens
   - Click "Generate New Token"
   - Select "Automation" type
   - Copy the token (starts with `npm_`)

3. **Add Token to GitHub Secrets**
   - Go to https://github.com/buslogic/sadmin2025-mcp-server/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token

## Manual Publishing

```bash
# Login to NPM
npm login

# Verify you're logged in
npm whoami

# Test publish (dry run)
npm publish --dry-run

# Publish to NPM
npm publish --access public
```

## Automated Publishing

The package is automatically published when:
1. A new GitHub release is created
2. Manual workflow dispatch from Actions tab

### Create a Release
1. Go to https://github.com/buslogic/sadmin2025-mcp-server/releases
2. Click "Draft a new release"
3. Choose a tag (e.g., `v0.1.0`)
4. Set release title
5. Describe changes
6. Click "Publish release"

The GitHub Action will automatically:
- Run tests
- Build the package
- Publish to NPM

## Version Management

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major

# Commit and push
git push && git push --tags
```

## Troubleshooting

### Permission Denied
```bash
npm publish --access public
```

### Package Name Already Exists
Change package name in `package.json`:
```json
{
  "name": "@buslogic/sadmin2025-mcp-server"
}
```

### Build Errors
```bash
npm run clean
npm run build
npm test
```

## Useful Commands

```bash
# View package info
npm info @buslogic/sadmin2025-mcp

# View published versions
npm view @buslogic/sadmin2025-mcp versions

# Unpublish version (within 72 hours)
npm unpublish @buslogic/sadmin2025-mcp@0.1.0
```