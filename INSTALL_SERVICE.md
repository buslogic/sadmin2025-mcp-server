# Instalacija kao sistemski servis

## Za automatski start REST servera pri boot-u:

### 1. Kopiraj service fajl:
```bash
sudo cp /home/buslogic/sadmin2025-mcp-server/sadmin-mcp.service /etc/systemd/system/
```

### 2. Reload systemd:
```bash
sudo systemctl daemon-reload
```

### 3. Enable service:
```bash
sudo systemctl enable sadmin-mcp.service
```

### 4. Start service:
```bash
sudo systemctl start sadmin-mcp.service
```

### 5. Proveri status:
```bash
sudo systemctl status sadmin-mcp.service
```

## Korisne komande:

```bash
# Stop service
sudo systemctl stop sadmin-mcp.service

# Restart service
sudo systemctl restart sadmin-mcp.service

# View logs
sudo journalctl -u sadmin-mcp.service -f

# Disable auto-start
sudo systemctl disable sadmin-mcp.service
```

## Alternativa - PM2 (preporučeno za development):

### Instaliraj PM2:
```bash
npm install -g pm2
```

### Pokreni sa PM2:
```bash
cd /home/buslogic/sadmin2025-mcp-server
pm2 start dist/index.js --name sadmin-mcp-rest
pm2 save
pm2 startup
```

### PM2 komande:
```bash
pm2 list              # Lista procesa
pm2 logs sadmin-mcp   # Logovi
pm2 restart sadmin-mcp # Restart
pm2 stop sadmin-mcp   # Stop
```