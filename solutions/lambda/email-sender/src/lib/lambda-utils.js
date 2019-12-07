'use strict';
/**
 * This module contains a collection of helper functions to work inside
 * an AWS Lambda Function
 */
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const HttpMethod = {
    GET: 'GET',
    POST: 'POST'
}

const HttpStatus = {
    OK: 200,
    ARGUMENT_ERROR: 400,
    NOT_FOUND: 404,
    ERROR: 500
}

/**
 * Read file from the lambda function package or from the S3 bucket
 * @param {string} fileName 
 */
const readFileSync = (fileName, bucketName=null) => {
    console.log(`Reading file: ${fileName}`);
    if (fileName.startsWith('s3://')) {
        //TODO: add an ability load file from the S3 bucket
        throw new Error('Reading a file from the S3 is not implemented.');
    } else {
        const fullPath = path.join(__dirname, '..', fileName);
        const rawData = fs.readFileSync(fullPath) || '';
        console.log(`Readed data length = ${rawData.length}`);
        return rawData;
    }
}

/**
 * Deserialize an object from the json file from the lambda function package or from the S3 bucket
 * @param {string} fileName 
 */
const readJsonFileSync = (fileName) => {
    return JSON.parse(readFileSync(fileName) || '{}');
}

/**
 * Wrapper under the lambda handler event and context.
 * Return a request object:
 * {
 *   'event': lambda.event object,
 *   'context': lambda.context object,
 *   'sourceIp': client ip address,
 *   'params': request body parameters
 *   'isApiGatewayRequest': shown if we are calling lambda function from the API gateway
 * }
 * @param {lambda.event} event 
 * @param {lambda.context} context 
 */
const requestWrapper = (event, context) => {
    AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
    console.log(`Raw function event: ${JSON.stringify(event)}`);
    const isApiGatewayRequest = !!event.httpMethod;     // Direct lambda call or API Gateway call
    let reqPathParams = event.pathParameters;
    let reqQueryStringParams = event.queryStringParameters;
    let reqBodyParams = null;
    if (isApiGatewayRequest && event.body) {
        reqBodyParams = JSON.parse(event.body);
    } else {
        reqBodyParams = event;
    }
    console.log(`Parameters=${JSON.stringify(reqBodyParams)}`);
    console.log(`QueryStringParams=${JSON.stringify(reqQueryStringParams)}`);
    console.log(`PathParams=${JSON.stringify(reqBodyParams)}`);
    return {
        event: event,
        context: context,
        isApiGatewayRequest: isApiGatewayRequest,
        sourceIp: event.requestContext && event.requestContext.identity ? event.requestContext.identity.sourceIp : 'localhost',
        userAgent: event.requestContext && event.requestContext.identity ? event.requestContext.identity.userAgent : '',
        params: reqBodyParams || {},
        queryStringParams: reqQueryStringParams || {},
        pathParams: reqPathParams || {},
    }
}

/**
 * Return a default object for API json response
 * @param {string} contentType 
 */
const buildLambdaResponse = (statusCode=HttpStatus.OK, body='', contentType='application/json') => {
    return {
        'statusCode': HttpStatus.OK,
        'body': body || (statusCode === HttpStatus.OK ? 'Success' : 'Error'),
        'headers': {'Access-Control-Allow-Origin':'*', 'Content-Type': contentType}
    }
};

module.exports = {
    readFileSync,
    readJsonFileSync,
    requestWrapper,
    HttpStatus,
    buildLambdaResponse
}