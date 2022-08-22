import { Stack, StackProps, Construct, Expiration, Duration, CfnOutput } from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';

export class SantexStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'santex-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365))
          }
        },
      },
    });

    new CfnOutput(this, "GraphQLAPIURL", { value: api.graphqlUrl });
    new CfnOutput(this, "GraphQLAPIKey", { value: api.apiKey || '' });
    new CfnOutput(this, "Stack Region", { value: this.region });

    const graphqlLambda = new lambda.Function(this, 'AppSyncHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'graphql.handler',
      code: lambda.Code.fromAsset('src/lambda'),
      memorySize: 1024
    });
    
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', graphqlLambda);

    // Resolvers
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "players"
    });
    
    //lambdaDs.createResolver({
      //typeName: "Mutation",
      //fieldName: "importLeague"
    //});

    // Tables
    const playersTable = new dynamodb.Table(this, 'CDKPlayersTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'league',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      }
    });

    new dynamodb.Table(this, 'CDKTeamsTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    new dynamodb.Table(this, 'CDKCompetitionsTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Grant access
    playersTable.grantFullAccess(graphqlLambda);
    graphqlLambda.addEnvironment('PLAYERS_TABLE', playersTable.tableName);
  }
}
