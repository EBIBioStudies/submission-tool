export namespace ROR {
  export type OrganisationStat = { id: string, title: string, count: number };
  export type InstanceEdit = { date: TDateISODate, schema_version: string }
  export type Localization = {
    continent_code: string
    continent_name: string
    country_code: string
    country_name: string
    country_subdivision_code: string
    country_subdivision_name: string
    lat: number
    lng: number
    name: string
  }

  export interface Organisation {
    admin: { created: InstanceEdit, last_modified: InstanceEdit },
    domains: string[],
    established: number,
    id: string,
    links: { type: string, value: string }[],
    names: { lang: string, value: string, types: string[] }[],
    relationships: { label: string, id: string, type: string }[],
    locations: {
      geonames_id: number,
      geonames_details: Localization
    }[],
    status: 'active' | string,
    types: string[],
    external_ids: { all: string[], preferred: string, type: string }[]
  }

  export interface Organisations {
    items: Organisation[],
    meta: {
      continents: OrganisationStat[],
      countries: OrganisationStat[],
      statuses: OrganisationStat[],
      types: OrganisationStat[],
    }
    numberOfResults: number,
    timeTaken: number
  }

}
