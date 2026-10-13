pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        PATH+NODE = 'C:\\Program Files\\nodejs'
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

        stage('Check Tools') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'docker --version'
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
                bat 'docker build --pull -t %IMAGE_NAME%:%BUILD_NUMBER% -t %IMAGE_NAME%:latest .'
            }
        }

        stage('Deploy to Docker') {
            when {
                expression {
                    env.BRANCH_NAME == 'main' ||
                    env.GIT_BRANCH == 'origin/main' ||
                    env.GIT_BRANCH == 'main'
                }
            }
            steps {
                bat '''@echo off
                    docker rm -f %CONTAINER_NAME% 2>NUL
                    docker run -d --restart unless-stopped --name %CONTAINER_NAME% -p %APP_PORT%:%APP_PORT% -e PORT=%APP_PORT% %IMAGE_NAME%:%BUILD_NUMBER%
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Health Check') {
            when {
                expression {
                    env.BRANCH_NAME == 'main' ||
                    env.GIT_BRANCH == 'origin/main' ||
                    env.GIT_BRANCH == 'main'
                }
            }
            steps {
                powershell '''
                    $uri = "http://localhost:$env:APP_PORT/health"
                    $healthy = $false

                    for ($i = 0; $i -lt 15; $i++) {
                        try {
                            $response = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 2
                            if ($response.StatusCode -eq 200) {
                                $healthy = $true
                                break
                            }
                        } catch {
                            Start-Sleep -Seconds 2
                        }
                    }

                    if (-not $healthy) {
                        docker logs $env:CONTAINER_NAME
                        throw "Health check failed at $uri"
                    }

                    Write-Host "Application is healthy at $uri"
                '''
            }
        }
    }

    post {
        success {
            echo 'Tests passed; Docker image built. Main-branch deployment completed when applicable.'
        }
        failure {
            echo 'Pipeline failed. Review the stage logs before deploying.'
        }
        always {
            echo 'Smart Attendance CI/CD pipeline finished.'
        }
    }
}