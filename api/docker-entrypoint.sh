#!/bin/sh
# Entrypoint da imagem: garante um JWT_SECRET, aplica migrations + seed e sobe a API.
#
# Sem JWT_SECRET na env, gera um segredo aleatório (48 bytes, base64) na
# primeira subida e grava no volume (/app/data/jwt-secret, permissão 600, dono
# do processo). Nos boots seguintes reaproveita o mesmo arquivo, então os
# tokens já emitidos continuam valendo depois de um restart. Com JWT_SECRET
# definido, ele vence e o arquivo é ignorado.
set -eu

SECRET_FILE="${JWT_SECRET_FILE:-/app/data/jwt-secret}"

if [ -z "${JWT_SECRET:-}" ]; then
  if [ ! -s "${SECRET_FILE}" ]; then
    umask 077
    node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('base64'))" >"${SECRET_FILE}.tmp"
    mv "${SECRET_FILE}.tmp" "${SECRET_FILE}"
    chmod 600 "${SECRET_FILE}"
    echo "JWT_SECRET não definido: segredo aleatório gerado em ${SECRET_FILE} e reutilizado nos próximos boots."
  fi
  JWT_SECRET="$(cat "${SECRET_FILE}")"
  export JWT_SECRET
fi

yarn -s prisma:setup
# exec: o node vira o PID 1 e recebe o SIGTERM do `docker stop`.
exec node dist/main
