#!/bin/sh
#==============================================================================
# Create AWS lambda from a zip package file inside the dist directory.
# The package name will be obtained from the package.json file.
#==============================================================================
cd $(dirname "${0}")/..
wd=${PWD}
name=$(jq -r '.name' package.json)
lambdaRole=LambdaSendEmailRole
package=dist/${name}.zip

roleArn=$(aws iam get-role --role-name ${lambdaRole} | jq -r ".Role.Arn")

echo "Create ${name} lambda function"
echo "Source package: ${package}"
echo "Lambda role   : ${roleArn}"

# aws lambda delete-function --function-name "${name}" 2>/dev/null && echo "Previous function was removed"
aws lambda get-function --function-name "${name}" > /dev/null
if [ $? -ne 0 ]; then
    echo "Creating a new ${name} function..."
    aws lambda create-function --function-name "${name}" \
    --zip-file "fileb://${package}" --handler index.handler --runtime nodejs8.10 \
    --role ${roleArn} && echo "Success"
else
    echo "Unpdating source code for ${name} function..."
    aws lambda update-function-code --function-name "${name}" \
    --zip-file "fileb://${package}" && echo "Success"
fi

echo "------------ RESULT ----------------------------------------------------"
aws lambda get-function --function-name "${name}"