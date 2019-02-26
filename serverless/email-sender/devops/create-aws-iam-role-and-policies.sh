#!/bin/bash
#==============================================================================
# The script is using to create all policies and a role for EmailSender lambda function
#==============================================================================
roleName=LambdaSendEmailRole
policyLogs=AWSLambdaBasicExecutionRole;                 # predefined in AWS
policyLambda=AWSLambdaRole;                             # predefined in AWS
policySendEmail=AWSSESSendOnlyAccess
tmpAwsSrcFile=/tmp/aws-${roleName}-src.json
tmpAwsResFile=/tmp/aws-${roleName}-res.json

##------------ CREATE POLICY: SEND EMAIL USING SES ----------------------------
echo -e '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}' > "${tmpAwsSrcFile}"
echo "Creating '${policySendEmail}' policy..."
aws iam create-policy --policy-name "${policySendEmail}" --policy-document file://"${tmpAwsSrcFile}" > "${tmpAwsResFile}" \
&& echo "Success create ${policySendEmail}"

##------------ CREATE ROLE POLICIES ARNs ----------------------------------------------
echo -e '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}' > "${tmpAwsSrcFile}"

aws iam delete-role --role-name "${roleName}" 2>/dev/null || true
echo "Create role '${roleName}' from the file ${roleName}"
aws iam create-role --role-name "${roleName}" --assume-role-policy-document file://${tmpAwsSrcFile} \
&& echo "Success create '${roleName}' role"

##------------ GET POLICIES ARNs ----------------------------------------------
aws iam list-policies > "${tmpAwsSrcFile}"
arnPolicyLogs=$(jq -r '.Policies[] | select(.PolicyName=="'${policyLogs}'") | .Arn' "${tmpAwsSrcFile}")
arnPolicyLambda=$(jq -r '.Policies[] | select(.PolicyName=="'${policyLambda}'") | .Arn' "${tmpAwsSrcFile}")
arnPolicySendEmail=$(jq -r '.Policies[] | select(.PolicyName=="'${policySendEmail}'") | .Arn' "${tmpAwsSrcFile}")

aws iam attach-role-policy --role-name "${roleName}" --policy-arn ${arnPolicyLogs}
aws iam attach-role-policy --role-name "${roleName}" --policy-arn ${arnPolicyLambda}
aws iam attach-role-policy --role-name "${roleName}" --policy-arn ${arnPolicySendEmail}

echo "------------ RESULT ----------------------------------------------------"
aws iam get-role --role-name "${roleName}"
aws iam list-attached-role-policies --role-name ${roleName}