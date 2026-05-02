# Repository conventions for Claude Code

## Branches

- **Production deploy branch: `claude/build-roofsolar-app-2sFmG`** — Netlify
  auto-deploys from this branch. Whatever lives at its tip is what users see.
- Active feature branch (this branch): `claude/enable-google-login-rr2DS` —
  all current work is committed here. Nothing reaches production until it is
  pushed onto the deploy branch above.
- There is **no `main` branch** on the remote. Do not assume one exists.

### To ship work to production

The deploy branch is currently a strict ancestor of the feature branch, so a
fast-forward is sufficient — no force-push needed. Always confirm with the
user before pushing to the production branch.

```sh
git push origin claude/enable-google-login-rr2DS:claude/build-roofsolar-app-2sFmG
```

If history has diverged later, fall back to opening a PR or a deliberate
force-push only after explicit user authorization.

## Versioning

`lib/version.ts` exports `APP_VERSION`. Bump it whenever shipping a visible
change so the floating Force-update widget (bottom-right of the **landing
page only**) reflects the live build. Users use it as a cache-bust + visual
confirmation.
