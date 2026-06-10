pipeline {
    agent any

    environment {
        REGION = 'southamerica-east1'
        SERVICE_NAME = 'cicdtraining'
        REPOSITORY = 'cicdtrainingrepo'
        IMAGE_NAME = 'cicdtraining'
        IMAGE_TAG = "${BUILD_NUMBER}"

        // Jenkins credential of type "Secret text" with the GCP project id.
        GCP_PROJECT_ID = credentials('gcp-project-id')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node and pnpm') {
            steps {
                sh 'node --version'
                sh 'corepack enable'
                sh 'pnpm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Run Unit Tests') {
            steps {
                sh 'pnpm test'
            }
        }

        stage('Run E2E Tests') {
            steps {
                sh 'pnpm test:e2e'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    IMAGE="${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    docker build -t "$IMAGE" .
                    docker tag "$IMAGE" "${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"
                '''
            }
        }

        stage('Authenticate with Google Cloud') {
            steps {
                // Jenkins credential of type "Secret file" containing a service account JSON key.
                // The service account must have Cloud Run Admin, Artifact Registry Writer,
                // and Service Account User permissions.
                withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                    sh 'gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"'
                    sh 'gcloud config set project "$GCP_PROJECT_ID"'
                    sh 'gcloud auth configure-docker $REGION-docker.pkg.dev --quiet'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                    gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

                    IMAGE="${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"

                    docker push "$IMAGE"
                    docker push "${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"
                '''
            }
        }

        stage('Deploy to Cloud Run') {
            steps {
                sh '''
                    IMAGE="${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"

                    gcloud run deploy "$SERVICE_NAME" \
                      --image "$IMAGE" \
                      --region "$REGION" \
                      --platform managed \
                      --allow-unauthenticated
                '''
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