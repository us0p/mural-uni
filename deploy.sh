#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[deploy]${NC} $*"; }
success() { echo -e "${GREEN}[deploy]${NC} $*"; }
warn()    { echo -e "${YELLOW}[deploy]${NC} $*"; }
error()   { echo -e "${RED}[deploy]${NC} $*" >&2; }

usage() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --pull        Pull latest code from git before deploying"
  echo "  --no-cache    Build images without Docker layer cache"
  echo "  --logs        Tail service logs after deploy (Ctrl+C to stop)"
  echo "  --help        Show this help"
  exit 0
}

PULL=false
NO_CACHE=""
SHOW_LOGS=false

for arg in "$@"; do
  case $arg in
    --pull)     PULL=true ;;
    --no-cache) NO_CACHE="--no-cache" ;;
    --logs)     SHOW_LOGS=true ;;
    --help)     usage ;;
    *)          error "Unknown option: $arg"; usage ;;
  esac
done

# ── Dependency checks ────────────────────────────────────────────────────────

if ! command -v docker &>/dev/null; then
  error "docker is not installed or not in PATH"
  exit 1
fi

if ! docker compose version &>/dev/null; then
  error "docker compose plugin is required (docker compose, not docker-compose)"
  exit 1
fi

# ── .env validation ──────────────────────────────────────────────────────────

if [ ! -f ".env" ]; then
  error ".env not found at project root."
  error "Copy .env.example and fill in the required values:"
  error "  cp .env.example .env"
  exit 1
fi

if [ ! -f "college-api/.env" ]; then
  error "college-api/.env not found."
  error "Create it with the required API environment variables (see college-api/.env.example if available)."
  exit 1
fi

# Warn if .env still contains placeholder values
if grep -q "localhost" .env 2>/dev/null; then
  warn "NEXT_PUBLIC_API_URL in .env still points to localhost — update it to your server's IP/domain for production."
fi

# ── Optional git pull ────────────────────────────────────────────────────────

if [ "$PULL" = true ]; then
  info "Pulling latest code..."
  git pull
fi

# ── Build & deploy ───────────────────────────────────────────────────────────

info "Building images and starting services..."
# shellcheck disable=SC2086
docker compose up -d --build $NO_CACHE

# ── Health wait ──────────────────────────────────────────────────────────────

info "Waiting for services to become healthy..."
TIMEOUT=120
ELAPSED=0
INTERVAL=3

while [ $ELAPSED -lt $TIMEOUT ]; do
  UNHEALTHY=$(docker compose ps --format json 2>/dev/null \
    | grep -c '"Health":"unhealthy"' || true)
  STARTING=$(docker compose ps --format json 2>/dev/null \
    | grep -c '"Health":"starting"' || true)

  if [ "$UNHEALTHY" -gt 0 ]; then
    error "One or more services are unhealthy. Check logs:"
    error "  docker compose logs"
    exit 1
  fi

  if [ "$STARTING" -eq 0 ]; then
    break
  fi

  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

# ── Status ───────────────────────────────────────────────────────────────────

echo ""
success "Deployment complete!"
echo ""
docker compose ps
echo ""
info "Endpoints:"
info "  API      → http://localhost:8080"
info "  Frontend → http://localhost:3001"
echo ""

if [ "$SHOW_LOGS" = true ]; then
  info "Tailing logs (Ctrl+C to exit)..."
  docker compose logs -f
fi
