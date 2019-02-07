import os
import boto3
# ----------------------------------------------------------------------------
# AWS Lambda function to start and stop EC2 instances.
#   Runtime: Python3.6
#   Handler: lambda_function.start_ec2_instance
#            or lambda_function.stop_ec2_instance
#   Environment variables:
#       * project_name       - project name
#       * ec2_instance_id    - comma separated string with a list of instance_ids
#       * smtp_username      - username to use AWS SES for notification
#       * smtp_password      - password to use AWS SES for notification
#       * notification_email - email address for notification
#   Basic settings:
#       * Memory: 128MB
#       * Timeout: 3sec
#   Execution role:
#       Role must has a full access to EC2 (??? AmazonEC2FullAccess)
# ----------------------------------------------------------------------------
PROJECT_NAME = os.environ['project_name']
import os, smtplib, sys
def send_notification(subject, body=''):
    smtp_user = os.environ.get('smtp_username')
    smtp_pass = os.environ.get('smtp_password')
    email = os.environ.get('notification_email')
    if not smtp_user or not email:
        print('Please specify system environment: smtp_username, smtp_password, email')
        return
    subject = '[' + PROJECT_NAME + '] Lambda: ' + (subject or '')
    debug = (os.environ.get('DEBUG') or '').lower() == 'true'
    smtp_server = os.environ.get('SMTP_SERVER') or 'email-smtp.us-east-1.amazonaws.com'
    msg = ("From: AWS Notification<{0}>\nTo: {1}\nSubject: {2}\n\n{3}\n"
           .format(email, email, subject, body))
    print('Send email to {0}: {1} (length {2})'.format(email, subject, len(msg)))
    server = smtplib.SMTP(host=smtp_server, port=587, timeout=10)
    server.set_debuglevel(10 if debug else 1)
    server.starttls()
    server.ehlo()
    server.login(smtp_user, smtp_pass)
    server.sendmail(email, email, msg)
    if debug: print(server.quit())

# ----------------------------------------------------------------------------
EC2 = boto3.resource('ec2')
if not os.environ['ec2_instance_id']:
    raise Exception('Required environment variable: ec2_instance_id')
INSTANCE_IDS = (os.environ['ec2_instance_id'] or '').split(',')

def _get_instance_names(instance):
    names = []
    for tag in instance.tags:
        if tag['Key'] == 'Name' and tag['Value']:
            names.append(tag['Value'])
    return names if names else ['ec2-' + instance.id]

def _update_ec2_status(instance_ids, status):
    if status not in ['start', 'stop']:
        raise ValueError('Incorrect status value, should be "start" or "stop".')
    try:
        msg = []
        for id in INSTANCE_IDS:
            
            instance_id = id.strip()
            print('[{}] EC2 instance - (status={})...'.format(instance_id, status))
            instance = EC2.Instance(instance_id)
            instance_name = _get_instance_names(instance)[0]
            cur_state = (instance.state['Name'] or '').lower()
            msg.append(('[{}] EC2 instance "{}" is in the "{}" status.'
                                .format(instance_id, instance_name, cur_state)))
            if status == 'start':
                if cur_state == 'running':
                    msg.append('[{}] EC2 instance - skip'.format(instance_id))
                else:
                    instance.start()
                    msg.append('[{}] EC2 instance - started'.format(instance_id))
            elif status == "stop":
                if cur_state == 'stopped':
                    msg.append('[{}] EC2 instance - skip'.format(instance_id))
                else:
                    instance.stop()
                    msg.append('[{}] EC2 instance - stopped'.format(instance_id))
                
        for m in msg:
            print(m)
        send_notification(('Change EC2 Instance [{}] status to {} - success'
                           .format(instance_id, status)),
                          '\n'.join(msg))
    except Exception as ex:
        print('Change EC2 Instance [{}] status to {} - error: {}', instance_ids, ex)
        send_notification('Start EC2 Instance Error', repr(ex))
        raise ex


def start_ec2_instance(event, context):
    _update_ec2_status(INSTANCE_IDS, "start")

def stop_ec2_instance(event, context):
    _update_ec2_status(INSTANCE_IDS, "stop")


