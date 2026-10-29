# agent-pipeline-template

A reusable template repository for a **label-driven agent pipeline**: you
triage issues and PRs by adding `agent:*` labels, and coding agents run on
GitHub Actions — implementing issues into draft PRs, reviewing PRs,
resolving merge conflicts, and batch-triaging backlogs.

The pipeline is a verbatim port of [mattpocock/sandcastle](https://github.com/mattpocock/sandcastle)
(commit `a53e227250fb51df0ad54155b85fecc1c090c937`, 2026-10-19), with one
deliberate adaptation: **the coding agent is the [pi CLI](https://github.com/earendil-works/pi-coding-agent),
not Claude Code**. See [Deviations from upstream](#deviations-from-upstream).

## Workflows

| Label | Workflow | What happens |
|---|---|---|
| `agent:implement` (issue) | `agent-implement.yml` | Preflight gates (refuses sub-issues / PRD-shaped issues / issues with an open collaborator PR), then an agent implements on an isolated branch and opens a draft PR that closes the issue, then labels the PR `agent:review`. |
| `agent:implement` (PR) | `agent-implement-pr.yml` | Processes review feedback on an existing PR: replies to threads, addresses inline comments, pushes with a lease. |
| `agent:review` | `agent-review.yml` | Reviews the PR, self-fixes findings on the branch, posts a PR review, replies to threads, marks the PR ready. |
| `agent:update-branch` | `agent-update-branch.yml` | Resolves merge conflicts with `main` (always resolve, never abort) and pushes. |
| `agent:explore` | `agent-explore.yml` | Batch triage: one agent run plans effects for every open `agent:explore` issue; a separate apply job validates the plan and applies it. Supports `workflow_dispatch` dry-run. |

Every run posts a failure comment with a reason and the workflow-run link,
and relabels the subject `agent:blocked`. Retrying means re-adding the
trigger label named in that comment.

## Adopting this template

1. **Create your repo from this template** (or clone it). The pipeline
   files live in `.github/workflows/` and `.sandcastle/agent-workflows/`.
2. **Create the labels** the workflows expect — the full reference
   (trigger vs lifecycle labels, what each one does, and the setup command)
   lives in [`docs/labels.md`](docs/labels.md).

3. **Set the secrets** (repo → Settings → Secrets and variables → Actions):
   - `ZAI_API_KEY` — API key for the pi provider (required by every agent run).
   - `AGENT_PAT` — a personal access token with `contents`, `issues` and
     `pull-requests` write (classic: `repo` scope; workflow-touching changes
     also need the `workflow` scope). Required in practice: label events
     fired by `GITHUB_TOKEN` never start other workflows, so without
     `AGENT_PAT` the automatic `implement → review` cascade silently degrades
     (the review label is added but never fires). The implement checkout also
     prefers `AGENT_PAT` for pushing.
4. **Tune the provider/model** if needed: each workflow sets
   `AGENT_PROVIDER: zai` and `AGENT_MODEL: glm-5.3-flash` in its env. Edit
   the env vars; nothing in code needs to change.
5. **First run**: label a standalone issue `agent:implement` and watch the
   Actions tab. A failure comments on the issue with the reason and labels
   it `agent:blocked`; re-add the trigger label to retry.

Sanity checks after cloning:

```sh
npm install
npm run typecheck
npm test
```

## Attribution

Pipeline files ported from [mattpocock/sandcastle](https://github.com/mattpocock/sandcastle)
@ `a53e227250fb51df0ad54155b85fecc1c090c937` — © Matt Pocock, MIT.
Template scaffolding — © tarouttoo, MIT. See `LICENSE`.

## Deviations from upstream

Verbatim is the goal; every deviation is listed here.

1. **Runner swap** (the one deliberate adaptation):
   - `claudeAgent()` in `.sandcastle/agent-workflows/shared/common.ts` is
     replaced by `agentFromEnv()`, which runs pi over the provider/model
     named by the `AGENT_PROVIDER`/`AGENT_MODEL` env vars, authenticated
     with `ZAI_API_KEY` (upstream: `sandcastle.claudeCode` with a pinned
     model and `CLAUDE_CODE_OAUTH_TOKEN`).
   - Workflows install pi CLI (`npm install -g --ignore-scripts @earendil-works/pi-coding-agent`)
     instead of Claude Code, and pass `ZAI_API_KEY` instead of
     `CLAUDE_CODE_OAUTH_TOKEN`.
   - `node-version` 22 → 24.
2. **`npm run build` step removed in all five workflows** — upstream builds
   the sandcastle package before running workflow code; this template has
   nothing to build (`@ai-hero/sandcastle` is consumed as an npm
   dependency).
3. **Scaffolding is fresh, not upstream's** — upstream's `package.json` /
   `tsconfig.json` cover the sandcastle package itself and never type-check
   its `.sandcastle/` workflow starters; this template does, so it adds a
   `@standard-schema/spec` devDependency (a type-only import used by the
   ported code) and a `tsconfig.json` including `.sandcastle/**/*.ts`.

Prompt and workflow code text is otherwise unchanged from upstream.
