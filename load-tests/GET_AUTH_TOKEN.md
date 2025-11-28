# How to Get Auth Token for Load Testing

## Quick Steps

1. **Open ClipForge in browser:**
   ```bash
   open http://localhost:3001
   ```

2. **Login** with your account

3. **Open DevTools:**
   - Mac: `Cmd + Option + I`
   - Windows/Linux: `F12` or `Ctrl + Shift + I`

4. **Go to Application tab** (or Storage in Firefox)

5. **Click on Cookies** → `http://localhost:3001`

6. **Find `__session` cookie** and copy its value

7. **Export the token:**
   ```bash
   export AUTH_TOKEN="paste-your-token-here"
   ```

8. **Verify it works:**
   ```bash
   curl -H "Authorization: Bearer $AUTH_TOKEN" http://localhost:3000/v1/credits/balance
   ```

9. **Run load tests:**
   ```bash
   cd load-tests
   ./run-all-tests.sh
   ```

## Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│ DevTools → Application → Cookies → http://localhost:3001   │
├─────────────────────────────────────────────────────────────┤
│ Name          │ Value                                       │
├───────────────┼─────────────────────────────────────────────┤
│ __session     │ eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...    │ ← Copy this
│ __client_uat  │ 1732847234                                  │
└─────────────────────────────────────────────────────────────┘
```

## Alternative: Use Clerk Dashboard Token

If you have admin access to Clerk:

1. Go to Clerk Dashboard
2. Navigate to Users
3. Find your test user
4. Click "Generate JWT"
5. Copy the token
6. Export it as above

## Troubleshooting

### Token Not Working?

```bash
# Check if token is valid
curl -v -H "Authorization: Bearer $AUTH_TOKEN" http://localhost:3000/v1/credits/balance

# Look for:
# - 200 OK = Token works ✅
# - 401 Unauthorized = Token expired or invalid ❌
# - 429 Too Many Requests = Rate limit (expected during load test) ⚠️
```

### Token Expired?

Clerk tokens expire after a period. If you get 401 errors:
1. Refresh the page in browser
2. Get a new token from DevTools
3. Export the new token

### Still Not Working?

Check if you're logged in:
```bash
# Should show your user info
curl -H "Authorization: Bearer $AUTH_TOKEN" http://localhost:3000/v1/auth/me
```

## Security Note

⚠️ **Never commit auth tokens to git!**
- Tokens are sensitive credentials
- They provide full access to your account
- Always use environment variables
- Rotate tokens regularly

## For CI/CD

For automated testing in CI/CD:

```yaml
# .github/workflows/load-test.yml
env:
  AUTH_TOKEN: ${{ secrets.LOAD_TEST_AUTH_TOKEN }}

steps:
  - name: Run load tests
    run: |
      cd load-tests
      ./run-all-tests.sh
```

Store the token in GitHub Secrets, not in code!
