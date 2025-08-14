#!groovy

// import shared library
@Library("dsoLibrary@master") _

// populate variables from folder
REGISTRY = "${env.PROJECT_DOCKER_REGISTRY}"
REGISTRY_CRED_ID = "${env.REGISTRY_DEV_CRED_ID}"
PROJECT_ID = "tech-radar"
APP_NAME = "radar-front"
DOCKERFILE_NAME = "ci/docker/Dockerfile"

withFolderProperties{
    API_CRED_ID = "${env.API_CRED_ID}"
}

pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '100', artifactNumToKeepStr: '100'))
    }

    environment {
        GIT_COMMIT_SHORT = sh(
            script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
            returnStdout: true
        )
    }

    parameters {
        string(name: 'API_BASE_URL', defaultValue: 'http://', description: 'URL for API radar backend', trim: true)
        string(name: 'MIN_RU_RADARS', defaultValue: '5', description: 'Minimum number of domestic solution to highlight a ring', trim: true)
        gitParameter(branchFilter: 'origin/(.*)', defaultValue: 'master', name: 'BRANCH', type: 'PT_BRANCH_TAG')
    }


    stages {
        stage("Set build name") {
            steps {
                script {
                    buildSetter()
                }
            }
        }

        stage("Docker registry login") {
            steps {
                doDocker("login", ["registryCred": "$REGISTRY_CRED_ID",
                                    "registry": "$REGISTRY"])
            }
        }
        stage("Docker build image") {
            steps {
                withCredentials([string(credentialsId: "${API_CRED_ID}", variable: 'TOKEN')]) {
                    doDocker("build", ["registry": "$REGISTRY",
                                        "registry_path": "$PROJECT_ID",
                                        "image_name": "$APP_NAME",
                                        "image_tag": "$GIT_COMMIT_SHORT",
                                        "dockerfileName": "$DOCKERFILE_NAME",
                                        "additionalArgs": "--build-arg API_BASE_URL=${params.API_BASE_URL} --build-arg MIN_RU_RADARS=${params.MIN_RU_RADARS} --build-arg API_AUTH_TOKEN=${TOKEN}"])

                }
            }
        }
        stage("Docker push image") {
            steps {
                doDocker("push", ["registry": "$REGISTRY",
                                    "registry_path": "$PROJECT_ID",
                                    "image_name": "$APP_NAME",
                                    "image_tag": "$GIT_COMMIT_SHORT"])
            }
        }
    }
}
