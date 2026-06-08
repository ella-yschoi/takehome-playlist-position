---
description: Generate a structured internal KB article from a resolved bug. Use after completing a bug investigation and fix to capture the issue, root cause, fix, and prevention guidance for future reference.
argument-hint: "[customer ticket title]"
disable-model-invocation: true
---

A bug has just been investigated and resolved. Generate a structured internal knowledge base article that documents this incident for future reference.

If a customer ticket title was provided as `$ARGUMENTS`, use it as the article title. This keeps the KB article linked to the original ticket by name. Otherwise, derive a concise title from the context.

Produce a single markdown document using the following structure:

---

### [Issue Title]

**Summary**
One or two sentences describing what the customer experienced and what was wrong under the hood.

**What was reported**
What the customer observed, in their words or a close paraphrase.

**Root cause**
Technical explanation of why this happened. Be specific about the function, query, or code path that was at fault and why it produced the wrong result.

**Fix**
What was changed, where in the codebase, and why that was the right place to make the change. Include file and line references where applicable.

**How to verify**
Concrete steps to confirm the fix is working correctly: which endpoints to call, what values to check, or which tests to run.

**Prevention**
Patterns or practices to avoid to prevent this class of bug from coming back. Include any recommendations for future refactoring, infrastructure changes, or code conventions worth establishing.

**Code references**
Relevant files, functions, or queries. Use `file:line` format where applicable.
