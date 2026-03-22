# Project Zero — Dev Journal

The dev journal is stored in the Pajama Game Studio API, NOT in this file.
This file is just a pointer.

## Where the Journal Lives

Every journal entry is stored as an **episodic memory** in the API:
```
POST /api/v1/memory/store
{
  "key": "journal/project-zero/YYYY-MM-DD-NNN",
  "value": "Role: [role]. Action: [what]. Result: [outcome]. Tool: [which]. Broken: [yes/no].",
  "agentId": "agent_id",
  "layer": "episodic",
  "category": "journal"
}
```

## Why API, Not File

1. Persists across sessions (survives session death)
2. Searchable (GET /memory/recall?q=broken finds all tool failures)
3. Compounding (feeds into knowledge graph and strategy distillation)
4. Multi-agent (future agents can read what happened)
5. Scored recall (recent entries rank higher, old entries decay)

## How to Read the Journal

```bash
# All journal entries
curl "$API/memory/recall?q=journal/project-zero" -H "x-api-key: KEY"

# Just the broken tools
curl "$API/memory/recall?q=broken" -H "x-api-key: KEY"
```

## Local Summary (updated as development progresses)

- Started: pending
- Current phase: not started
- Tasks completed: 0/0
- Tools broken and fixed: 0
