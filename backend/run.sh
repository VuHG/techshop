#!/usr/bin/env bash
# ============================================================
# Chay backend TechShop.
# Bien bi mat (mat khau Gmail...) doc tu file .env — KHONG commit len git.
#
# Lan dau:
#   cd ~/projects/techshop/backend
#   cp .env.example .env      # roi mo .env dien Gmail + App Password
#   bash run.sh
#
# Nhung lan sau chi can:
#   bash run.sh
# ============================================================
set -euo pipefail

# Ve dung thu muc chua script (backend/) du ban goi tu dau.
cd "$(dirname "$0")"

# Nap bien tu .env neu co (tu dong export toan bo).
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
  echo ">> Da nap cau hinh tu .env"
else
  echo "!! Chua co file .env — chay o che do DEV (OTP in ra console)."
  echo "   De gui OTP that qua Gmail: cp .env.example .env  roi dien thong tin."
fi

# Gia tri mac dinh neu .env chua khai bao (an toan: mac dinh in OTP ra console).
export CORS_ORIGINS="${CORS_ORIGINS:-http://192.168.211.131:3000}"
export MAIL_DEV_MODE="${MAIL_DEV_MODE:-true}"

echo "=================================================="
echo " MAIL_DEV_MODE = ${MAIL_DEV_MODE}   (false = gui mail that)"
echo " CORS_ORIGINS  = ${CORS_ORIGINS}"
if [ "${MAIL_DEV_MODE}" = "false" ]; then
  echo " Gui mail qua  = ${MAIL_HOST:-?} / ${MAIL_USERNAME:-<chua dat>}"
fi
echo "=================================================="

exec mvn spring-boot:run
