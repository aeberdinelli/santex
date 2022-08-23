import { Player } from "./player";

export type TeamResponse = {
  area: {
    id: number,
    name: string,
    code: string,
    flag: string
  },
  id: number,
  name: string,
  shortName: string,
  tla: string,
  crest: string,
  address: string,
  website: string,
  founded: number,
  clubColors: string,
  venue: string,
  runningCompetitions: [
    {
      id: number,
      name: string,
      code: string,
      type: string,
      emblem: string
    }
  ],
  coach: {
    id: number,
    firstName: string,
    lastName: string,
    name: string,
    dateOfBirth: string,
    nationality: string,
    contract: {
      start: string,
      until: string
    }
  },
  marketValue: number,
  squad: [
    {
      id: number,
      firstName: string,
      lastName: string,
      name: string,
      position: string,
      dateOfBirth: string,
      nationality: string,
      shirtNumber: number,
      marketValue: number,
      contract: {
        start: string,
        until: string
      }
    }
  ]
};
    
export type TeamsResponse = {
  count: number,
  filters: {
    season: string
  },
  competition: {
    id: number,
    name: string,
    code: string,
    type: string,
    emblem: string
  },
  season: {
    id: number,
    startDate: string,
    endDate: string,
    currentMatchday: number,
    winner: any,
    stages: string[]
  },
  teams: [
    {
      area: {
        id: number,
        name: string,
        code: string,
        flag?: string
      },
      id: number,
      name: string,
      shortName: string,
      tla: string,
      crest: string,
      address: string,
      website: string,
      founded: number,
      clubColors: string,
      venue: string,
      runningCompetitions: [
        {
          id: number,
          name: string,
          code: string,
          type: string,
          emblem: string
        }
      ],
      coach?: {
        id?: string|number,
        firstName?: string,
        lastName?: string,
        name?: string,
        dateOfBirth?: string,
        nationality?: string,
        contract?: {
          start?: string,
          until?: string
        }
      },
      marketValue?: number|string,
      squad: [],
      staff: [],
      lastUpdated: string
    },
  ]
}

export type Team = {
  name: string;
  tla: string;
  shortName: string;
  areaName: string;
  players: Player[];
  league: string;
  id: string;
}