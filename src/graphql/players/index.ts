import * as AWS from 'aws-sdk';
import { Player } from "../types/player";

export async function getPlayers(leagueCode: string): Promise<Player[]> {
  const db = new AWS.DynamoDB.DocumentClient();

  const { Items } = await db.query({
    TableName: process.env.PLAYERS_TABLE!,
    KeyConditionExpression: 'league = :league',
    ExpressionAttributeValues: {
      ':league': leagueCode
    }
  }).promise();

  return Items as Player[];
}