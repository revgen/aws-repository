#!/usr/bin/python
##############################################################################
import environ
import smtplib
import sys


def send_notification(smtp_user, smtp_pass, email, subject, body, debug=False):
    smtp_server = os.environ.get('SMTP_SERVER') \
        or 'email-smtp.us-east-1.amazonaws.com'
    msg = ("From: AWS Notification<{0}>\nTo: {1}\nSubject: {2}\n\n{3}\n"
           .format(email, email, subject, body))
    print('Send email to {0}: {1} (length {2})'
          .format(email, subject, len(msg)))
    server = smtplib.SMTP(host=smtp_server, port=587, timeout=10)
    server.set_debuglevel(10 if debug else 1)
    server.starttls()
    server.ehlo()
    server.login(smtp_user, smtp_pass)
    server.sendmail(email, email, msg)
    if debug: print server.quit()
    print('Send email to {0} - success'.format(email))


if __name__ == '__main__':
    send_notification(os.environ['SMTP_USERNAME'],
                      os.environ['SMTP_PASSWORD'],
                      os.environ['EMAIL'],
                      sys.argv[1],
                      sys.argv[2],
                      (os.environ.get('DEBUG') or '').lower() == 'true')

