#!/usr/bin/env bash
# Teste do container: build já feito (IMAGE), sobe com um volume novo e SEM
# JWT_SECRET, espera o healthcheck, faz login do Gustavo e reinicia o container.
# Depois do restart o mesmo token tem que continuar valendo: o seed não recria o
# banco e o segredo gerado na primeira subida foi reaproveitado do volume.
#
# Uso (em api/, com Docker):  docker build -t fiap-school-api:local . && ./scripts/docker-smoke.sh
# Variáveis opcionais: IMAGE (padrão fiap-school-api:local), DOCKER_SMOKE_PORT (3334).
set -euo pipefail

IMAGE="${IMAGE:-fiap-school-api:local}"
PORT="${DOCKER_SMOKE_PORT:-3334}"
BASE="http://127.0.0.1:${PORT}"
SUFFIX="$$-$(date +%s)"
CONTAINER="fiap-school-api-smoke-${SUFFIX}"
VOLUME="fiap-school-api-smoke-${SUFFIX}"

cleanup() {
  docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
  docker volume rm "${VOLUME}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

fail() {
  echo "DOCKER SMOKE FALHOU: $*" >&2
  echo "--- logs do container ---" >&2
  docker logs --tail 40 "${CONTAINER}" >&2 || true
  exit 1
}

for tool in docker curl jq; do
  command -v "${tool}" >/dev/null || fail "${tool} não encontrado"
done

wait_healthy() {
  local status=""
  for _ in $(seq 1 90); do
    status=$(docker inspect -f '{{.State.Health.Status}}' "${CONTAINER}" 2>/dev/null || echo "?")
    if [[ "${status}" == "healthy" ]]; then
      curl -fsS "${BASE}/api/health" | jq -e '.status == "ok"' >/dev/null && return 0
    fi
    [[ "$(docker inspect -f '{{.State.Running}}' "${CONTAINER}")" == "true" ]] || fail "o container parou"
    sleep 1
  done
  fail "o container não ficou healthy (último status: ${status})"
}

me_status() {
  curl -sS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $1" "${BASE}/api/me"
}

echo "==> subindo ${IMAGE} (volume ${VOLUME}, porta ${PORT})"
docker volume create "${VOLUME}" >/dev/null
docker run -d --name "${CONTAINER}" \
  -p "127.0.0.1:${PORT}:3333" \
  -v "${VOLUME}:/app/data" \
  -e CORS_ORIGINS="*" \
  "${IMAGE}" >/dev/null
wait_healthy

echo "==> login do Gustavo"
LOGIN=$(curl -fsS -H 'content-type: application/json' \
  -d '{"cpf":"969.294.560-04","password":"123456"}' "${BASE}/api/auth/login") || fail "login falhou"
TOKEN=$(jq -er '.accessToken' <<<"${LOGIN}") || fail "login sem accessToken"
[[ "$(me_status "${TOKEN}")" == "200" ]] || fail "/api/me com o token novo não deu 200"

echo "==> reiniciando o container"
docker restart "${CONTAINER}" >/dev/null
wait_healthy
echo "==> segredo gerado no volume: 600, dono node"
PERMS=$(docker exec "${CONTAINER}" stat -c '%a %U' /app/data/jwt-secret) || fail "jwt-secret não existe no volume"
[[ "${PERMS}" == "600 node" ]] || fail "jwt-secret com permissão/dono errado: ${PERMS}"

LOGS=$(docker logs "${CONTAINER}" 2>&1)
SECRET=$(docker exec "${CONTAINER}" cat /app/data/jwt-secret)
grep -qF -- "${SECRET}" <<<"${LOGS}" && fail "o segredo apareceu no log do container"
[[ "$(grep -c 'segredo aleatório gerado' <<<"${LOGS}")" == "1" ]] || fail "o segredo devia ser gerado só no primeiro boot"
grep -qF 'Seed ignorado' <<<"${LOGS}" || fail "o seed não foi ignorado no segundo boot"

echo "==> o token de antes do restart continua valendo"
[[ "$(me_status "${TOKEN}")" == "200" ]] || fail "/api/me com o token de antes do restart não deu 200"

echo "DOCKER SMOKE OK"
