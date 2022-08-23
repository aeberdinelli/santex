import * as AWS from 'aws-sdk';
import { Team } from "../types/team";

export async function getTeam(teamName: string): Promise<Team> {
  const db = new AWS.DynamoDB.DocumentClient();

  const { Items: teams } = await db.query({
    TableName: process.env.TEAMS_TABLE!,
    KeyConditionExpression: '#name = :team',
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ':team': teamName
    }
  }).promise();

  if (!teams || teams.length === 0) {
    throw new Error('Team not found');
  }

  const [ team ] = teams as Team[];

  // Find players for the team
  const { Items: players } = await db.query({
    TableName: process.env.PLAYERS_TABLE!,
    KeyConditionExpression: 'league = :league',
    FilterExpression: 'team = :team',
    ExpressionAttributeValues: {
      ':league': team.league,
      ':team': team.name
    }
  }).promise();

  return { ...team, players } as Team;
}