#!/bin/bash
set -e

SERVER="root@64.227.171.212"
PROJECT_DIR="xbreak-monitor"
COMPOSE_FILE="docker-compose.yml"

echo "==> Pulling latest code on remote server..."
ssh "$SERVER" "cd $PROJECT_DIR && git fetch origin main && git reset --hard origin/main"

echo "==> Restarting Docker container with 1Password secrets..."
ssh "$SERVER" bash -lc "'cd $PROJECT_DIR && docker compose -f $COMPOSE_FILE down && op run --env-file=.env.tpl -- docker compose -f $COMPOSE_FILE up -d --build'"

echo "==> Waiting for service to start..."
sleep 10

echo "==> Health check..."
HEALTH=$(ssh "$SERVER" "curl -sf http://localhost:58431/health" 2>/dev/null)

if [ "$HEALTH" = "OK" ]; then
  echo "==> Deploy successful!"
  echo "    App: http://64.227.171.212:58431 - healthy"
else
  echo "==> Deploy may have issues!"
  echo "    Health response: $HEALTH"
  echo "    Check logs: ssh $SERVER 'cd $PROJECT_DIR && docker compose -f $COMPOSE_FILE logs --tail=50'"
  exit 1
fi
