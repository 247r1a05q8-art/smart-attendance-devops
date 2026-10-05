pipeline {
    agent any

    environment {
        PATH = "C:\\Program Files\\nodejs;${env.PATH}"
        IMAGE_NAME = 'smart-attendance'
        CONTAINER_NAME = 'smart-attendance'
        APP_PORT = '10000'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Node.js') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
                bat 'cd backend && npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'cd backend && npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME%:%BUILD_NUMBER% .'
                bat 'docker tag %IMAGE_NAME%:%BUILD_NUMBER% %IMAGE_NAME%:latest'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker rm -f %CONTAINER_NAME% || exit /b 0'
                bat 'docker run -d --name %CONTAINER_NAME% -p %APP_PORT%:%APP_PORT% %IMAGE_NAME%:latest'
            }
        }

        stage('Health Check') {
            steps {
                bat '"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -NoProfile -Command "Invoke-WebRequest -Uri http://localhost:%APP_PORT%/health -UseBasicParsing"'
            }
        }
    }

    post {
        success {
            echo 'Smart Attendance deployment completed successfully.'
        }

        failure {
            echo 'Smart Attendance pipeline failed.'
        }

        always {
            echo 'Smart Attendance CI/CD pipeline finished.'
        }
    }
}