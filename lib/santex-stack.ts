import { Stack, StackProps, Construct, Expiration, Duration, CfnOutput, RemovalPolicy } from '@aws-cdk/core';
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
      handler: 'graphql/index.handler',
      code: lambda.Code.fromAsset('src'),
      memorySize: 1024
    });
    
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', graphqlLambda);

    // Resolvers
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "players"
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "team"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "importLeague"
    });

    // Tables
    const playersTable = new dynamodb.Table(this, 'CDKPlayersTable', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'league',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
    });

    playersTable.addGlobalSecondaryIndex({
      indexName: 'teamIndex',
      partitionKey: {
        name: 'team',
        type: dynamodb.AttributeType.STRING
      }
    });

    const teamsTable = new dynamodb.Table(this, 'CDKTeamsTable', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'name',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      }
    });

    const competitionsTable = new dynamodb.Table(this, 'CDKCompetitionsTable', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Grant access    
    [ playersTable, teamsTable, competitionsTable ].forEach(table => {
      table.grantFullAccess(graphqlLambda);
      table.grant(graphqlLambda, 'dynamodb:BatchWriteItem');
    });

    // Add some env vars
    graphqlLambda.addEnvironment('API_KEY', process.env.API_KEY!);
    graphqlLambda.addEnvironment('API_URL', process.env.API_URL!);
    graphqlLambda.addEnvironment('REQUESTS_LIMIT', process.env.REQUESTS_LIMIT!);
    graphqlLambda.addEnvironment('TEAMS_TABLE', teamsTable.tableName);
    graphqlLambda.addEnvironment('PLAYERS_TABLE', playersTable.tableName);
    graphqlLambda.addEnvironment('COMPETITIONS_TABLE', competitionsTable.tableName);
  }
}
