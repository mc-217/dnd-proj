# Test Directory Notes

This directory holds end-to-end test configuration and API behavior checks for the backend.
Use these tests to verify that app bootstrapping and public routes still respond correctly.

## Files

- `app.e2e-spec.ts`: validates `GET /api` and `GET /api/health` responses.
- `jest-e2e.json`: Jest config used by the `test:e2e` script.

## Run tests

```bash
pnpm --dir backend test:e2e
```
