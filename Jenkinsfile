
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
                echo 'Running automated tests...'
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
            steps {
                echo 'Checking application health...'

                bat '''
                    node -e "async function check(){for(let i=0;i<12;i++){try{const r=await fetch('http://localhost:%APP_PORT%/health');if(r.ok){const d=await r.json();if(d.status==='ok'){console.log('Health check passed:',JSON.stringify(d));return;}}}catch(e){}await new Promise(r=>setTimeout(r,5000));}console.error('Health check failed after retries');process.exit(1);}check();"
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
