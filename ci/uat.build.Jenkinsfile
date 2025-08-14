#!groovy

// import shared library
@Library("dsoLibrary@master") _

// populate variables from folder

withFolderProperties{
  REGISTRY = "${env.REGISTRY_TRUST}"
  REGISTRY_CRED_ID = "${env.REGISTRY_TRUST_CRED_ID}"
  PROJECT_ID = "${env.PROJECT_ID}"
  DOCKERFILE_NAME = "uat.Dockerfile"
}

REPO = "git@git.devzone.local:devzone/s190001494/u180001034/dumper/dumper-front.git"

def repos = [
    ${REPO}: "main"
]

APP_NAME = "dumper-front"
DOCKERFILE_NAME = "ci/docker/uat.Dockerfile"

pipeline {
    agent {
        label "trust"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '100', artifactNumToKeepStr: '100'))
    }

    environment {
        GIT_COMMIT_SHORT = sh(
            script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
            returnStdout: true
        )
    }
/*
ARG API_BASE_URL
ARG MIN_RU_RADARS
ARG API_AUTH_TOKEN
*/
    parameters {
        gitParameter(branchFilter: 'origin/(.*)', defaultValue: 'master', name: 'BRANCH', type: 'PT_BRANCH_TAG')
        string(name: "API_BASE_URL", defaultValue: "http://radar.techpark.local:8080/api/v1", description:"API BASE URL", trim: true)
        string(name: 'TAG', defaultValue: 'latest', trim: true, description: 'Имя тега для образа')
        booleanParam(name: 'SAST_CHECK', defaultValue: false, description: 'Do SAST check')
        booleanParam(name: 'SCA_CHECK', defaultValue: false, description: 'Do SCA check')
        booleanParam(name: 'IMAGE_CHECK', defaultValue: false, description: 'Do image check')
    }

    stages {
        stage("Set build name") {
            steps {
                script {
                    buildSetter()
                }
            }
        }

        stage("Docker build image") {
            steps {
                doDocker("login", ["registryCred": "$REGISTRY_CRED_ID",
                                    "registry": "$REGISTRY"])
                doDocker("build", ["registry": "$REGISTRY",
                                    "registry_path": "$PROJECT_ID",
                                    "image_name": "$APP_NAME",
                                    "image_tag": "${params.TAG}",
                                    "dockerfileName": "$DOCKERFILE_NAME",
                                    "additionalArgs": [
                                      "API_BASE_URL=${params.API_BASE_URL}"
                                    ]])
            }
        }
        stage("SAST scan") {
            when {
                expression { params.SAST_CHECK == true}
            }
            steps {
                doSastCheck "manualWithParameters", [
                    git_env: "devzone_gitlab",
                    repos_for_scan: repos,
                    sast_generate_reports: true,
                    sast_generate_reports_email_list: "batalov.av@gazprom-neft.ru",
                    sast_lang: "javascript"
                ]
            }
        }
        stage("SCA check") {
            when {
                expression { params.SCA_CHECK == true}
            }
            steps {
                script {
                    def result = doScaCheck(git_url: REPO,
                        git_branch: BRANCH,
                        email: "batalov.av@gazprom-neft.ru",
                        component: "front")
                    println("=== pipeline scan result ====\npassed: $result.passed\nreport: $result.report\nmessage: $result.message")
                    if (!result.passed) {
                        error("SCA завершено с ошибками")
                    }
                }
            }
        }

        stage("Docker push image") {
            steps {
                doDocker("login", ["registryCred": "$REGISTRY_CRED_ID",
                                    "registry": "$REGISTRY"])
                doDocker("push", ["registry": "$REGISTRY",
                                    "registry_path": "$PROJECT_ID",
                                    "image_name": "$APP_NAME",
                                    "image_tag": "${params.TAG}"])
            }
        }

        stage ("Run Container Security check") {
            when {
                expression { params.IMAGE_CHECK == true}
            }
            steps {
                script {
                    doContainerSecurityCheck([
                        'registry': REGISTRY,
                        'image': PROJECT_ID + '/' + APP_NAME + ':' + params.TAG,
                        'report_format': 'text',
                        'mail': 'batalov.av@gazprom-neft.ru',
                        'csec_type': 'luntry'
                    ])
                }
            }
        }
        stage("Docker re-pull image to KOA") {
            steps {
                build job: '/U180001034_KOA/utils/push2koa',
                    parameters: [gitParameter(name: 'BRANCH', value: 'main'),
                    string(name: 'IMAGE', value: "$PROJECT_ID/$APP_NAME:${params.TAG}")]
            }
        }

    }
}
