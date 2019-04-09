<br/>
<p align="center">
  <img src="https://github.com/revgen/aws-repository/blob/master/aws.png?raw=true">
</p>
<br/>

# Amazon Web Services (AWS)

The repository contains various settings, scripts and files related with [Amazon Web Services (AWS)](https://aws.amazon.com/).

## At the beginning...

### Amazon resources

* [AWS Console](https://aws.amazon.com/console)
* [Alexa Developer Console](https://developer.amazon.com/alexa)


### Amazon Console Tool ([AWS CLI](https://aws.amazon.com/cli))

Install on Mac OS
```bash
brew install awscli
```

Install on Ubuntu
```bash
sudo apt-get install awscli
```

Install on Windows

* Using installer: [Download the AWS CLI MSI installer for Windows (64-bit)](https://s3.amazonaws.com/aws-cli/AWSCLI64.msi)
* Using Choco and PowerShell console:
```powershell
choco install -y awscli
$env:Path += ';C:\Program Files\Amazon\AWSCLI'
```

Install using Python PIP
```bash
pip install awscli
```

First configuration
```bash
aws configure
```

## Useful links

* [AWS Quick Starts](https://aws-quickstart.github.io/index.html)
* [AWS Lambda + Serverless Framework](https://github.com/serverless/examples)

