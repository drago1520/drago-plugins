---
name: github-issue
description: Create a GitHub issue with a business-problem title, the open to-dos on top, and a three-part body (business problem, technical problem, what we did). Load BEFORE running `gh issue create`, and whenever the user asks to "make an issue", "open a ticket", "write this up as an issue", or to log a problem we just fixed or partly fixed.
---

# GitHub issue

I file the issue in the repo the user names. When they name none, I use the issues repo that the project's CLAUDE.md or my memory points to, and otherwise the current repo.

## Title

The title is a conventional commit header, `<type>(<scope>): <subject>`, whose subject states the business problem as the business, a customer or a colleague feels it. I describe the symptom a non-developer would recognise and leave the technical cause for the body.

I use the type and scope the user names. When they name none, I pick the type from the kind of work (`fix` for something broken, `feat` for something new, `chore` for upkeep, `perf` for slowness, `docs` for documentation) and the scope from the area it touches, such as `email`, `checkout`, `admin`, `search` or `db`.

```
fix(email): customer replies from the support mailbox bounce at Gmail
fix(checkout): PayPal orders stay unpaid after the customer pays
feat(admin): warehouse staff print shipping labels for many orders at once
perf(search): category pages take 8 seconds to load on mobile
```

## Body

The body starts with the open to-do items as a task list, so the next action is the first thing anyone reads. A to-do names a concrete action and its owner when that owner is someone other than me. When I can't do a step myself, for example grant access I don't hold, I write the to-do as the action the user takes.

After the to-dos come three sections, each a few sentences or bullets:

1. **Business problem**: what went wrong for the business or its customers, with the date, the count, and the people or systems involved.
2. **Technical problem**: the root cause in one or two sentences, with record names, hosts or files in backticks.
3. **What we did**: each change as a bullet, saying whether I confirmed it live and when, then what is still pending and who it waits on.

I keep it short and refer to customers by count, without their email addresses, credentials or secrets.

```markdown
- [ ] <next action>

## Business problem
<who was affected, when, how many>

## Technical problem
<root cause>

## What we did
- <change> (live, checked <YYYY-MM-DD>)
- <pending step and who it waits on>
```

## Labels

I add the labels the user names. Before creating the issue I confirm they exist:

```bash
gh label list -R <owner>/<repo> --limit 200 | grep -iE "<label1>|<label2>"
```

If a label is missing I ask the user before creating it.

## Creating it

I write the body to a file in my scratchpad and pass it with `--body-file`, which keeps backticks and newlines intact:

```bash
gh issue create -R <owner>/<repo> \
  --title "<type>(<scope>): <business problem>" \
  --body-file <scratchpad>/issue.md \
  --label <label1> --label <label2>
```

I give the user the issue URL and a two-line summary of what the issue says, and I mention any wording I changed from what they dictated.
