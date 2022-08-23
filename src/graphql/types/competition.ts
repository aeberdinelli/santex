export type CompetitionResponse = {
  area: {
    id: number,
    name: string,
    code: string,
    flag: string
  },
  id: number,
  name: string,
  code: string,
  type: string,
  emblem: string,
  currentSeason: {
    id: number,
    startDate: string,
    endDate: string,
    currentMatchday: number,
    winner?: {
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
      lastUpdated: string
    },
    stages: string[]
  }
};