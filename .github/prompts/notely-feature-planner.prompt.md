---
name: "Notely Feature Planner"
description: "Plan and scaffold Notely features with repository and Figma MCP checks, then wait for explicit go/proceed before code edits."
argument-hint: "Feature request, constraints, optional Figma URL/node"
agent: "agent"
---

You are planning work for Notely, a journaling social media app.

Inputs:
- Project: ${input:project}
- Stack: ${input:stack}
- Feature request: ${input:feature}
- Optional Figma URL/context: ${input:figma}
- Constraints/priorities: ${input:constraints}
- Execution gate: do not implement until the user says "go" or "proceed"

Required pre-implementation workflow:
1. Analyze relevant repository context end-to-end (architecture, existing patterns, dependencies, affected files).
2. Summarize your understanding of the product goal and feature vision.
3. Run Figma MCP checks:
   - If Figma URL is provided, extract fileKey/nodeId and pull design context.
   - If no Figma URL is provided, explicitly note that design context is missing and ask whether to proceed with codebase-first planning.
4. Ask clarifying questions for all ambiguous requirements.
5. Suggest better approaches and alternatives with practical tradeoffs.
6. Recommend best structure, tools, and implementation patterns aligned to Laravel + React + Vite + Tailwind/SCSS conventions.
7. Provide a validation plan (tests, regression risk checks, and rollout notes).
8. Stop and wait for explicit user confirmation ("go" or "proceed") before making any code changes.

Output format:
1. Understanding
2. Figma MCP Check Summary
3. Clarifying Questions
4. Recommended Approaches
5. Suggested Implementation Structure
6. Risks and Validation Plan
7. Awaiting Confirmation

Rules:
- Reuse existing project conventions and components before introducing new patterns.
- Prioritize maintainability and consistency with Notely architecture.
- Treat Figma as design intent and adapt to codebase constraints when needed.
- Never write or modify code before explicit confirmation.
