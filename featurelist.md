# Research summary & recommended feature list for a “better comment” VS Code extension

I researched existing VS Code comment/tag extensions and the VS Code extension APIs to identify common features, gaps, and feasible implementation paths. Notable existing extensions (for benchmarking and inspiration) include *Better Comments*, *TODO Highlight* and *Todo Tree*; VS Code supports rich editor decorations and tree views that these extensions leverage. ([Visual Studio Marketplace][1]) ([Visual Studio Code][2])

Below is an organized, implementable feature list (grouped and prioritized), plus implementation hints and example configuration snippets you can reuse in your extension spec.

---

# 1 — Goals / positioning

* Provide **semantic comment tagging** (TODO, FIXME, NOTE, URGENT, etc.) with visually distinct styles (color, weight, font-style, strikethrough, background, gutter/overview markers).
* Give teams fast navigation, counts and an overview panel of comment tasks across the workspace.
* Be **high-performance**, configurable per-user and per-workspace, and respectful of large repositories.

---

# 2 — Feature categories (with specific items)

## Core (MVP)

1. **Tag highlighting in-editor**

   * Detect and highlight comment tags inside language comment blocks only (optionally allow outside-comment matching).
   * Styling: foreground color, background tint, font-weight, italic, underline, strikethrough, and optional “faded” style for commented-out code.
2. **Default tag set**

   * `TODO`, `FIXME`, `BUG`, `UPDATE`, `NOTE`, `HACK`, `OPTIMIZE`, `URGENT`, `REVIEW`, `DEPRECATED`,`DONE`,`COMPLETE`. (All case-insensitive by default.)
3. **Custom tags & regex**

   * Allow users and workspaces to add/remove tags and supply regex patterns for matching.
4. **Gutter / overview-ruler markers**

   * Show small colored markers in the gutter and overview ruler for quick scanning.
5. **Performance-safe scanning**

   * Index open files immediately; optionally scan workspace asynchronously with limits (debounce/queue). Use range-based decorations (TextEditorDecorationType). ([Visual Studio Code][2])

## Navigation & UX

6. **Tree view / sidebar with tags (workspace index)**

   * List all occurrences grouped by tag and file; click to open and jump to line. (Like Todo Tree.) ([Visual Studio Marketplace][3])
7. **Quick commands**

   * Commands: Jump to next/previous tag, list tags in current file, open tag tree, toggle tag visibility.
8. **Status bar & summary**

   * Status bar widget showing counts per-tag (e.g., TODO: 12, URGENT: 1).
9. **In-file inline counts and fold markers**

   * Optional small count badge for number of tags in the current file; integrate with folding if applicable.

## Tag lifecycle & edits

10. **Mark-as-done / toggle state**

    * Command or code action to toggle a TODO → DONE (automatically update formatting and optionally append timestamp/user).
11. **CodeLens and inline actions**

    * Add CodeLens above a tag with quick actions: Create issue, Mark done, Assign, Add due date.
12. **Search / filter & saved filters**

    * Filter by tag, file path, assignee, date, workspace, or regex; save frequent filters.

## Integrations & export

13. **Issue tracker integrations (optional)**

    * Quick create: GitHub issue, Jira ticket (open API hooks / generate payload).
14. **Export / report**

    * Export tags to JSON/CSV/Markdown (workspace or filtered subset).
15. **CI / repository scanning**

    * Optional workspace scan mode with outputs suitable for CI checks; fail pipeline if `URGENT` tags exist (opt-in).

## Customization & settings

16. **Per-language and per-workspace settings**

    * Allow language-specific tag patterns or disable for specific languages.
17. **Theme-aware color configuration**

    * Colors should be configurable but respect theme contrast; allow use of semantic tokens where appropriate.
18. **User-level presets & shareable workspace presets**

    * Presets for teams (e.g., “strict review” preset that highlights more tags).
19. **Regex-based advanced highlighting**

    * Allow capture groups and multi-line tag matching (block comments).

## Accessibility, security & quality

20. **High-contrast and accessibility options**

    * Alternate palettes and text-only emphasis for users with color-vision deficiencies.
21. **Privacy & telemetry**

    * No telemetry by default; explicit opt-in and clear privacy settings.
22. **Safe defaults**

    * Disabled workspace-wide scanning by default for privacy; user explicitly enables.

## Developer & CI features

23. **Unit + integration tests**

    * Tests for parsing logic (regex, comment detection), and for decorator application.
24. **Extensibility API**

    * Provide a small API that other extensions or workspace scripts can call to read tags or register tag processors.

---

# 3 — Advanced (v1 / v2)
no need now

---

# 4 — Implementation hints & mapping to VS Code APIs

* **Highlighting & styling**: use `vscode.window.createTextEditorDecorationType` and `editor.setDecorations` for per-range styles (supports font-style, background, border, overview ruler markers). Use the decorator-sample for guidance. ([GitHub][4])
* **Workspace scanning**: for full-repo scans, leverage `ripgrep` (native `rg`) or `workspace.findFiles` + `TextDocument.getText()` with careful throttling; Todo Tree uses ripgrep for fast workspace scans. ([Visual Studio Marketplace][3])
* **Tree view**: implement a `TreeDataProvider` for the activity bar sidebar (clicking items `vscode.window.showTextDocument` + reveal position). ([Visual Studio Code][2])
* **Code actions / CodeLens**: use `CodeLensProvider` and `CodeActionProvider` to add inline actions (e.g., mark done, create issue).
* **Configuration**: expose settings under `contributes.configuration` (JSON schema), support both `user` and `workspace` scope.
* **Regex & comment-only matching**: either rely on language tokenization (safer) or use comment-delimiters map per language to limit matches only to commented regions.

---

# 5 — Suggested defaults & example settings snippet

**Default tags**: `TODO`, `FIXME`, `BUG`, `NOTE`, `HACK`, `OPTIMIZE`, `URGENT`, `REVIEW`, `DEPRECATED`.

Example `settings.json` snippet (for `package.json` contributes.configuration and for user to set):

```json
"better-comments-pro": {
  "enabled": true,
  "tags": [
    {"name": "TODO", "pattern": "\\bTODO\\b[:\\s]?", "style": {"color": "#d19a66", "fontStyle": "bold"}},
    {"name": "FIXME", "pattern": "\\bFIXME\\b[:\\s]?", "style": {"color": "#e06c75", "background": "#2a1f1f"}},
    {"name": "URGENT", "pattern": "\\bURGENT\\b[:\\s]?", "style": {"color": "#ffffff", "background": "#d9534f", "fontStyle": "bold"}}
  ],
  "scanWorkspaceOnOpen": false,
  "showInStatusBar": true,
  "matchOnlyInComments": true,
  "enableTreeView": true
}
```

(Allow users to provide raw regex strings or simple tag names.)

---

# 7 — Competitive differentiation (how to stand out)

* **Metadata-aware tags** (assignee/due/priority) surfaced in tree view and filters.
* **Performance-first defaults** (no workspace scan unless enabled).
* **Extensible actions** (allow teams to add custom CodeLens templates).
* **Shared presets** for team onboarding (workspace-level config and presets).

---

# 8 — Risks & constraints

* **Performance**: workspace-wide regex scanning can be expensive — prefer `rg` and incremental indexing. ([Visual Studio Marketplace][3])
* **Language correctness**: naive regex can match non-comment text; prefer language-aware token checks where possible. ([Visual Studio Code][2])
* **Marketplace fatigue**: many “todo” extensions exist (Better Comments, TODO Highlight); focus on unique features (metadata, integrations, team presets). ([Visual Studio Marketplace][1])

---



[1]: https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments&utm_source=chatgpt.com "Better Comments - Visual Studio Marketplace"
[2]: https://code.visualstudio.com/api/references/vscode-api?utm_source=chatgpt.com "VS Code API | Visual Studio Code Extension API"
[3]: https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree&utm_source=chatgpt.com "Todo Tree - Visual Studio Marketplace"
[4]: https://github.com/microsoft/vscode-extension-samples/blob/main/decorator-sample/USAGE.md?utm_source=chatgpt.com "vscode-extension-samples/decorator-sample/USAGE.md at main"
