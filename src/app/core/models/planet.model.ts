/**
 * Interface representing a Star Wars planet from SWAPI
 * Based on SWAPI schema: https://swapi.info/api/planets
 */
export interface Planet {
  /** The name of this planet */
  name: string;

  /** The number of standard hours it takes for this planet to complete a single rotation */
  rotation_period: string;

  /** The number of standard days it takes for this planet to complete a single orbit */
  orbital_period: string;

  /** The diameter of this planet in kilometers */
  diameter: string;

  /** The climate of this planet (e.g. arid, temperate, tropical) */
  climate: string;

  /** A number denoting the gravity of this planet (1 = normal gravity, 0.5 = half gravity) */
  gravity: string;

  /** The terrain of this planet (e.g. desert, grasslands, mountains) */
  terrain: string;

  /** The percentage of the planet surface that is naturally occurring water or bodies of water */
  surface_water: string;

  /** The average population of sentient beings inhabiting this planet */
  population: string;

  /** An array of people resource URLs that live on this planet */
  residents: string[];

  /** An array of film resource URLs that this planet has appeared in */
  films: string[];

  /** The ISO 8601 date format of the time that this resource was created */
  created: string;

  /** The ISO 8601 date format of the time that this resource was edited */
  edited: string;

  /** The hypermedia URL of this resource */
  url: string;
}

/**
 * Helper interface for planet with resolved ID
 */
export interface PlanetWithId extends Planet {
  id: number;
}
