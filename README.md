# Santex Code Challenge
Welcome to my Code Challenge for Santex. I've built this using AWS CDK, AppSync, DynamoDB and TS. I recommend using yarn for running the project because is faster.

### Requirements
You need the following pre requirements:

- NodeJS
- yarn (`npm install -g yarn` - you can use npm if you prefer)
- AWS CLI

### Setup
Rename the `.env.example` file to `.env` and update the values with your desired settings. Keep in mind that a key for the Football Data API is required.

## Deploy
To deploy, use following steps:

- `yarn run build` to build TS
- `cdk bootstrap` to deploy CDK dependencies
- `yarn run deploy` to deploy

You should see something like this in your terminal:

```bash
Outputs:
SantexStack.GraphQLAPIKey = ******
SantexStack.GraphQLAPIURL = https://hxf2ycqgkbf5vli6ufgk5dx63q.appsync-api.us-east-1.amazonaws.com/graphql
SantexStack.StackRegion = us-east-1
```

Use that API Key to test the GraphQL API.

## Test it out
You can go into the AWS AppSync console to run some queries more easily (**see examples below**), or you can use any other tool you are familiar with, maybe curl?.

![Players Query](https://raw.githubusercontent.com/aeberdinelli/santex/master/showcase/Screen%20Shot%202022-08-23%20at%2002.25.12.png)
![Team Query](https://raw.githubusercontent.com/aeberdinelli/santex/master/showcase/Screen%20Shot%202022-08-23%20at%2002.24.41.png)
