# Branch Strategy

## Branch Flow

```
  feature/depreciation-engine  ──┐
  feature/asset-assignment     ──┤
  fix/salvage-value-calc       ──┼──→  develop  ──→  staging  ──→  main
  docs/update-readme           ──┘     (integration)  (testing)   (production)
```

All development happens in short-lived feature branches. These merge into `develop` via PR. When `develop` is stable, it merges into `staging` for testing. When `staging` is verified, it merges into `main` for production.

## Branch Rules

| Branch      | Base Branch | Merges Into | Who Creates   | PR Required | Direct Push |
|-------------|-------------|-------------|---------------|-------------|-------------|
| `main`      | —           | —           | Repo owner    | ✅ Yes       | ❌ Blocked   |
| `staging`   | `main`      | `main`      | Tech lead     | ✅ Yes       | ❌ Blocked   |
| `develop`   | `main`      | `staging`   | Tech lead     | ✅ Yes       | ❌ Blocked   |
| `feature/*` | `develop`   | `develop`   | Any developer | ✅ Yes       | ✅ Own branch |
| `fix/*`     | `develop`   | `develop`   | Any developer | ✅ Yes       | ✅ Own branch |
| `docs/*`    | `develop`   | `develop`   | Any developer | ✅ Yes       | ✅ Own branch |

## Rules

1. **Never commit directly to `main` or `staging`.** All changes go through a Pull Request.
2. **Always branch from `develop`** for features, fixes, and docs.
3. **Keep branches short-lived.** Aim to merge within 1–3 days. Long-lived branches cause painful merge conflicts.
4. **Delete branches after merging.** Keep the repo clean.
5. **Rebase, don't merge.** Use `git rebase origin/develop` to keep your branch up to date.
6. **Staging is synced weekly.** The tech lead merges `develop → staging` at the end of each week for testing.
7. **Main is updated after staging is verified.** The tech lead merges `staging → main` after QA passes.

## Creating a Feature Branch

```bash
# 1. Make sure you're on the latest develop
git checkout develop
git pull origin develop

# 2. Create and switch to your feature branch
git checkout -b feature/my-feature

# 3. Work on your feature...

# 4. Periodically rebase to stay current
git fetch origin develop
git rebase origin/develop

# 5. Push when ready
git push origin feature/my-feature

# 6. Open a PR targeting develop
```

## Hotfix Procedure

For critical production bugs that can't wait for the normal flow:

```
main  ←──  fix/critical-bug  (PR directly into main)
  │
  └──→  develop  (back-merge the fix so develop has it too)
```

1. Branch from `main`: `git checkout -b fix/critical-bug main`
2. Fix the bug
3. Open a PR targeting `main` (not develop)
4. After merging into `main`, immediately back-merge into `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git merge origin/main
   git push origin develop
   ```

## Branch Protection Settings

These settings must be configured in **GitHub → Settings → Branches → Branch protection rules**:

### `main` branch
- ✅ Require a pull request before merging
- ✅ Require at least 1 approval
- ✅ Require review from Code Owners
- ✅ Require status checks to pass (CI)
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
- ❌ Allow force pushes → Disabled
- ❌ Allow deletions → Disabled

### `staging` branch
- ✅ Require a pull request before merging
- ✅ Require at least 1 approval
- ✅ Require status checks to pass (CI)
- ❌ Allow force pushes → Disabled

### `develop` branch
- ✅ Require a pull request before merging
- ❌ Allow force pushes → Disabled
