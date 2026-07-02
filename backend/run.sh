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

# Nap bien tu .env neu co — doc AN TOAN tung dong KEY=VALUE, KHONG chay .env
# nhu shell script (tranh loi "command not found" khi value co khoang trang...).
# Tu dong bo khoang trang thua trong key va o dau/cuoi value.
if [ -f .env ]; then
  while IFS= read -r raw || [ -n "$raw" ]; do
    raw="${raw%$'\r'}"                       # bo ky tu CR (neu file kieu Windows)
    case "$raw" in ''|'#'*|[[:space:]]*) continue;; esac   # bo dong trong / comment
    case "$raw" in *=*) ;; *) continue;; esac              # bo dong khong co '='
    key="${raw%%=*}"; val="${raw#*=}"
    key="$(printf '%s' "$key" | tr -d '[:space:]')"        # bo moi khoang trang trong key
    val="${val#"${val%%[![:space:]]*}"}"                   # bo khoang trang dau value
    val="${val%"${val##*[![:space:]]}"}"                   # bo khoang trang cuoi value
    [ -n "$key" ] && export "$key=$val"
  done < .env
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
