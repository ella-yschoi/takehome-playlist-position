---
description: Triage a customer bug report. Investigate root cause, apply a fix, and draft both a customer reply and a team message.
argument-hint: "[customer bug report text]"
disable-model-invocation: true
---

A customer has submitted the following bug report:

<customer_report>
$ARGUMENTS
</customer_report>

Work through this systematically:

1. **Investigate**: Search the codebase to find all code paths related to the
   reported behavior. Read the relevant source files and identify the root cause.

2. **Fix**: Propose a minimal, targeted fix. Explain why this is the right place
   to make the change and confirm no other columns or tables are affected.
   Then apply the fix directly to the source file.

3. **Customer reply**: Draft a concise email reply from Ella Choi
   (support@chartmetric.com). Lead with confirmation that the issue is resolved,
   briefly explain the cause in plain, non-technical language, and close with an
   open invitation to follow up.

4. **Team message**: Draft an internal message with:
   - One-line context on how the customer reported the issue
   - Root cause (technical, concise)
   - Fix summary
   - Test status
   - Any trade-offs or follow-up items worth flagging

Format the output with clear section headers for each of the four parts above.
