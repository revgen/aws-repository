'use strict';
const AWS = require('aws-sdk');
const configHelper = require('./config.js');
const lambdaUtils = require('./lib/lambda-utils');
const recaptcha = require('./lib/recaptcha');


const CONFIG_FILE = 'email-sender.conf';

const assertValid = (config) => {
    if (!config.sender || !config.recepient) {
        throw new Error(`Fields 'recepient' and 'sender' are required in config.`);
    }
    if (config.recaptcha) {
        if (!config.recaptcha.serverKey || !config.recaptcha.clientKey) {
            throw new Error(`Field 'clientKey' and 'serverKey' are required for recaptcha.`);
        }
    }
}

exports.handler = async function(event, context, callback) {
    const request = lambdaUtils.requestWrapper(event, context);
    try {
        const apiKey = request.params.apiKey || request.queryStringParams.apiKey;
        if (!apiKey) {
            throw new Error(`Value 'apiKey' is required.`);
        }
        const config = configHelper.readAppConfig(CONFIG_FILE, apiKey);
        if ( request.queryStringParams.debug ) {
            // TODO: add an ability to get DEBUG page from the GET request to the Lambda

            // console.log(`Load test page '${config.debug.page}`);
            // let debugPage = lambdaUtils.readFileSync(config.debug.page);
            // if (config.recaptcha) {
            //     debugPage = debugPage.replace(/RECAPTCHA_CLIENT_KEY/g, config.recaptcha.client_key);
            // }
            // // context.succeed(debugPage);
        } else {
            console.info(`Send Email [AppId=${apiKey}]: Sender=${config.sender}, Recipients=${config.recepient}, HttpRequest=${request.isApiGatewayRequest},`);
            assertValid(config);
            if (config.recaptcha) {
                const recaptchaCheckerData = await recaptcha.check(config.recaptcha.serverKey, request.sourceIp, request.params.recaptchaResponse);
                if (!recaptchaCheckerData.success) {
                    console.error('Recaptcha error');
                    throw new Error(`Internal server error`);
                }
            } else {
                console.warn(`WARNING: reCaptcha disabled for the '${apiKey}'.`);
            }
            console.log(`The client ${config.clientIp} is valid.`);
            //TODO: we can add email templates in a future
            const mailParameters = {
                Destination: {ToAddresses: config.recepient},
                Source: config.sender,
                Message: {
                    Subject: {Charset: 'UTF-8', Data: request.params.subject || 'Message from AWS lambda function'},
                    Body: { Text: {Charset: 'UTF-8', Data: request.params.body || ''} }
                }
            };
            const sesResponse = await (new AWS.SES({apiVersion: '2010-12-01'})).sendEmail(mailParameters).promise();
            console.info(`Send Email - success. AWS SES response ID: ${sesResponse.MessageId}`);
            callback(null, lambdaUtils.buildLambdaResponse(lambdaUtils.HttpStatus.OK));
        }
    } catch (err) {
        console.error(err, err.stack);
        let errorResponse = null;
        if (err instanceof SyntaxError) {
            errorResponse = lambdaUtils.buildLambdaResponse(lambdaUtils.HttpStatus.ARGUMENT_ERROR)
        } else {
            errorResponse = lambdaUtils.buildLambdaResponse(lambdaUtils.HttpStatus.ERROR, 'Internal Server Error')
        }
        // return exception when we call Lambda function directly
        if (!request.isApiGatewayRequest) {
            callback(new Error(errorResponse.body));
            return;
        }
        callback(null, errorResponse);
    }
}
