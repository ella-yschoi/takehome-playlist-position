# Claude Skills: Support Toolkit

## Summary

This PR adds two Claude Code skills for the support team: `ticket-resolve` for investigating and responding to incoming bug reports, and `bug-postmortem` for documenting resolved bugs as internal KB articles. Both are designed to be deployed as a shared internal plugin, not tied to any single service or codebase.

## Skills

### 1. ticket-resolve

#### How to invoke

```
/ticket-resolve [customer bug report text]
```

#### Steps

Claude works through the report in four steps:

1. **Investigate**: search the codebase and identify the root cause
2. **Fix**: apply a minimal, targeted fix
3. **Customer reply**: draft a response confirming resolution in plain language
4. **Team message**: summarize root cause, fix, and any follow-up items

### 2. bug-postmortem

#### How to invoke

```
/bug-postmortem [customer ticket title]
```

#### Output

Claude reads the current conversation and produces a KB article with these sections:

- **Summary**: what the customer experienced and what was wrong internally
- **What was reported**: the customer's observation in plain language
- **Root cause**: specific function, query, or code path that failed and why
- **Fix**: what changed, where, and why that was the right place
- **How to verify**: endpoints to call, values to check, or tests to run
- **Prevention**: patterns to avoid and any structural changes worth considering
- **Code references**: file and line references for anyone reading the code later

#### Notes

- Pass the customer ticket title as the argument to link the KB article back to the original ticket by name. If omitted, Claude derives a title from context.
- The skill runs manually only. Claude cannot reliably know when a fix is truly complete, so the engineer triggers it explicitly once they are satisfied the investigation is done.

## Broader context

The goal is to package these skills as a plugin and publish it to an internal Claude marketplace. That way the support team can install and run them directly from the Claude app rather than the terminal, with the option to customize per team and eventually lock it down as an org-level plugin available only to the support team.

From there, the next step would be MCP integration: connecting to the ticketing system so Claude can read the ticket data automatically and register the generated KB article without any manual copy-paste.
