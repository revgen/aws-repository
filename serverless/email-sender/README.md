# EmailSender AWS serverless service

The repository contains settings for creating a serverless solution to send an notification using AWS infrastructure.


## Add an email address to [AWS SES](https://aws.amazon.com/ses/)

To create an email addres in the AWS SES:
* You can use [AWS Console](https://console.aws.amazon.com/ses/home#verified-senders-email:)
    - Open: AWS Console
    - Open: Simple Email Service (SES)
    - Open: Email Addresses
    - Press: Verify a New Email address

or

* You can use [AWS command line tool](https://aws.amazon.com/cli/)
```bash
aws ses verify-email-identity --email-address john.smith@test.com
```
When the email address will be added you will receive a confirmation email.

## Setup reCAPTCHA

1. Create API keys: https://www.google.com/recaptcha
2. Use an instruction from the Step #1 to setup client side code
3. Use an instruction form the Step #2 to setup AWS Lambda side
4. Don't forget add items to the domains list:
    * <your domain name>
    * amazon.com
    * amazonws.com

## Create AWS infrastructure for EmailSender

To create EmailSender lambda function and all related resources you can use a CloudFormation script [email-sender-lambda.yml](./email-sender-lambda.yml).
```bash
aws cloudformation create-stack --stack-name "EmailSenderStack" \
        --capabilities CAPABILITY_IAM \
        --template-body "./email-sender-lambda.yml" \
        --parameters \
            ParameterKey=Recipient,ParameterValue="<Recepient email adddress>" \
            ParameterKey=Sender,ParameterValue="<Sender email adddress>" \
            ParameterKey=RecaptchaSecretKey,ParameterValue="<Recaptcha Secret Key>" \
            ParameterKey=ApiRootPath,ParameterValue="notification"

```

Additional parameters which you can use:
* ApiRootPath - specify a root api path (Default is 'notification')
* ApiKeys - comma separate unique strings


## Testing

For testiong purpose you can use a stand alone static page [test-send-email-page.html](./test-send-email-page.html).

Open it in your browser, fill all fields and send a test message.


## Useful links

* [Amazon Simple Email Service](https://aws.amazon.com/ses/)
* [Create Dynamic Contact Forms for AWS S3 using AWS SES](https://aws.amazon.com/blogs/architecture/create-dynamic-contact-forms-for-s3-static-websites-using-aws-lambda-amazon-api-gateway-and-amazon-ses/)

