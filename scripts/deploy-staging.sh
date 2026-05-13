#!/bin/bash

# WookieFoot - Staging Deployment
# Deploys Next.js app to staging environment on production server

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCTION_SERVER="docker@10.10.10.30"
STAGING_DIR="/home/docker/wookiefoot-staging"
SSH_KEY="$HOME/.ssh/id_ed25519"
STAGING_PORT=4001

log_info() { echo -e "${GREEN}✅${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠️${NC} $1"; }
log_error() { echo -e "${RED}❌${NC} $1"; exit 1; }
log_step() { echo -e "${BLUE}🔄${NC} $1"; }

check_prerequisites() {
    log_step "Checking prerequisites..."

    if [[ ! -f "$SSH_KEY" ]]; then
        log_error "SSH key not found: $SSH_KEY"
    fi

    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm not found"
    fi

    log_info "Prerequisites OK (Node $(node --version))"
}

build_site() {
    log_step "Building Next.js site..."

    cd "$PROJECT_ROOT"

    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        log_step "Installing dependencies..."
        pnpm install
    fi

    # Clean and build
    rm -rf .next
    pnpm build

    if [[ ! -d ".next" ]]; then
        log_error "Build failed - .next directory not created"
    fi

    log_info "Build completed"
}

deploy_to_staging() {
    log_step "Deploying to staging server..."

    # Create staging directory
    ssh -i "$SSH_KEY" "$PRODUCTION_SERVER" "mkdir -p $STAGING_DIR/src/content"

    # Sync required files (rsync is faster than scp for updates)
    rsync -az --delete -e "ssh -i $SSH_KEY" \
        "$PROJECT_ROOT/.next/" \
        "$PRODUCTION_SERVER:$STAGING_DIR/.next/"

    rsync -az --delete -e "ssh -i $SSH_KEY" \
        "$PROJECT_ROOT/public/" \
        "$PRODUCTION_SERVER:$STAGING_DIR/public/"

    rsync -az --delete -e "ssh -i $SSH_KEY" \
        "$PROJECT_ROOT/src/content/" \
        "$PRODUCTION_SERVER:$STAGING_DIR/src/content/"

    # Copy individual files
    scp -i "$SSH_KEY" -q \
        "$PROJECT_ROOT/package.json" \
        "$PROJECT_ROOT/pnpm-lock.yaml" \
        "$PROJECT_ROOT/song_index.csv" \
        "$PROJECT_ROOT/next.config.mjs" \
        "$PROJECT_ROOT/tailwind.config.ts" \
        "$PROJECT_ROOT/postcss.config.mjs" \
        "$PROJECT_ROOT/tsconfig.json" \
        "$PRODUCTION_SERVER:$STAGING_DIR/"

    # Install production dependencies on server
    ssh -i "$SSH_KEY" "$PRODUCTION_SERVER" << EOF
        export PATH="\$HOME/.local/share/fnm:\$PATH"
        eval "\$(fnm env)"
        fnm use 22
        cd $STAGING_DIR
        pnpm install --prod 2>&1 | tail -3
EOF

    log_info "Files deployed to staging"
}

start_staging_server() {
    log_step "Restarting wookiefoot.service on port $STAGING_PORT..."

    ssh -i "$SSH_KEY" "$PRODUCTION_SERVER" << EOF
        # systemd-managed (unit at /etc/systemd/system/wookiefoot.service)
        # Passwordless via /etc/sudoers.d/docker-deploy-restart
        sudo -n systemctl restart wookiefoot

        sleep 4
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$STAGING_PORT | grep -q "200\\|304"; then
            echo "wookiefoot.service responding on port $STAGING_PORT"
        else
            echo "Warning: server may still be starting..."
            systemctl status wookiefoot --no-pager -n 10 || true
        fi
EOF

    log_info "wookiefoot.service restarted on port $STAGING_PORT"
}

generate_summary() {
    echo -e "\n${BLUE}🎯 Staging Deployment Summary:${NC}"
    echo "  Server: $PRODUCTION_SERVER:$STAGING_DIR"
    echo "  Port: $STAGING_PORT"
    echo "  URL: http://10.10.10.30:$STAGING_PORT"
    echo "  Logs: ssh -i $SSH_KEY $PRODUCTION_SERVER 'tail -f /home/docker/wookiefoot-staging.log'"
}

main() {
    echo -e "${BLUE}🚀 WookieFoot - Staging Deployment${NC}"
    echo

    check_prerequisites
    build_site
    deploy_to_staging
    start_staging_server
    generate_summary

    echo
    log_info "Staging deployment completed!"
    log_info "Access staging at: http://10.10.10.30:$STAGING_PORT"
}

main "$@"
