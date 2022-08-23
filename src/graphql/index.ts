import { importLeague } from './leagues';
import { getPlayers } from './players';
import { getTeam } from './teams';

type AppSyncEvent = {
  info: {
    fieldName: string
  },
  arguments: {
    leagueCode?: string;
    teamName?: string;
  }
}

exports.handler = async (event: AppSyncEvent) => {
  const { leagueCode, teamName } = event.arguments;

  switch (event.info.fieldName) {
    case "players":
      return await getPlayers(leagueCode!);
    case "team": 
      return await getTeam(teamName!);
    case "importLeague": 
      return await importLeague(leagueCode!);
    default:
      return null;
  }
}