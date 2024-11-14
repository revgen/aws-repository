'use strict';
const https = require('https');
const querystring = require('querystring');

/**
 * Validation of a clientside recaptcha data.
 * 
 * @param {*} serversideSecretKey 
 * @param {*} clientIp 
 * @param {*} clientsideRecaptchaData 
 */
const checkRecaptcha = async (serversideSecretKey, clientIp, clientsideRecaptchaData) => {
    const RECAPTCHA_HOST = 'www.google.com';
    const RECAPTCHA_PATH = '/recaptcha/api/siteverify';

    console.info(`Check recaptcha [ClientIp=${clientIp}]: ${clientsideRecaptchaData}`);
    return new Promise((resolve, reject) => {
        console.info(`CheckRecaptcha: RecaptchaResponse = ${clientsideRecaptchaData}`);
        console.info(`CheckRecaptcha: SourceIP = ${clientIp}`);
        const postData = querystring.stringify({
            'secret': serversideSecretKey,
            'response': clientsideRecaptchaData,
            'remoteip': clientIp
        });
        console.debug(`CheckRecaptcha: Data = ${postData}`);

        const requestOptions = {
            host: RECAPTCHA_HOST,
            path: RECAPTCHA_PATH,
            method: 'POST',
            port: 443,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };
        const postRequest = https.request(requestOptions, (res) => {
            console.debug(`Recaptcha Response: Status = ${res.statusCode}`);
            console.debug(`Recaptcha Response: Headers = ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            res.on('data', (body) => {
                console.debug(`Recaptcha Response: Body = ${JSON.stringify(body)}`);
                try {
                    const response = JSON.parse(body);
                    if (response.success) {
                        console.info(`Recaptcha Response: ${JSON.stringify(response)}`);
                        resolve(response);
                    } else {
                        console.error(`Recaptcha Response: Error (1): ${body}`);
                        reject({success: false, message: 'Recaptcha validation failed.'});
                    }
                } catch (err) {
                    console.error(`Recaptcha Response: Error (2): ${body}`);
                    reject({success: false, message: 'Recaptcha validation failed.'});
                }
            });
            res.on('error', (err) => {
                console.error(`Recaptcha Response: Error (3): ${err.message}`);
                reject({success: false, message: 'Recaptcha validation failed.'});
            });
        });
        postRequest.write(postData);
        postRequest.end();
    });
}

module.exports.check = checkRecaptcha;
