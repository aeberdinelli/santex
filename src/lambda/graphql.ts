import { importLeague } from './leagues';
import { getPlayers } from './players';

type AppSyncEvent = {
  info: {
    fieldName: string
  },
  arguments: {
    leagueCode: string,
  }
}

exports.handler = async (event: AppSyncEvent) => {
  const { leagueCode } = event.arguments;

  switch (event.info.fieldName) {
    case "players":
      return await getPlayers(leagueCode);
    //case "importLeague": 
      //return await importLeague(leagueCode);
    default:
      return null;
  }
}