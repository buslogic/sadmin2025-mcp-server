# Claude Code Integration Setup

## 🚀 Integracija MCP Servera sa Claude Code

### Opcija 1: Lokalna instalacija (Preporučeno)

1. **Build MCP server**:
```bash
cd /home/buslogic/sadmin2025-mcp-server
npm install
npm run build
```

2. **Dodaj u Claude Code config** (`~/.config/claude/mcp_servers.json`):
```json
{
  "sadmin2025": {
    "command": "node",
    "args": ["/home/buslogic/sadmin2025-mcp-server/dist/index.js"],
    "env": {
      "ENVIRONMENT": "production",
      "SADMIN_API_URL": "https://sadmin2025api.ticketing.rs/api/claude",
      "SADMIN_API_KEY": "claude_DoGQQYPIAzk2uZMwQ24o4cOMMyLsFw72",
      "SADMIN_PROJECT_ID": "be92301b-8118-4651-a252-a996339ead2e"
    }
  }
}
```

### Opcija 2: NPM instalacija (Kada bude objavljen)

1. **Instaliraj globalno**:
```bash
npm install -g @buslogic/sadmin2025-mcp
```

2. **Dodaj u Claude Code config**:
```json
{
  "sadmin2025": {
    "command": "sadmin2025-mcp",
    "env": {
      "SADMIN_API_KEY": "claude_DoGQQYPIAzk2uZMwQ24o4cOMMyLsFw72",
      "SADMIN_PROJECT_ID": "be92301b-8118-4651-a252-a996339ead2e"
    }
  }
}
```

## 📋 Dostupne funkcije u Claude Code

Nakon restarta Claude Code, dostupne su sledeće funkcije:

### Projects
- `sadmin_getProjects()` - Lista svih projekata
- `sadmin_getProject(id)` - Detalji projekta

### Tasks
- `sadmin_getTasks(projectId?, status?, type?)` - Lista taskova
- `sadmin_getTask(id)` - Detalji taska
- `sadmin_createTask({...})` - Kreiraj novi task
- `sadmin_updateTaskStatus(id, status)` - Ažuriraj status

### Epics
- `sadmin_getEpics(projectId?, status?)` - Lista epic-a
- `sadmin_createEpic({...})` - Kreiraj epic

### Comments
- `sadmin_getComments(taskId)` - Lista komentara
- `sadmin_addComment(taskId, content)` - Dodaj komentar

### Attachments
- `sadmin_getAttachments(entityType, entityId)` - Lista priloga
- `sadmin_uploadAttachment({...})` - Upload fajla
- `sadmin_downloadAttachment(id)` - Download fajla

## 🧪 Testiranje u Claude Code

```claude
# Lista svih TODO taskova
sadmin_getTasks(status="TODO")

# Kreiraj novi task
sadmin_createTask({
  projectId: "be92301b-8118-4651-a252-a996339ead2e",
  title: "Test task from Claude Code",
  type: "TASK",
  priority: "MEDIUM"
})

# Ažuriraj status
sadmin_updateTaskStatus("task-id", "IN_PROGRESS")

# Dodaj komentar
sadmin_addComment("task-id", "Working on this...")
```

## 🔧 Troubleshooting

### MCP server ne radi
1. Proveri da li je server pokrenut: `ps aux | grep sadmin`
2. Proveri logove: `tail -f ~/.config/claude/logs/mcp.log`
3. Restartuj Claude Code

### Funkcije nisu dostupne
1. Proveri config: `cat ~/.config/claude/mcp_servers.json`
2. Proveri da li postoji dist folder: `ls /home/buslogic/sadmin2025-mcp-server/dist`
3. Rebuild: `cd /home/buslogic/sadmin2025-mcp-server && npm run build`

### API greške
1. Proveri API ključ u config fajlu
2. Proveri internet konekciju
3. Testiraj direktno: `curl https://sadmin2025api.ticketing.rs/api/claude/health`

## 📝 Primeri korišćenja

### Pregled i rad sa Epic-om
```claude
# Pronađi epic
epics = sadmin_getEpics()

# Uzmi taskove epic-a
tasks = sadmin_getTasks(type="TASK", status="TODO")

# Ažuriraj task
sadmin_updateTaskStatus(tasks[0].id, "IN_PROGRESS")
sadmin_addComment(tasks[0].id, "Started implementation")
```

### Upload screenshot-a
```claude
# Čitaj fajl i konvertuj u base64
import base64
with open("screenshot.png", "rb") as f:
    content = base64.b64encode(f.read()).decode()

# Upload
sadmin_uploadAttachment({
  entityType: "task",
  entityId: "task-id",
  fileName: "screenshot.png",
  base64Content: f"data:image/png;base64,{content}"
})
```

## 🎯 Next Steps

1. **Test sve funkcije** u Claude Code
2. **Kreiraj GitHub release** za NPM publish
3. **Napravi video tutorial** za tim
4. **Deploy na production server**