#!/bin/sh
# Load configurationvalues into th system environment
source ~/.config/dev/aws/ses/$(basename "${0}").conf
python send-email-using-aws-sec.py "Sample notification at $(date)" "Test body"

