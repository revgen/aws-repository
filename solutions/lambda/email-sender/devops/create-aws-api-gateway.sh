#!/bin/sh
#==============================================================================
# The script is using to create all policies and a role for EmailSender lambda function
#==============================================================================
findApiGateway() {
    aws apigateway get-rest-apis | jq -r '.items[] | select(.name=="'${1}'") | .id' | head -n 1
}
gatewayName=EmailSenderApi
gatewayDescr="Api to send emails using AWS Lambda function and AWS SES"

tmpAwsSrcFile=/tmp/aws-${gatewayName}-src.json
tmpAwsResFile=/tmp/aws-${gatewayName}-res.json

if [ -n "$(findApiGateway "${gatewayName}")" ]; then
    echo "The Api Gateway '${gatewayName}' exists. Skip creation."
else
    echo "Creating '${gatewayName}' api gateway..."
    #aws apigateway create-rest-api --name "${gatewayName}" --description "${gatewayDescr}" \
    aws apigateway import-rest-api --body "file://$(dirname "$0")/email-sender-api-gateway.json"
    && echo "Success create ${gatewayName}"
fi
gatewayId=$(findApiGateway "${gatewayName}")
echo "API Gateway 'gatewayName' "


