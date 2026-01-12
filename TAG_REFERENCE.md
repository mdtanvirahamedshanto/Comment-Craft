# Comment Craft - Tag Reference Guide

## 📋 Canonical Tag Mapping

Comment Craft supports both **text-based tags** and **symbol-based tags** with flexible matching patterns.

## 🏷️ Text-Based Tags

### TODO - Tasks & Future Work
**Color:** Mustard (#d19a66) | **Symbols:** ☐ ➤ • 📌

**Supported Formats:**
```javascript
// TODO: implement feature
// todo - add validation
// @todo improve UX
// ☐ TODO: refactor code
// TODO implement auth
```

**Aliases:** `todo`, `@todo`, `TODO:`

---

### FIXME - Needs Fixing
**Color:** Red (#e06c75) | **Symbols:** 🔧 ❗ 🛠

**Supported Formats:**
```javascript
// FIXME: null pointer issue
// fixme - broken logic
// @fixme memory leak
// 🔧 FIXME: needs attention
// FIX: crash on login
```

**Aliases:** `fixme`, `@fixme`, `FIX`, `fix`

---

### BUG - Known Defect
**Color:** Red (#e06c75) | **Symbols:** 🐞 ✖ ⛔

**Supported Formats:**
```javascript
// BUG: crashes on login
// bug - memory leak
// @bug null reference
// 🐞 BUG: production issue
// defect: broken feature
```

**Aliases:** `bug`, `@bug`, `defect`, `DEFECT`

---

### NOTE - Important Information
**Color:** Pink (#e91e63) | **Symbols:** ℹ 📝 📄

**Supported Formats:**
```javascript
// NOTE: this runs only on prod
// note - config must exist
// @note important info
// ℹ NOTE: production only
// info: configuration required
```

**Aliases:** `note`, `@note`, `info`, `INFO`

---

### HACK - Temporary Workaround
**Color:** Yellow (#f39c12) | **Symbols:** ⚠ ☢ 🚧

**Supported Formats:**
```javascript
// HACK: hardcoded value
// hack - temporary fix
// @hack workaround
// ⚠ HACK: needs refactoring
// workaround: quick fix
```

**Aliases:** `hack`, `@hack`, `workaround`, `WORKAROUND`

---

### OPTIMIZE - Performance Improvement
**Color:** Yellow (#f1c40f) | **Symbols:** ⚡ 📈 🚀

**Supported Formats:**
```javascript
// OPTIMIZE: reduce DB calls
// optimize - caching needed
// @optimize performance
// ⚡ OPTIMIZE: slow query
// perf: improve algorithm
```

**Aliases:** `optimize`, `@optimize`, `perf`, `PERF`, `performance`, `PERFORMANCE`

---

### URGENT - Immediate Attention
**Color:** White on Red (#ffffff on #d9534f) | **Symbols:** 🚨 🔥 ‼

**Supported Formats:**
```javascript
// URGENT: production issue
// urgent - hotfix required
// @urgent security fix
// 🚨 URGENT: critical bug
// critical: fix immediately
```

**Aliases:** `urgent`, `@urgent`, `critical`, `CRITICAL`, `hotfix`, `HOTFIX`

---

### REVIEW - Needs Review
**Color:** Blue (#3498DB) | **Symbols:** 👀 🔍 🧐

**Supported Formats:**
```javascript
// REVIEW: check logic
// review - needs approval
// @review code quality
// 👀 REVIEW: verify implementation
// check: validate approach
```

**Aliases:** `review`, `@review`, `check`, `CHECK`, `audit`, `AUDIT`

---

### DEPRECATED - Outdated Code
**Color:** Purple (#9b59b6) | **Symbols:** ☠ 🗑 ⚰ | **Style:** Strikethrough

**Supported Formats:**
```javascript
// DEPRECATED: use new API
// deprecated - remove next release
// @deprecated old method
// ☠ DEPRECATED: legacy code
// obsolete: will be removed
```

**Aliases:** `deprecated`, `@deprecated`, `obsolete`, `OBSOLETE`

---

### DONE - Completed
**Color:** Green (#98C379) | **Symbols:** ✔ ✅ ☑

**Supported Formats:**
```javascript
// DONE: migration finished
// done - tested
// @done completed
// ✔ DONE: feature implemented
// resolved: issue fixed
```

**Aliases:** `done`, `@done`, `resolved`, `RESOLVED`

---

### COMPLETE - Fully Finished
**Color:** Green (#98C379) | **Symbols:** 🏁 🎉 ✓✓

**Supported Formats:**
```javascript
// COMPLETE: feature delivered
// complete - ready for release
// @complete finished
// 🏁 COMPLETE: project done
// finished: all tasks complete
```

**Aliases:** `complete`, `@complete`, `finished`, `FINISHED`

---

## 🔣 Symbol-Based Tags

### ! - Critical / Error
**Color:** Red (#FF2D00) | **Maps to:** BUG, FIXME, URGENT

```javascript
// ! Critical security issue
// ! Production down
// ! Fix immediately
```

---

### ? - Question / Review
**Color:** Blue (#3498DB) | **Maps to:** REVIEW

```javascript
// ? Is this correct?
// ? Needs clarification
// ? Review this logic
```

---

### * - Completed
**Color:** Green (#98C379) | **Maps to:** DONE, COMPLETE

```javascript
// * Feature implemented
// * Task completed
// * Ready for release
```

---

### ^ - Improve / Warning
**Color:** Yellow (#f1c40f) | **Maps to:** OPTIMIZE, HACK, IMPROVE

```javascript
// ^ Performance improvement
// ^ Temporary workaround
// ^ Needs optimization
```

---

### & - Note / Info
**Color:** Pink (#e91e63) | **Maps to:** NOTE, INFO

```javascript
// & Important information
// & Configuration note
// & Implementation detail
```

---

### ~ - Deprecated
**Color:** Purple (#9b59b6) | **Style:** Strikethrough | **Maps to:** DEPRECATED

```javascript
// ~ Old implementation
// ~ Legacy code
// ~ Will be removed
```

---

## 🎯 Regex Pattern Support

All tags support flexible matching with:

- **Optional symbols** - Symbols are optional, tags work with or without them
- **Optional @ prefix** - Both `TODO` and `@todo` work
- **Case-insensitive** - `TODO`, `todo`, `Todo` all work
- **Optional : or -** - Both `TODO:` and `TODO -` work
- **Whitespace flexible** - Handles various spacing

### Pattern Structure

The regex pattern follows this structure:
```
(^|\s)([symbol])?\s*@?(TAG|alias)\b\s*[:\-]?
```

**Example:** `(^|\s)(☐|➤|•|📌)?\s*@?(TODO|todo|@todo)\b\s*[:\-]?`

This matches:
- `// TODO:`
- `// todo -`
- `// ☐ TODO`
- `// @todo`
- `// TODO implement`

---

## 🎨 Color Reference

| Tag | Color | Hex | Purpose |
|-----|-------|-----|---------|
| TODO | Mustard | #d19a66 | Tasks |
| FIXME | Red | #e06c75 | Fixes needed |
| BUG | Red | #e06c75 | Bugs |
| NOTE | Pink | #e91e63 | Information |
| HACK | Yellow | #f39c12 | Workarounds |
| OPTIMIZE | Yellow | #f1c40f | Performance |
| URGENT | White/Red | #ffffff/#d9534f | Critical |
| REVIEW | Blue | #3498DB | Review needed |
| DEPRECATED | Purple | #9b59b6 | Outdated |
| DONE | Green | #98C379 | Completed |
| COMPLETE | Green | #98C379 | Finished |
| ! | Red | #FF2D00 | Critical |
| ? | Blue | #3498DB | Question |
| * | Green | #98C379 | Completed |
| ^ | Yellow | #f1c40f | Improve |
| & | Pink | #e91e63 | Note |
| ~ | Purple | #9b59b6 | Deprecated |

---

## 💡 Usage Tips

1. **Use text tags for clarity** - `TODO:` is more explicit than `!`
2. **Use symbols for quick notes** - `!` is faster than `URGENT:`
3. **Combine symbols with text** - `☐ TODO:` is visually clear
4. **Use aliases for consistency** - `@todo` for team standards
5. **Leverage color coding** - Red for urgent, Green for done

---

## 🔧 Customization

All tags can be customized in VS Code settings:

```json
{
  "commentCraft.tags": [
    {
      "tag": "TODO",
      "pattern": "(^|\\s)(☐)?\\s*@?(TODO|todo)\\b\\s*[:\\-]?",
      "color": "#d19a66",
      "bold": true
    }
  ]
}
```

---

**For more information, see the [README](README.md)**

