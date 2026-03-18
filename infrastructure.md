# WookieFoot Website Infrastructure

## Domain Configuration
- **Live URL:** https://wookiefoot.kroeker.fun
- DNS Management: Cloudflare (kroeker.fun zone)
- SSL/TLS: Managed through Cloudflare tunnel

## Deployment Architecture

### Server Infrastructure
- **Production server:** 10.10.10.30 (Proxmox LXC, Ubuntu 22.04)
- **Staging port:** 4001
- **Node.js:** v20 LTS via fnm (user: docker)
- **Cloudflare tunnel:** Token-managed, routes wookiefoot.kroeker.fun → localhost:4001

### Deploy Commands
```bash
# Deploy to staging (builds locally, syncs to server, restarts)
./scripts/deploy-staging.sh

# Manual restart on server
ssh docker@10.10.10.30
export PATH="$HOME/.local/share/fnm:$PATH" && eval "$(fnm env)" && fnm use 20
cd /home/docker/wookiefoot-staging
API_PORT=4001 ./node_modules/.bin/next start -p 4001

# View logs
ssh docker@10.10.10.30 'tail -f /home/docker/wookiefoot-staging.log'
```

### Important: API_PORT
The `API_PORT` env var MUST match the port Next.js runs on. The data layer self-fetches
`localhost:API_PORT/api/lyrics` — if this doesn't match, pages crash with ECONNREFUSED.

## Infrastructure Components

### Web Server (TBD)
- Options under consideration:
  - Nginx
  - Apache
- Configuration will be documented here once decided

### Security Measures
1. Cloudflare security features
2. Docker security best practices
3. Regular security audits
4. SSL/TLS configuration

## Monitoring and Maintenance

### Health Checks
- Container health monitoring
- Resource usage tracking
- Performance metrics
- Error logging

### Backup Strategy
- Database backups (when implemented)
- Configuration backups
- Content versioning

## Infrastructure Updates

### Version History
- Initial Setup (Current)
  - Domain registration
  - Cloudflare integration
  - Docker containerization plan

### Planned Improvements
1. Automated deployment pipeline
2. Enhanced monitoring
3. Performance optimization
4. Scaling capabilities

## Environment Variables
```env
# To be configured:
NEXT_PUBLIC_SITE_URL=https://wookiefoot.com
# Additional environment variables will be documented here
```

## Infrastructure Management Commands
```bash
# To be documented:
# - Docker build commands
# - Deployment scripts
# - Maintenance procedures
# - Backup/restore procedures
```

## Infrastructure Diagram
```
[Internet] -> [Cloudflare] -> [Cloudflare Tunnel] -> [Docker Container] -> [Next.js App]
```

## Notes
- All infrastructure changes should be documented in this file
- Keep track of all configuration changes
- Document any issues and their resolutions
- Maintain version history of infrastructure modifications

---

Last Updated: 2025-01-19