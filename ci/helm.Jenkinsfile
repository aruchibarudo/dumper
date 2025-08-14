#!groovy
// import shared library
@Library("dsoLibrary@master") _
// populate variables from folder
withFolderProperties{
    project_reg = env.PROJECT_DOCKER_REGISTRY
    project_reg_cred_id = 'repos-r'
    shared_reg = env.SHARED_REGISTRY_DZ
    shared_reg_cred_id = 'repos-r'
    dh_api_url = env.DH_API_URL
    dh_cred_id = 'dh-communal-token'
    dh_namespace = env.HUB_PROJECT_ID
}

pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        GIT_COMMIT_SHORT = sh(
            script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
            returnStdout: true
        )
    }

    stages {
        stage("Set build name") {
            steps {
                script {
                    buildSetter()
                }
            }
        }
        stage("Helm deploy") {
            steps {
                withKubeConfig([login_type: "k8s",
                                auth_provider: "plain",
                                cred_id: "$dh_cred_id",
                                kube_server: "$dh_api_url",
                                kube_namespace: "$dh_namespace"]) {
                    doHelm "install", [helm_chart: "radar-front",
                                        app_name: "radar-front",
                                        namespace: "$dh_namespace",
                                        docker_registry: "$shared_reg",
                                        docker_registry_cred_id: "$shared_reg_cred_id",
                                        helm_commands: "--set registry=${project_reg} --set image.tag='343c260'"]
                }
            }
        }
    }
}