# SADMIN 2025 MCP Server - Uputstvo za korišćenje

## 🚀 Brzi start

### 1. Instalacija

```bash
cd /home/buslogic/sadmin2025-mcp-server
npm install
npm run build
```

### 2. Prebacivanje između environment-a

#### Za produkciju:
```bash
npm run env:prod
npm start
# ili direktno:
npm run start:prod
```

#### Za lokalni development:
```bash
npm run env:local
npm start
# ili direktno:
npm run start:local
```

## 📋 Dostupne skripte

- `npm run env:local` - Prebaci na lokalni environment
- `npm run env:prod` - Prebaci na produkcijski environment
- `npm run dev:local` - Pokreni development server sa lokalnim API
- `npm run dev:prod` - Pokreni development server sa produkcijskim API
- `npm run start:local` - Pokreni produkcijski build sa lokalnim API
- `npm run start:prod` - Pokreni produkcijski build sa produkcijskim API

## 🔑 Environment konfiguracija

### Produkcija (.env.production)
- URL: https://sadmin2025api.ticketing.rs/api/claude
- API Key: claude_DoGQQYPIAzk2uZMwQ24o4cOMMyLsFw72
- Project ID: be92301b-8118-4651-a252-a996339ead2e

### Lokalni development (.env.local)
- URL: http://localhost:3006/api/claude
- API Key: claude_KJEqOY0wanCh3QDu8ZkKmytnvAqSmtu6
- Project ID: cacf6ec3-e988-4969-9448-be741ddcaee4

## 🧪 Testiranje

### Health check:
```bash
curl http://localhost:3010/health
```

### Lista funkcija:
```bash
curl http://localhost:3010/functions | python3 -m json.tool
```

### Test getProjects:
```bash
curl -X POST http://localhost:3010/functions/sadmin_getProjects \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test getTasks:
```bash
curl -X POST http://localhost:3010/functions/sadmin_getTasks \
  -H "Content-Type: application/json" \
  -d '{"status": "TODO"}'
```

## 📊 Monitoring

Praćenje logova u real-time:
```bash
# Ako je pokrenut u pozadini
tail -f nohup.out

# Ili direktno pokreni
npm run dev:prod
```

## 🛠 Troubleshooting

### Server ne može da se poveže sa API
1. Proveri da li je backend pokrenut (za lokalni)
2. Proveri API ključ u .env fajlu
3. Proveri mrežnu konekciju (za produkciju)

### Permission denied
```bash
chmod +x scripts/test-server.sh
```

### Port već u upotrebi
```bash
# Pronađi proces
lsof -i :3010
# Ili promeni port u .env
MCP_SERVER_PORT=3011
```

## 📚 API Funkcije

### Task Management
- `sadmin_getTasks` - Lista taskova
- `sadmin_getTask` - Detalji taska
- `sadmin_createTask` - Kreiraj task
- `sadmin_updateTaskStatus` - Ažuriraj status

### Epic Management
- `sadmin_getEpics` - Lista epic-a
- `sadmin_createEpic` - Kreiraj epic

### Comments & Attachments
- `sadmin_getComments` - Lista komentara
- `sadmin_addComment` - Dodaj komentar
- `sadmin_getAttachments` - Lista priloga
- `sadmin_uploadAttachment` - Upload fajla
- `sadmin_downloadAttachment` - Download fajla

## 🔄 Workflow

1. **Development**: Koristi `npm run dev:local` za lokalni rad
2. **Testing**: Prebaci na produkciju sa `npm run env:prod` i testiraj
3. **Production**: Deploy sa `npm run start:prod`

## 📦 NPM Publishing

Kada bude spreman za NPM:
```bash
npm login
npm publish --access public
```