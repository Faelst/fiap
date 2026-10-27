#!/usr/bin/env bash
# Smoke test do build: sobe `node dist/main` com um banco SQLite novo
# (migrate deploy + seed), faz login do Gustavo e confere health, /me, boletim,
# Swagger, x-request-id e que o log não tem senha, CPF nem token.
#
# Uso (em api/, depois de `yarn build`):  ./scripts/smoke.sh
# Precisa de curl e jq. Variáveis opcionais: SMOKE_PORT (padrão 3399).
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${SMOKE_PORT:-3399}"
BASE="http://127.0.0.1:${PORT}"
DB_FILE="smoke.db"
WORK_DIR="$(mktemp -d)"
LOG_FILE="${WORK_DIR}/api.log"
SERVER_PID=""

# Banco, porta e segredo próprios: o smoke nunca toca no dev.db nem no .env.
export DATABASE_URL="file:./${DB_FILE}"
export PORT
export NODE_ENV=production
export LOG_LEVEL=info
export JWT_SECRET="smoke-$(date +%s)-segredo-descartavel"
export JWT_EXPIRES_IN=1h
export CORS_ORIGINS='*'
export SWAGGER_ENABLED=true
export TRUST_PROXY=false
# Nesta máquina há um yarn 3 acima do repo (ver 02-dev.md); no CI não faz diferença.
export YARN_IGNORE_PATH=1

CPF="969.294.560-04"
CPF_DIGITS="96929456004"
PASSWORD="123456"

remove_db() {
  rm -f "${DB_FILE}" "${DB_FILE}-journal" "${DB_FILE}-wal" "${DB_FILE}-shm"
}

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
  remove_db
  rm -rf "${WORK_DIR}"
}
trap cleanup EXIT

fail() {
  echo "SMOKE FALHOU: $*" >&2
  if [[ -f "${LOG_FILE}" ]]; then
    echo "--- últimas linhas do log da API ---" >&2
    tail -n 30 "${LOG_FILE}" >&2
  fi
  exit 1
}

for tool in curl jq node; do
  command -v "${tool}" >/dev/null || fail "${tool} não encontrado"
done
[[ -f dist/main.js ]] || fail "dist/main.js não existe: rode yarn build antes"

echo "==> banco novo (${DB_FILE}): migrate deploy + seed"
remove_db
yarn -s prisma:setup >"${WORK_DIR}/setup.log" 2>&1 || {
  cat "${WORK_DIR}/setup.log" >&2
  fail "prisma:setup"
}

echo "==> subindo node dist/main na porta ${PORT}"
node dist/main >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 50); do
  if curl -fsS "${BASE}/api/health" >/dev/null 2>&1; then
    break
  fi
  kill -0 "${SERVER_PID}" 2>/dev/null || fail "a API parou durante o boot"
  sleep 0.2
done

# GET com Bearer; imprime o corpo e falha se o status não for o esperado.
get() {
  local path="$1" expected="$2" token="${3:-}" body status
  body="${WORK_DIR}/body.json"
  if [[ -n "${token}" ]]; then
    status=$(curl -sS -o "${body}" -w '%{http_code}' -H "Authorization: Bearer ${token}" "${BASE}${path}")
  else
    status=$(curl -sS -o "${body}" -w '%{http_code}' "${BASE}${path}")
  fi
  [[ "${status}" == "${expected}" ]] || fail "GET ${path}: esperado ${expected}, veio ${status}: $(cat "${body}")"
  cat "${body}"
}

echo "==> GET /api/health"
get /api/health 200 | jq -e '.status == "ok"' >/dev/null || fail "health sem status ok"

echo "==> POST /api/auth/login (Gustavo)"
HEADERS="${WORK_DIR}/login.headers"
LOGIN=$(curl -sS -D "${HEADERS}" -H 'content-type: application/json' -H 'x-request-id: smoke-login-1' \
  -d "{\"cpf\":\"${CPF}\",\"password\":\"${PASSWORD}\"}" "${BASE}/api/auth/login")
TOKEN=$(jq -er '.accessToken' <<<"${LOGIN}") || fail "login sem accessToken: ${LOGIN}"
grep -qi '^x-request-id: smoke-login-1' "${HEADERS}" || fail "login não devolveu o x-request-id enviado"

echo "==> GET /api/me"
ME=$(get /api/me 200 "${TOKEN}")
jq -e '.firstName == "Gustavo" and .cpf == "***.294.560-**" and (.students | length) == 2' <<<"${ME}" >/dev/null \
  || fail "/api/me inesperado: ${ME}"
RAFAEL_ID=$(jq -er '.students[] | select(.firstName == "Rafael") | .id' <<<"${ME}") || fail "Rafael não está no /me"

echo "==> GET /api/students/<rafael>/report-cards/2025"
CARD=$(get "/api/students/${RAFAEL_ID}/report-cards/2025" 200 "${TOKEN}")
jq -e '.year == 2025 and .className == "7EF" and ([.terms[].term] == [1,2,3]) and (.terms[0].subjects | length) == 12' \
  <<<"${CARD}" >/dev/null || fail "boletim inesperado: ${CARD}"

echo "==> rotas protegidas sem token: 401"
get /api/me 401 >/dev/null

echo "==> GET /docs-json"
get /docs-json 200 | jq -e '.paths | has("/api/students/{id}/report-cards/{year}")' >/dev/null \
  || fail "Swagger sem as rotas"

echo "==> log em JSON, sem senha, CPF nem token"
sleep 0.3
jq -e 'select(.msg == "request completed" and .req.id == "smoke-login-1")' "${LOG_FILE}" >/dev/null \
  || fail "log JSON da requisição de login não encontrado"
for secret in "\"${PASSWORD}\"" "${CPF}" "${CPF_DIGITS}" "${TOKEN}" "Bearer"; do
  if grep -qF -- "${secret}" "${LOG_FILE}"; then
    fail "o log contém dado sensível (${secret:0:6}…)"
  fi
done

echo "SMOKE OK"
