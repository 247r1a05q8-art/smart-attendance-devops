
pipeline {
    agent any

    environment {
        PATH = "C:/Program Files/nodejs;${env.PATH}"
        IMAGE_NAME = 'smart-attendance'
        CONTAINER_NAME = 'smart-attendance'
        APP_PORT = '10000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out Smart Attendance project...'
                checkout scm
            }
        }

        stage('Check Tools') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'docker --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running available tests...'
                bat 'npm test --if-present'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Smart Attendance Docker image...'
                bat 'docker build -t %IMAGE_NAME%:%BUILD_NUMBER% -t %IMAGE_NAME%:latest .'
            }
        }

        stage('Deploy to Docker') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying Smart Attendance container...'

                bat '''
                    docker stop %CONTAINER_NAME% 2>NUL
                    docker rm %CONTAINER_NAME% 2>NUL
                    docker run -d --name %CONTAINER_NAME% -p %APP_PORT%:%APP_PORT% %IMAGE_NAME%:%BUILD_NUMBER%
                '''
            }
        }

        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo 'Checking application health...'

                bat '''
                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok = $false; for ($i = 0; $i -lt 12; $i++) { try { $r = Invoke-WebRequest -Uri 'http://localhost:%APP_PORT%/health' -TimeoutSec 5; if ($r.StatusCode -eq 200) { $ok = $true; break } } catch { Start-Sleep -Seconds 5 } }; if (-not $ok) { docker logs %CONTAINER_NAME%; exit 1 }"
                '''
            }
        }
    }

    post {
        success {
            echo 'Smart Attendance pipeline completed successfully!'
        }

        failure {
            echo 'Smart Attendance pipeline failed. Check the Console Output.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
