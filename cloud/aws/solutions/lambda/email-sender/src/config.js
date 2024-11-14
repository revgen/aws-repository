'use strict';
const lambdaUtils = require('./lib/lambda-utils');

const readAppConfig = (configName='', applicationId) => {
    const configAll = lambdaUtils.readJsonFileSync(configName);
    let config = null;
    console.debug(`Configuration: ${JSON.stringify(configAll)}`)
    if (!applicationId) {
        throw new Error(`Error: 'applicationId' is required`)
    }
    if (configAll && configAll.applications) {
        console.debug(`Searching '${applicationId}' settings...`)
        config = configAll.applications[applicationId];
    }
    if (config && !!config.enabled ) {
        config.fileName = configName;
        console.info(`Found application '${applicationId}': ${JSON.stringify(config)}`);
        return config;
    } else {
        const msg = `Error: Application '${applicationId}' not found or disabled!`;
        console.error(msg);
        throw new Error(msg);
    }
}
module.exports = {
    readAppConfig
};
