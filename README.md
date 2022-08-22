# Santex Code Challenge
Welcome to my Code Challenge for Santex. I've built this using AWS CDK, AppSync, DynamoDB and TS. I recommend using yarn for running the project because is faster.

## Setup
Rename the `.env.example` file to `.env` and update the values with your desired settings. Keep in mind that a key for the Football Data API is required.

## Deploy
To deploy, use following steps:

- `yarn run build` to build TS
- `cdk bootstrap` to deploy bucket and other services required by CDK
-  `cdk deploy` to deploy