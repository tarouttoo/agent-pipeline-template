# CONTEXT

The agent's map of this repository: what it is, the vocabulary used in
prompts and code, and where deeper material lives. Read the relevant section
before resolving anything substantive; add terms here when you introduce a
new concept.

## What this repo is

A template repository: a label-driven agent pipeline that runs coding agents
(pi CLI) on GitHub Actions. Issues and PRs are worked on by adding trigger
labels (`agent:implement`, `agent:review`, `agent:update-branch`,
`agent:explore`); workflow code lives under `.sandcastle/agent-workflows/`.

## Glossary

- **Trigger label** — a label (`agent:*`) whose addition starts a workflow.
  Removed by the workflow itself when the run begins.
- **Lifecycle label** — a label the pipeline manages on its own:
  `agent:in-progress` while a run is active, `agent:blocked` when a run
  fails (with a failure comment naming the trigger label to re-add).
- **Subject** — the issue or PR a run is about. Concurrency groups are
  keyed per subject so parallel label events queue instead of racing.
- **Draft PR** — the pull request the implement workflow opens against
  `main`, body starting with `Closes #N` for the triggering issue.
- **Batch triage** — the explore workflow: one run collects every open
  `agent:explore` issue, the agent plans per-issue effects, and a separate
  apply job validates and applies the plan (issue bodies are untrusted
  input and never enter the shell).
- **Extraction** — the second, structured-output pass a run may take
  (`extraction.md`) to turn free-form agent output into typed JSON.
- **PAT cascade** — label events fired by `GITHUB_TOKEN` never start other
  workflows; `AGENT_PAT` is used where a workflow must trigger another one
  (e.g. implement requesting review).

## Where things live

- `docs/adr/` — architecture decision records. Add one when making a
  non-obvious, hard-to-reverse choice; read the relevant ones before
  changing pipeline behaviour.
- `.sandcastle/CODING_STANDARDS.md` — coding standards the workflow agents
  apply to the host repo; they describe how code in an adopting repo
  should look.
- `README.md` — adopter setup (secrets, labels) and deviations from the
  upstream pipeline this was ported from.
