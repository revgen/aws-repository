# Guide to deploy Static Site on AWS S3 Bucket

The repository contains settings and solutions for creating a simple static website using AWS infrastructure.

  - [Introduction](#introduction)
  - [Setup a local development environment](#setup-a-local-development-environment)
  - [Setup AWS S3 buckets to host a static site](#setup-aws-s3-buckets-to-host-a-static-site)
  - [Deploy your static site content to the S3 bucket](#deploy-your-static-site-content-to-the-s3-bucket)
  - [Setup CloudFront and DNS for your static site on S3](#setup-cloudfront-and-dns-for-your-static-site-on-s3)
  - [If you have a problem](#if-you-have-a-problem)
  - [Links](#useful-links)


## Introduction

Today most websites are becoming static websites which means they run zero server side code 
and consist of only HTML, CSS and JavaScript.

When you have only static content on your site you don't need a traditional server.

Static websites are very low cost, easier to support and have no so many problem with security as traditional application sites.

Amazon Web Services (AWS) has an ability to host a static website on Amazon Simple Storage Service (S3).


## Setup a local development environment

1. You should have AWS Developer Account to have an access to the [AWS Console](https://console.aws.amazon.com).
2. You should have [AWS command line tool](https://aws.amazon.com/cli/) in your system
```bash
pip install awscli
```

3. You should have [configured credential files](https://docs.aws.amazon.com/cli/latest/userguide/cli-config-files.html) to use awscli.
```bash
ls ~/.aws/config
ls ~/.aws/credentials
```


## Setup AWS S3 buckets to host a static site

To host your static site on the AWS S3 you need create two S3 buckets. 
First should have a WWW prefix (main bucket), the second shouldn't have a WWW prefix and will redirect to the main bucket.

To create these two S3 buckets and all related resources you can use a CloudFormation script [static-site-s3.yml](./static-site-s3.yml).

Example usage:
```bash
export DOMAIN_NAME=example.com

aws cloudformation create-stack --stack-name "S3-${DOMAIN_NAME}" \
        --capabilities CAPABILITY_IAM \
        --template-body "./static-site-s3.yml" \
        --parameters ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME}
```

The success result of the execution will show you a public url to your new static site hosted on the S3 (http://www.<domain name>.s3-website-<region>amazonws.com).

Example result:
```json
{
  "Stacks": [
    {
      ......
      "Outputs": [
        {
          "OutputKey": "StaticSiteDirectURL",
          "OutputValue": "http://www.example.com.s3-website-us-east-1.amazonaws.com"
        },
        {
          "OutputKey": "StaticSiteDirectHostName",
          "OutputValue": "www.example.com.s3-website-us-east-1.amazonaws.com"
        }
      ],
    }
  ]
}
```

When S3 buckets was created you can try open your static site using a direct link to the S3 bucket: http://www.example.com.s3-website-us-east-1.amazonaws.com

If you don't have a content inside the WWW bucket you should see a 404 http error page. To upload static site content to the S3 bucket see the [next step](#deploy-your-static-site-content-to-the-s3-bucket).


## Deploy your static site content to the S3 bucket

To upload a static site content you can use a command:
```bash
export DOMAIN_NAME=example.com
aws s3 sync --acl public-read --delete --exclude '.*' "<source directory>" s3://www.${DOMAIN_NAME}
```
After this command all directories and files (except hidden, starting with '.', path) from the source directory will be synchronized with the remote S3 bucket.


## Setup CloudFront and DNS for your static site on S3

Before the next step you should have:

1. Domain name registration in your [Route53](https://console.aws.amazon.com/route53/home).
2. Active SSL certificate which you can use with your domain ([AWS Certificate manager](https://console.aws.amazon.com/acm/home)).

To create a CloudFront distribution and a Route53 domain record set you can use a CloudFormation script [static-site-cloudfront.yml](./static-site-cloudfront.yml).

Example usage:
```bash
export DOMAIN_NAME=example.com
export CERTIFICATE_ARN=<your certificate ARN from https://console.aws.amazon.com/acm>

aws cloudformation create-stack --stack-name "CoudFront-${DOMAIN_NAME}" \
        --capabilities CAPABILITY_IAM \
        --template-body "./static-site-cloudfront.yml" \
        --parameters ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME} \
                     ParameterKey=CertificateArn,ParameterValue=${CERTIFICATE_ARN}
```

The success result of the execution will show you a publuc url to your static site, pointed to the CloudFront.

Example result:
```json
{
  "Stacks": [
    {
      ......
      "Outputs": [
          {
            "OutputKey": "WebsiteURL",
            "OutputValue": "https://www.example.com",
            "Description": "The URL of the newly created Static Website"
          },
          {
            "OutputKey": "WebsiteDomainName",
            "OutputValue": "www.example.com"
          }
        ],
    }
  ]
}
```

That's it. Your site was published.


## If you have a problem

If you don't see your site in the browser you can try find a problem step by step.

1. Check the CloudFormation logs for errors
2. Check the S3 buckets: two buckets should exists and WWW bucket shoud contains index.html file
3. Check the public direct url to your static site hosted on the S3 bucket (**OutputValue** after the static-site-s3 script)
4. Check your CloudFront settings for your S3 bucket.
5. Check your Route53 settings fro your domain


## Useful links

* [AWS: Host a Static Website](https://aws.amazon.com/getting-started/projects/host-static-website/)
* [AWS: CloudFormation Template Snippets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/CHAP_TemplateQuickRef.html)
* [Blog: Getting This Site Up and Running](https://cloudformation.ninja/2017/04/14/getting-this-site-up-and-running/)
