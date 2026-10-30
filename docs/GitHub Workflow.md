# Gebeta Online: GitHub Workflow

How we use Git and GitHub on this project. Repository: `https://github.com/dinksira/Gebeta`

Related files: `CODING_STANDARDS.md`, `README.md`, `PHASE_PLAN.md`.

## 1. The two rules

1. **One commit per changed file.** If 20 files changed, there are 20 commits.
2. **Every commit message is a clean, plain sentence.** No prefixes like `feat(app):`, `fix:`, or `chore:`. No scopes in brackets. Just say what changed.

Everything else in this document exists to make those two rules easy to follow and hard to break.

Old commits that already use prefixes stay as they are. Rewriting pushed history is risky, so the new rules apply from now on.

## 2. Rule 1: one file, one commit

### 2.1 What counts as one change

| Situation | What to do |
| :--- | :--- |
| You edited a file | One commit for that file |
| You added a new file | One commit for that file |
| You deleted a file | One commit for the deletion |
| You renamed or moved a file | One commit for the rename (Git sees it as a single change) |
| You edited the same file for two unrelated reasons | Split it into two commits with `git add -p` |
| You edited the same file several times for one purpose | One commit with its final state |
| You added a package | Commit `package.json`, then commit the lockfile as its own commit right after |
| A tool generated a file | One commit per generated file, same as any other |
| Binary files (images, sounds, fonts) | One commit per file |

### 2.2 Order matters

Because each file is committed alone, a commit in the middle of a batch may not build on its own. For example, a screen that imports a new hook will fail until the hook file is committed. Keep history sensible with this order:

1. Types and shared definitions
2. Engine and logic files
3. Services and hooks
4. Components
5. Screens
6. Tests
7. Documents and config

Dependencies first, the things that use them later. The branch only needs to build and pass tests at its **tip**, not at every commit in between. CI checks the tip.

### 2.3 Trade offs to know about

1. Tests and builds can fail on a commit in the middle of a batch. That is fine. Do not run the full test suite in the commit hook (see section 6).
2. `git bisect` is less precise, because a middle commit may be broken for reasons that have nothing to do with the bug. Bisect on branch tips or merged work when you need it.
3. History gets long. That is the point. Use `git log --oneline` and `git log -- path/to/file` to find things.

## 3. Rule 2: clean commit messages

### 3.1 Format

1. A plain English sentence that starts with a capital letter.
2. Starts with a verb: Add, Fix, Remove, Rename, Move, Improve, Update, Document, Stop, Show, Handle, and so on.
3. First line is 72 characters or fewer, with no full stop at the end.
4. Say what the change does, in words you would use to explain it to a friend.
5. No type prefix, no scope, no emoji, no ticket tag at the start.
6. English only.
7. Be specific. "Update" alone says nothing.

### 3.2 Optional body

If the reason is not obvious, leave a blank line after the first line and explain **why** in a few sentences. Most commits do not need a body.

```
Stop opponent store from receiving seeds

Seeds were landing in the opponent store on long laps. The sowing
loop now skips that slot on every lap.
```

### 3.3 Good and bad

| Bad | Why | Good |
| :--- | :--- | :--- |
| `feat(app): add board` | Has a prefix and scope | Add the game board screen |
| `fix: bug` | Prefix, and says nothing | Fix capture when the opposite pit is empty |
| `Update` | Too vague | Update seed colors to match the design system |
| `changes` | Says nothing | Add Amharic text for the home screen |
| `WIP` | Not a message | Add first version of the waiting room screen |
| `Add board and fix timer and update readme` | Three changes in one message | Three commits, one per file |
| `final final fix` | Panic, not information | Fix timer bar going past zero |
| `chore: bump deps` | Prefix | Update Expo to the latest patch version |

### 3.4 Message patterns by situation

| Situation | Pattern | Example |
| :--- | :--- | :--- |
| New file | Add ... | Add types for game state and rules |
| Bug fix | Fix ... | Fix extra turn not granted on a store landing |
| Behavior change | Change ... or Stop ... | Stop pits from accepting taps during animation |
| Improvement | Improve ... | Improve AI move ordering so pruning cuts more |
| Remove code or file | Remove ... | Remove unused seed color constants |
| Rename | Rename X to Y | Rename useGame hook to useBoardGame |
| Move | Move X into Y | Move socket events into the engine package |
| Tests | Add tests for ... | Add tests for capture on the opponent side |
| Docs | Document ... | Document how to run the server on a phone |
| Config | Set up ... or Turn on ... | Turn on strict mode in the engine config |
| Dependency | Add X to Y | Add Socket.IO to the server |
| Lockfile | Update lockfile after ... | Update lockfile after adding Socket.IO |
| Asset | Add ... | Add seed drop sound |
| Translation | Add ... text for ... | Add Amharic text for the settings screen |
| Undo | Undo ... | Undo the animation speed change |

## 4. Daily workflow

### 4.1 Start work

```bash
git switch main
git pull
git switch -c captureRules
```

Branch names are short, plain, and describe the work: `captureRules`, `boardAnimation`, `reconnectBug`. One branch per piece of work. No type prefixes here either.

### 4.2 Do the work

Work normally. Run tests as you go. Do not worry about commits until you reach a good stopping point.

### 4.3 Commit every file separately

Use the helper script (section 5). It walks through each changed file, shows what changed, and asks for one message per file.

```bash
pnpm commit:each
```

By hand, the same thing looks like this:

```bash
git status
git add engine/src/types.ts
git commit -m "Add types for game state and rules"
git add engine/src/rules.ts
git commit -m "Add default rules for the Kalah style game"
```

Never use `git add .` or `git add -A` followed by a single commit. That breaks rule 1.

### 4.4 Push often

```bash
git push -u origin captureRules
```

Push at the end of every work session at minimum. A commit that only lives on your laptop is not a backup.

### 4.5 Finish

1. Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` on the branch.
2. Open a pull request into `main` on GitHub.
3. Wait for CI to pass.
4. Merge with **Rebase and merge** (section 7).
5. Delete the branch.
6. `git switch main` and `git pull`.

## 5. Helper script

Save as `scripts/commitEach.sh`. It commits every changed file on its own, checks each message against the rules, and lets you skip a file by pressing Enter (run it again later for skipped files).

On Windows, run it in Git Bash.

```bash
#!/usr/bin/env bash
# scripts/commitEach.sh
# Commits every changed file on its own, with one clean message per file.
# Press Enter on an empty message to skip a file and come back to it later.

set -u

PREFIX_PATTERN='^[A-Za-z]+(\(.*\))?!?:[[:space:]]'

if ! git diff --cached --quiet; then
  echo "Something is already staged. Run git reset first, then try again."
  exit 1
fi

mapfile -t lines < <(git status --porcelain -uall)
total=${#lines[@]}

if [ "$total" -eq 0 ]; then
  echo "Nothing to commit."
  exit 0
fi

count=0

for line in "${lines[@]}"; do
  count=$((count + 1))
  entry="${line:3}"

  if [[ "$entry" == *" -> "* ]]; then
    oldPath="${entry%% -> *}"
    newPath="${entry##* -> }"
    paths=("$oldPath" "$newPath")
  else
    paths=("$entry")
  fi

  git add -A -- "${paths[@]}"

  echo ""
  echo "[$count of $total] ${paths[*]}"
  git diff --cached --stat

  while true; do
    read -r -p "Commit message (Enter to skip): " message < /dev/tty

    if [ -z "$message" ]; then
      git reset -q -- "${paths[@]}"
      echo "Skipped."
      break
    fi

    if [[ "$message" =~ $PREFIX_PATTERN ]]; then
      echo "No prefixes like feat: or fix(app):. Write a plain sentence."
      continue
    fi

    if [[ ! "$message" =~ ^[A-Z] ]]; then
      echo "Start with a capital letter and a verb, for example Add or Fix."
      continue
    fi

    if [ "${#message}" -gt 72 ]; then
      echo "Keep it under 72 characters. You wrote ${#message}."
      continue
    fi

    if git commit -q -m "$message"; then
      echo "Committed."
    else
      git reset -q -- "${paths[@]}"
      echo "Commit failed, so the file was left unstaged."
    fi
    break
  done
done

echo ""
echo "Done."
```

Add it to the root `package.json`:

```json
{
  "scripts": {
    "commit:each": "bash scripts/commitEach.sh"
  }
}
```

Notes:

1. Avoid spaces in file and folder names. The script reads Git's short status output, which quotes names with spaces.
2. Files are listed in alphabetical order, not dependency order. If a file depends on another, skip it by pressing Enter, commit the other one, then run the script again.

## 6. Hooks that enforce the rules

Hooks catch mistakes before they reach GitHub. They use Husky, which is already part of the tooling in `CODING_STANDARDS.md`.

### 6.1 `commit-msg` hook

Create `.husky/commit-msg`:

```sh
message=$(head -n 1 "$1")

if echo "$message" | grep -Eq '^[A-Za-z]+(\(.*\))?!?:[[:space:]]'; then
  echo "Commit message must be a plain sentence. No prefixes like feat: or fix(app):."
  exit 1
fi

if ! echo "$message" | grep -Eq '^[A-Z]'; then
  echo "Start the message with a capital letter and a verb, for example Add or Fix."
  exit 1
fi

if [ ${#message} -gt 72 ]; then
  echo "First line is too long. Keep it to 72 characters or fewer."
  exit 1
fi
```

### 6.2 `pre-commit` hook

Create `.husky/pre-commit`:

```sh
npx lint-staged

count=$(git diff --cached --name-only --find-renames | wc -l | tr -d ' ')

if [ "$count" -gt 1 ] && [ -z "$ALLOW_MULTI" ]; then
  echo "One file per commit, but $count files are staged."
  echo "Unstage extras with: git restore --staged <file>"
  exit 1
fi
```

What this does:

1. `lint-staged` formats and lints the one staged file, which is fast.
2. The count check blocks any commit with more than one file.
3. `ALLOW_MULTI=1` is an escape hatch for the rare exception in section 10. Merge commits do not run `pre-commit`, so merges are never blocked.
4. The full test suite does **not** run here, because middle commits in a batch may not pass yet. Tests run in CI and before you open a pull request.

## 7. Branches, pull requests, and merging

### 7.1 Branch rules

1. `main` always builds and passes tests.
2. All work happens on a branch, even though you work alone.
3. One branch per piece of work. Delete it after merging.
4. Keep branches short lived, a few days at most.

### 7.2 Pull requests

1. Open one for every branch. It is where CI runs, and it gives you a place to review your own work.
2. Title: a plain sentence in the same style as a commit message (for example "Add capture rules to the engine").
3. Description: what changed, how you tested it, and anything the next phase needs. Use the checklist in section 11.
4. Link the related issue or phase milestone if there is one.

### 7.3 Merge method (important)

Squash merging would collapse your 20 commits into 1 and destroy rule 1. So:

1. In the repo, go to **Settings, then General, then Pull Requests**.
2. Turn **off** "Allow squash merging".
3. Keep "Allow rebase merging" on and use it by default. It keeps every individual commit and gives a straight, linear history.
4. "Allow merge commits" can stay on as a backup.

## 8. Protecting `main`

In **Settings, then Branches**, add a rule for `main`:

1. Require a pull request before merging.
2. Require status checks to pass (the CI job that runs lint, type check, and tests).
3. Block force pushes.
4. Block deleting the branch.
5. Require a linear history.

Since you are the only developer, do not require outside approvals, or you will lock yourself out.

## 9. Tags, releases, and notes

1. Tag every release build that goes to Play Store testing or production: `v0.1.0`, `v0.2.0`, `v1.0.0`.
2. Create a GitHub Release for each tag with a short plain description written in sentences, for example "Adds friend rooms and reconnect handling".
3. Version numbers: the first number is for big changes, the second for new features, the third for fixes.
4. Do not commit build output. Builds come from CI or EAS.

## 10. Optional exception for bulk mechanical changes

Some changes touch many files in exactly the same way: moving a whole folder, running Prettier on the whole project for the first time, or renaming an import path everywhere. Committing 200 identical files one by one adds noise and no value.

If you want zero exceptions, delete this section and follow rule 1 always.

If you want one exception, keep it narrow:

1. Only for purely mechanical changes with no logic edits.
2. Do it in its own commit with nothing else mixed in.
3. Say so plainly in the message, for example "Format every file with Prettier" or "Move the app screens into a new folder".
4. Commit with `ALLOW_MULTI=1 git commit -m "..."`.

## 11. Pull request checklist

* [ ] Every changed file has its own commit
* [ ] Every commit message is a clean sentence with no prefix
* [ ] `pnpm test`, `pnpm lint`, and `pnpm typecheck` pass
* [ ] No `.env` files, keys, or secrets in the changes
* [ ] No leftover `console.log` or commented out code
* [ ] Documents updated if behavior or decisions changed
* [ ] Tested on a real phone if the change touches the app

## 12. What never goes into Git

### 12.1 `.gitignore`

```
node_modules/
.expo/
dist/
build/
coverage/
.env
.env.*
!.env.example
*.keystore
*.jks
.DS_Store
```

### 12.2 `.gitattributes`

```
* text=auto
```

This stops Windows and Mac line endings from creating fake changes.

### 12.3 Rules

1. **Never commit secrets:** `.env` files, tokens, database passwords, signing keys, or the Play Store upload keystore. Keep a backup of the keystore somewhere safe outside the repo.
2. **Commit `.env.example`** with fake values so others know what to set.
3. **Keep large files out.** Sounds and images should stay small. If assets grow, use Git LFS.
4. **No build output or dependencies.**

### 12.4 If a secret gets committed by mistake

1. **Rotate it first.** Change the password, token, or key right away. Assume it is exposed.
2. Remove it from the whole history with a history cleaning tool such as `git filter-repo`.
3. Force push the cleaned history. This is the one time rewriting `main` is acceptable.
4. Check the GitHub repository for any copies in pull requests or releases.

Deleting the file in a new commit is not enough. The secret stays in old commits.

## 13. Fixing mistakes

| Mistake | Fix |
| :--- | :--- |
| Wrong message on the last commit, not pushed | `git commit --amend -m "Better message"` |
| Wrong message on an older commit, not pushed | `git rebase -i HEAD~5` and choose reword |
| Staged the wrong file | `git restore --staged path/to/file` |
| Committed two files together by accident, not pushed | `git reset --soft HEAD~1`, then commit each file again |
| Want to throw away changes to a file | `git restore path/to/file` (this cannot be undone) |
| A pushed commit was wrong | `git revert <commit id>`, then rewrite the message as a plain sentence such as "Undo the animation speed change" |
| Pushed to the wrong branch | Create a new branch from it, then fix the original branch before anything merges |

Never force push `main`. On your own feature branch, force pushing after an amend or rebase is fine, as long as nobody else uses that branch. Use `git push --force-with-lease`.

## 14. One time setup checklist

* [ ] Set your name and email: `git config user.name "..."` and `git config user.email "..."`
* [ ] Connect the repo: `git remote add origin https://github.com/dinksira/Gebeta.git`
* [ ] Add `.gitignore` and `.gitattributes`
* [ ] Add `scripts/commitEach.sh` and the `commit:each` script
* [ ] Install Husky and lint staged, then add both hooks
* [ ] Turn off squash merging in the repo settings
* [ ] Add the branch protection rule for `main`
* [ ] Set up the CI job (lint, type check, tests) so the required check exists
* [ ] Add this file to the documentation table in `README.md`

## 15. Quick reference

```bash
git switch main && git pull           # start fresh
git switch -c boardAnimation          # new branch
pnpm commit:each                      # one commit per file, clean messages
git push -u origin boardAnimation     # back it up
# open a pull request, wait for CI, then Rebase and merge
git switch main && git pull           # sync and clean up
```

The two rules again:

1. One changed file, one commit.
2. One plain sentence per message, no prefixes.