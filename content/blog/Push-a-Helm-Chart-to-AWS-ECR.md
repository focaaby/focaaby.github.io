+++
author = "Jerry Wang"
categories = ["aws", "ecr", "oci", "helm" ]
date = "2021-05-04"
description = "AWS ECR supports pushing OCI artifacts to your repositories, and this article will go through how to push a Helm chart to ECR. Also, I try to use the Helm Dependency on ECR. The ECR supported the Helm template written in Helm Dependency, but ECR repositories are still not can not add as Helm repo currently."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Push a Helm Chart to AWS ECR"
type = "post"

+++

## Summary

AWS ECR supports pushing Open Container Initiative (OCI) artifacts[1][2] to your repositories, and this article will go through how to push a Helm chart to ECR. Also, I try to use the Helm Dependency on ECR. The ECR supported the Helm template written in Helm Dependency, but ECR repositories are still not can not add as Helm repo currently.

## Testing Steps

1. Following the steps in document[2] to install the Helm client version 3.
    ```bash
    $ helm version

    version.BuildInfo{Version:"v3.5.3", GitCommit:"041ce5a2c17a58be0fcd5f5e16fb3e7e95fea622", GitTreeState:"dirty", GoVersion:"go1.15.8"}
    ```
2. Enable OCI support in the Helm 3 client.
    ```bash
    $ export HELM_EXPERIMENTAL_OCI=1
    ```
3. Create a repository to store your Helm chart
    ```bash
    $ aws ecr create-repository \
            --repository-name helm-test \
            --region eu-west-1
    {
        "repository": {
            "repositoryArn": "arn:aws:ecr:eu-west-1:123456789012:repository/helm-test",
            "registryId": "123456789012",
            "repositoryName": "helm-test",
            "repositoryUri": "123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test",
            "createdAt": "2021-05-04T15:07:49+00:00",
            "imageTagMutability": "MUTABLE",
            "imageScanningConfiguration": {
                "scanOnPush": false
            },
            "encryptionConfiguration": {
                "encryptionType": "AES256"
            }
        }
    }
    ```
4. Authenticate your Helm client to the Amazon ECR registry to which you intend to push your Helm chart.
    ```bash
    $ aws ecr get-login-password \
        --region eu-west-1 | helm registry login \
        --username AWS \
        --password-stdin 123456789012.dkr.ecr.eu-west-1.amazonaws.com
    Login succeeded
    ```
5. Use the following steps to create a test Helm chart.
    ```bash
    $ mkdir helm-tutorial
    $ cd helm-tutorial

    $ helm create mychart
    Creating mychart

    $ rm -rf ./mychart/templates/*

    $ cd mychart/templates
    $ cat <<EOF > configmap.yaml
    > apiVersion: v1
    > kind: ConfigMap
    > metadata:
    >   name: mychart-configmap
    > data:
    >   myvalue: "Hello World"
    > EOF
    ```

6. Save the chart locally and create an alias for the chart with your registry URI.
    ```bash
    $ cd ..
    $ helm chart save . mychart
    ref:     mychart:0.1.0
    digest:  66ac23dc1e383370778e2a8db2bf1d93e73f169af14569618dcec38a086405a4
    size:    1.4 KiB
    name:    mychart
    version: 0.1.0
    0.1.0: saved

    $ helm chart save . 123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test:mychart
    ref:     123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test:mychart
    digest:  2935917ffbc7492eae674f1e82308a2acd4e41b3b6db4c25b79a25095481ebca
    size:    1.4 KiB
    name:    mychart
    version: 0.1.0
    mychart: saved
    ```
7. Identify the Helm chart to push. Run the helm chart list command to list the Helm charts on your system.
    ```bash
    $ helm chart list
    REF                                                             NAME    VERSION DIGEST  SIZE    CREATED
    123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test:my...    mychart 0.1.0   66ac23d 1.4 KiB 2 minutes
    mychart:0.1.0
    ```
8. Push the Helm chart using the helm chart push command.
    ```bash
    $ helm chart push 123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test:mychart
    The push refers to repository [123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test]
    ref:     123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test:mychart
    digest:  2935917ffbc7492eae674f1e82308a2acd4e41b3b6db4c25b79a25095481ebca
    size:    1.4 KiB
    name:    mychart
    version: 0.1.0
    mychart: pushed to remote (1 layer, 1.4 KiB total)
    ```
9. Describe your Helm chart.
    ```bash
    $ aws ecr describe-images \
        --repository-name helm-test \
        --region eu-west-1
    {
        "imageDetails": [
            {
                "registryId": "123456789012",
                "repositoryName": "helm-test",
                "imageDigest": "sha256:2935917ffbc7492eae674f1e82308a2acd4e41b3b6db4c25b79a25095481ebca",
                "imageTags": [
                    "mychart"
                ],
                "imageSizeInBytes": 1610,
                "imagePushedAt": "2021-05-04T15:16:24+00:00",
                "imageManifestMediaType": "application/vnd.oci.image.manifest.v1+json",
                "artifactMediaType": "application/vnd.cncf.helm.config.v1+json"
            }
        ]
    }
    ```
10. Copy the mychart directory to mychart-dependency.
    ```bash
    $ cp -r mychart/ mychart-dependency
    ```
11. Create another new ECR repository named helm-dependency.
    ```bash
    $ aws ecr create-repository \
            --repository-name helm-dependency \
            --region eu-west-1

    {
        "repository": {
            "repositoryArn": "arn:aws:ecr:eu-west-1:123456789012:repository/helm-dependency",
            "registryId": "123456789012",
            "repositoryName": "helm-dependency",
            "repositoryUri": "123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-dependency",
            "createdAt": "2021-05-04T15:21:25+00:00",
            "imageTagMutability": "MUTABLE",
            "imageScanningConfiguration": {
                "scanOnPush": false
            },
            "encryptionConfiguration": {
                "encryptionType": "AES256"
            }
        }
    }
    ```
12. Update the Chart.yaml and add the configuration for Helm dependencies.
    ```bash
    $ cat Chart.yaml
    apiVersion: v2
    name: mychart-dependency
    description: A Helm chart for Kubernetes

    type: application
    version: 0.1.0
    appVersion: "1.16.0"

    dependencies:
    - name: mychart
      version: "0.1.0"
      repository: "123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test:mychart"
    ```
12. Push Helm chart `mychart-dependency` using the helm chart push command.
    ```bash
    $ helm chart save . mychart-dependency
    ref:     mychart-dependency:0.1.0
    digest:  5d948b5d95b7e455215fd957930c057a2e556b437656713a7deefae0c8017dfa
    size:    1.5 KiB
    name:    mychart-dependency
    version: 0.1.0
    0.1.0: saved

    $ helm chart save . 123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-dependency:mychart-dependency
    ref:     123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-dependency:mychart-dependency
    digest:  a1200cf17bfae3a733c83b8981da2b2e2b44a79963ffc1dab53cbc58e6f8e8c9
    size:    1.5 KiB
    name:    mychart-dependency
    version: 0.1.0
    mychart-dependency: saved

    $ helm chart list
    REF                                                             NAME                    VERSION DIGEST  SIZE    CREATED
    123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-depende...    mychart-dependency      0.1.0   a1200cf 1.5 KiB 20 seconds
    123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-test:my...    mychart                 0.1.0   a1200cf 1.4 KiB 14 minutes
    mychart-dependency:0.1.0                                        mychart-dependency      0.1.0   a1200cf 1.5 KiB 58 seconds
    mychart:0.1.0                                                   mychart                 0.1.0   a1200cf 1.4 KiB 15 minutes

    $ helm chart push 123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-dependency:mychart-dependency
    The push refers to repository [123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-dependency]
    ref:     123456789012.dkr.ecr.eu-west-1.amazonaws.com/helm-dependency:mychart-dependency
    digest:  a1200cf17bfae3a733c83b8981da2b2e2b44a79963ffc1dab53cbc58e6f8e8c9
    size:    1.5 KiB
    name:    mychart-dependency
    version: 0.1.0
    mychart-dependency: pushed to remote (1 layer, 1.5 KiB total)
    ```

Helm dependency is using the "repository" URL should point to a Chart Repository[4], which is ECR not supported yet currently[5].

## References

1. OCI Artifact Support In Amazon ECR - [https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html](https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html)
2. ECR supports pushing Open Container Initiative (OCI) artifacts to your repositories - [https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html](https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html)
3. Using Amazon ECR Images with Amazon EKS - Installing a Helm chart hosted on Amazon ECR with Amazon EKS - [https://docs.aws.amazon.com/AmazonECR/latest/userguide/ECR_on_EKS.html#using-helm-charts-eks](https://docs.aws.amazon.com/AmazonECR/latest/userguide/ECR_on_EKS.html#using-helm-charts-eks)
4. Helm Dependency - [https://helm.sh/docs/helm/helm_dependency/](https://helm.sh/docs/helm/helm_dependency/)
5. Allow Helm to automatically install from a chart stored in an ECR repository - [https://github.com/aws/containers-roadmap/issues/1116](https://github.com/aws/containers-roadmap/issues/1116)