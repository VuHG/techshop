#!/usr/bin/env bash
# TechShop - Tu dong cai dat va chay (Linux/macOS).
#   Cach dung:  bash chay.sh
set -e
cd "$(dirname "$0")"

echo "============================================"
echo "   TechShop - Tu dong cai dat va chay"
echo "============================================"
echo

# 1) Kiem tra Docker
if ! docker version >/dev/null 2>&1; then
  echo "[LOI] Docker chua chay. Hay cai va khoi dong Docker roi chay lai."
  echo "Tai Docker: https://www.docker.com/products/docker-desktop"
  exit 1
fi

# 2) Chon lenh compose (v2 hoac v1)
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
else
  COMPOSE="docker-compose"
fi

# 3) Tao .env neu chua co
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Da tao file .env tu .env.example."
fi

# 4) Nhac dien GEMINI_API_KEY
if grep -q "your_gemini_api_key_here" .env; then
  echo
  echo "[CHU Y] Chua dien GEMINI_API_KEY (khoa cho chatbot AI)."
  read -r -p "Dan API key Google Gemini vao day (Enter de bo qua): " KEY
  if [ -n "$KEY" ]; then
    sed -i.bak "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=${KEY}|" .env && rm -f .env.bak
    echo "Da luu key."
  else
    echo "Bo qua - chatbot se khong hoat dong, phan con lai van chay."
  fi
fi

# 5) Build va khoi dong
echo
echo "Dang build va khoi dong... (lan dau co the mat vai phut, can Internet)"
$COMPOSE up -d --build

echo
echo "============================================"
echo "   HOAN TAT!"
echo "   Mo trinh duyet: http://localhost:3000"
echo "   Admin: 0999999999  /  Admin@123"
echo "============================================"
echo
$COMPOSE ps
echo
echo "(De DUNG he thong sau nay: $COMPOSE down)"
