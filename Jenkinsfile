// Pipeline CI/CD TechShop: build image + deploy bằng docker compose trên agent Ubuntu.
// Yêu cầu agent: có Docker + docker compose (v2) + curl, và có sẵn file .env ở workspace
// (hoặc dùng Jenkins Credentials/withCredentials để sinh .env trước khi build).
pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Kiểm tra .env') {
            steps {
                sh '''
                    if [ ! -f .env ]; then
                        echo ">> Thiếu file .env. Tạo .env (xem .env.example) hoặc inject qua Jenkins credentials."
                        exit 1
                    fi
                '''
            }
        }

        stage('Build images') {
            steps { sh 'docker compose build' }
        }

        stage('Deploy') {
            steps { sh 'docker compose up -d' }
        }

        stage('Smoke test') {
            steps {
                sh '''
                    echo ">> Chờ backend sẵn sàng (tối đa ~150s)..."
                    ok=0
                    for i in $(seq 1 30); do
                        if curl -fsS "http://localhost:8080/api/san-pham?size=1" >/dev/null 2>&1; then
                            ok=1; echo ">> Backend OK"; break
                        fi
                        sleep 5
                    done
                    [ "$ok" = "1" ] || { echo ">> Backend không phản hồi"; exit 1; }
                    echo ">> Kiểm tra AI gateway..."
                    curl -fsS "http://localhost:3001/api/ai/health" || { echo ">> AI gateway lỗi"; exit 1; }
                '''
            }
        }
    }

    post {
        success { echo 'CI/CD thành công — hệ thống đã deploy.' }
        failure { echo 'Pipeline thất bại — xem log phía trên.' }
        always  { sh 'docker compose ps || true' }
    }
}
