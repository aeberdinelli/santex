import * as AWS from 'aws-sdk';
import { CompetitionResponse } from '../types/competition';
import { Team, TeamResponse, TeamsResponse } from '../types/team';
import { request } from '../util/request';
import { v4 as uuid } from 'uuid';

export async function importLeague(leagueCode: string): Promise<Team[]> {
  if (!leagueCode) {
    throw new Error('League code parameter is required');
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const [ competitionResponse, teamsResponse ] = await Promise.all([
    request<CompetitionResponse>(`/competitions/${leagueCode}`),
    request<TeamsResponse>(`/competitions/${leagueCode}/teams`)
  ]);

  const teamsToPut: any[] = [];
  const playersToPut: any[] = [];

  teamsResponse.teams.forEach(team => {
    teamsToPut.push({
      PutRequest: {
        Item: {
          name: team.name,
          tla: team.tla,
          shortName: team.shortName,
          areaName: team.area.name,
          league: leagueCode,
          id: uuid()
        }
      }
    })
  });

  const teamResponse = await Promise.all(
    teamsResponse.teams.map(team => request<TeamResponse>(`/teams/${team.id}`))
  );

  teamResponse.forEach(team => {
    team.squad.forEach(player => {
      playersToPut.push({
        PutRequest: {
          Item: {
            name: player.name,
            position: player.position,
            dateOfBirth: player.dateOfBirth,
            countryOfBirth: player.nationality,
            nationality: player.nationality,
            league: leagueCode,
            team: team.name,
            id: uuid()
          }
        }
      });
    });
  });

  // Save league
  await dynamodb.put({
    TableName: process.env.COMPETITIONS_TABLE!,
    Item: {
      name: competitionResponse.name,
      code: competitionResponse.code,
      areaName: competitionResponse.area.name,
      league: leagueCode,
      id: uuid()
    }
  }).promise();

  // Save teams
  const batchLimit = 25;

  for (let i = 0; i < teamsToPut.length;i += batchLimit) {
    const chunk = teamsToPut.slice(i, i + batchLimit);

    await dynamodb.batchWrite({
      RequestItems: {
        [process.env.TEAMS_TABLE!]: chunk
      }
    }).promise();
  }

  // Save players in chunks of 25
  for (let i = 0; i < playersToPut.length;i += batchLimit) {
    const chunk = playersToPut.slice(i, i + batchLimit);

    await dynamodb.batchWrite({
      RequestItems: {
        [process.env.PLAYERS_TABLE!]: chunk
      }
    }).promise();
  }

  // @todo: refactor players & teams return to remove complexity
  return teamsToPut.map(batchRequest => {
    return { 
      ...batchRequest.PutRequest.Item,
      players: playersToPut.filter(
        batchItem => batchItem.PutRequest.Item.team === batchRequest.PutRequest.Item.name
      )
    };
  }) as Team[];
}