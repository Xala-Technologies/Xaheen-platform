# CLI Wiki Integration Guide

## Purpose
This guide explains how to publish and maintain your UI System documentation as a GitHub Wiki using CLI tools and automation.

---

## Prerequisites
- Node.js and pnpm installed
- GitHub repository with Wiki enabled
- All documentation in `/docs/` or `/wiki/`
- [wiki-publisher](https://github.com/your-org/wiki-publisher) or similar CLI tool

---

## Publishing Workflow
1. **Edit Documentation:**
   - Keep Markdown docs up to date in `/docs/` or `/wiki/`.
2. **Sync to Wiki:**
   - Use the CLI:
     ```sh
     npx wiki-publisher --src ./docs --repo <repo-url> --token <GH_TOKEN>
     ```
   - Or add a script to `package.json`:
     ```json
     "scripts": {
       "publish:wiki": "wiki-publisher --src ./docs --repo <repo-url> --token $GH_TOKEN"
     }
     ```
3. **Automate in CI:**
   - Add a GitHub Action workflow (see `/wiki-publisher/.github/workflows/publish-wiki.yml`):
     ```yaml
     name: Publish Wiki
     on:
       push:
         paths:
           - 'docs/**'
     jobs:
       publish:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           - run: pnpm install
           - run: pnpm publish:wiki
         env:
           GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
     ```

---

## Best Practices
- Keep `/docs/` and Wiki in sync
- Use cross-links for navigation
- Enforce doc coverage via CI
- Use emoji sections and templates for clarity
- Apply SOLID and accessibility rules in all docs

---

## Further Reading
- [wiki-publisher project](https://github.com/your-org/wiki-publisher)
- [GitHub Wiki Docs](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- [CI/CD for Docs](./implementation/README.md)
