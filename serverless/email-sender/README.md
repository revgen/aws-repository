# EmailSender AWS serverless solution

The repository contains settings to create a serverless solution to send an notification using AWS infrastructure.


## Add an email address to [AWS SES](https://aws.amazon.com/ses/)

To create an email address in the AWS SES:
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
    * (your domain name)
    * amazon.com
    * amazonws.com
    * localhost (for the development purpose ONLY)

## Build and deploy lambda function to AWS

```bash
npm run deploy
```

## Add API Lambda Gateway

* Open AWS console: https://console.aws.amazon.com/apigateway
* Create new API with a name 'EmailSenderApi'
* Add a new method POST at the root of the API
    - Intergation Type: Lambda Function
    - Use Lambda Proxy Intergation: check
    - Lambda Region: (default)
    - Lambda Function: EmailSender
    - Use Default Timeout: check
    - **Save**
* Agree to Add permission to Lambda Function
* 'Enable CORS' from the 'Action' popup menu
* Create a new API deployment
    - 'Deploy API' from the 'Action' popup menu
    - 'New Stage'
    - Name = 'notification'
    - **Deploy**
* Copy the Invoke URL, you can use it to send a notification


## Testing

* Update 'g-recaptcha' data-sitekey value to your reCaptchaSiteKey.
* Start simple http server inside your src directory, example with python:
```
python3 -m http.server 8080
```
* Open [email-sender-test-page.html](http://localhost:8080/email-sender-test-page.html) in your browser
* Fill all field properly and test the EmailSender Lambda

Note: you can disable recaptcha for the specific apiKey, just update a 'email-sender.conf' file and set '"recaptcha": null".

## Useful links

* [Amazon Simple Email Service](https://aws.amazon.com/ses/)
* [Create Dynamic Contact Forms for AWS S3 using AWS SES](https://aws.amazon.com/blogs/architecture/create-dynamic-contact-forms-for-s3-static-websites-using-aws-lambda-amazon-api-gateway-and-amazon-ses/)
* [Build an API Gateway API with Lambda Integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started-with-lambda-integration.html)
