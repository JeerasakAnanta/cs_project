pipeline {
    agent any
    environment {
        REPO_LOMA = ''
        WORKSPACE_NAME = 'sdm.ds'
        PROJECT_NAME = 'prototypeone'
        TAG = '0.1.0'
    }

    stages {
        // Build Images stage
        stage('Build Image') {
            steps {
                script {

                    echo "==================================================="
                    echo "                 Build Image                       "
                    echo "==================================================="

                    // Grant executable permission for 'chmod 755 ./chatbot_api/Dockerfile'
                    sh 'chmod 755 ./chatbot_web/Dockerfile'
                    sh 'chmod 755 ./chat_pdf_management_api/Dockerfile'
                    sh 'chmod 755 ./chatbot_api/Dockerfile'

                    // Build Docker images
                    sh "docker build -t ${REPO_LOMA}/${WORKSPACE_NAME}/${PROJECT_NAME}_chatbot_api:${TAG} -f ./chatbot_api/Dockerfile ."
                    sh "docker build -t ${REPO_LOMA}/${WORKSPACE_NAME}/${PROJECT_NAME}_chatbot_create_collection:${TAG} -f ./chat_pdf_management_api/Dockerfile ."
                    sh "docker build -t ${REPO_LOMA}/${WORKSPACE_NAME}/${PROJECT_NAME}_chatbot_front:${TAG} -f ./chatbot_web/Dockerfile ."
                }
            }
        }
        // Run Docker images using docker-compose
        stage('Run Images') {
            steps {
                script {

                    echo "==================================================="
                    echo "=                 Run Image                       ="
                    echo "==================================================="
                    // You might not need to change permissions here; note that this step can be skipped if permissions are already correct.
                    sh "chmod 777 docker-compose.yaml"  // Consider removing this line for security reasons.
                    // Ensure Docker Compose is run as the correct user
                    sh "docker-compose down"
                    sh "docker-compose up -d"
                }
            }
        }
    }
}
