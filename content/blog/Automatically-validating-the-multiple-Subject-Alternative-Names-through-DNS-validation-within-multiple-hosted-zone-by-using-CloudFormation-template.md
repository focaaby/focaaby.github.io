+++
author = "Jerry Wang"
categories = ["aws", "cloudformation", "cfn", "r53", "acm" ]
date = "2021-05-18"
description = "ACM support automatically renews DNS-validated certificates. In this article will go through how to request a public certificate with multiple SAN, which included the domain name in a public hosted zone and a private hosted zone."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Automatically validating the multiple SAN through DNS validation within multiple hosted zone by using CloudFormation template"
type = "post"

+++

## Summary

ACM support automatically renews DNS-validated certificates[1]. In this article will go through how to request a public certificate with multiple Subject Alternative Names(SAN)[2], which included the domain name in a public hosted zone and a private hosted zone.

## Steps

1. Create a public hosted zone, and record the hosted zone id.
2. Create a CloudFormation template with following YAML file.

    ```yaml
    ---
    AWSTemplateFormatVersion: '2010-09-09'
    Description: Test
    Resources:
      MyPrivateHostedZone:
        Type: AWS::Route53::HostedZone
        Properties:
          Name: dev.example.com
          VPCs:
          - VPCId: vpc-000e0266
            VPCRegion: eu-west-1
      MyCertificate:
        Type: AWS::CertificateManager::Certificate
        Properties:
          DomainName: "*.example.com"
          DomainValidationOptions:
          - DomainName: example.com
            HostedZoneId: ZZYK0LLL1NN1XX
          - DomainName: "*.dev.example.com"
            HostedZoneId: !Ref MyPrivateHostedZone
          SubjectAlternativeNames:
          - "*.dev.example.com"
          - "*.example.com"
          ValidationMethod: DNS
    ```

3. Create the the CloudFormation stack.
4. During the certificate is creating, ACM will create the both CNAME in the hosted zone that specific in CloudFormation template.

    ```bash
    $ aws cloudformation describe-stack-events --stack-name my53-certificate
    ...
    {
        "StackId": "arn:aws:cloudformation:eu-west-1:111222333444:stack/ttttteeset/eb245330-b821-11eb-89af-061b29697291",
        "EventId": "MyCertificate-0820989e-77e7-480e-8f57-2b3aaf3d59f4",
        "StackName": "my53-certificate",
        "LogicalResourceId": "MyCertificate",
        "PhysicalResourceId": "",
        "ResourceType": "AWS::CertificateManager::Certificate",
        "Timestamp": "2021-05-18T21:44:15.531000+00:00",
        "ResourceStatus": "CREATE_IN_PROGRESS",
        "ResourceStatusReason": "Content of DNS Record is: {Name: _7758ffb3838c6cf7c3ec68de36d03fe0.example.com.,
    Type: CNAME,Value: _3402713d1c23665051ea05c1963caf81.olprtlswtu.acm-validations.aws.}",
        "ClientRequestToken": "Console-CreateStack-b05e9d4a-9da0-dfe3-387c-4890b84060c2"
    },
    ...
    ```

## Wrapping up

1. The AWS ACM is supported DNS validation for both public and private hosted zone.
2. We can add multiple SAN with `DomainValidationOptions`[3] in CloudFormation.
3. ACM will create the domain's DNS record for a validation CNAME.


## References

1. Validating domain ownership - [https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html](https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html)
2. Subject Alternative Name - https://en.wikipedia.org/wiki/Subject_Alternative_Name
3. AWS::CertificateManager::Certificate DomainValidationOption - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-certificatemanager-certificate-domainvalidationoption.html
