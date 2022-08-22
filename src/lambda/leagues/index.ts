import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { CompetitionResponse } from '../../types/competition';
import { Team, TeamResponse, TeamsResponse } from '../../types/team';
import { request } from '../../util/request';

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

  teamResponse[0].squad.forEach(player => {
    playersToPut.push({
      PutRequest: {
        Item: {
          name: player.name,
          position: player.position,
          dateOfBirth: player.dateOfBirth,
          countryOfBirth: player.nationality,
          nationality: player.nationality,
          league: leagueCode,
          id: uuid()
        }
      }
    })
  })

  await dynamodb.batchWrite({
    RequestItems: {
      [process.env.COMPETITIONS_TABLE!]: [
        {
          PutRequest: {
            Item: {
              name: competitionResponse.name,
              code: competitionResponse.code,
              areaName: competitionResponse.area.name,
              league: leagueCode,
              id: uuid()
            }
          }
        }
      ],
      [process.env.TEAMS_TABLE!]: teamsToPut,
      [process.env.PLAYERS_TABLE!]: playersToPut
    }
  }).promise();

  return teamsToPut.map(batchRequest => batchRequest.PutRequest.Item) as Team[];
}