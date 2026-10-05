pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t smart-attendance:%BUILD_NUMBER% .'
                bat 'docker tag smart-attendance:%BUILD_NUMBER% smart-attendance:latest'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker rm -f smart-attendance || exit /b 0'
                bat 'docker run -d --name smart-attendance -p 10000:10000 smart-attendance:latest'
            }
        }

        stage('Health Check') {
            steps {
                bat 'curl.exe -f http://localhost:10000/health'
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
    }
} 
