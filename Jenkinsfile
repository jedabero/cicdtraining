pipeline {
    agent any

    environment {
        IMAGE_NAME = 'jedabero/cicdtraining'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
                sh 'docker tag $IMAGE_NAME:$IMAGE_TAG $IMAGE_NAME:latest'
            }
        }

        stage('Push Docker Image') {
            steps {
                echo 'Authenticate with DockerHub and push image'
                sh 'docker push $IMAGE_NAME:$IMAGE_TAG'
                sh 'docker push $IMAGE_NAME:latest'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment stage defined for future Kubernetes or cloud environment'
            }
        }
    }

    post {
        success {
            echo 'CD pipeline completed successfully.'
        }
        failure {
            echo 'CD pipeline failed.'
        }
    }
}