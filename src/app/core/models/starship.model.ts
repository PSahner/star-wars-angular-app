/**
 * Interface representing a Star Wars starship from SWAPI
 * Based on SWAPI schema: https://swapi.info/api/starships
 */
export interface Starship {
  /** The name of this starship */
  name: string;

  /** The model or official name of this starship */
  model: string;

  /** The manufacturer of this starship */
  manufacturer: string;

  /** The cost of this starship new, in galactic credits */
  cost_in_credits: string;

  /** The length of this starship in meters */
  length: string;

  /** The maximum speed of this starship in atmosphere. "n/a" if not capable of atmospheric flight */
  max_atmosphering_speed: string;

  /** The number of personnel needed to run or pilot this starship */
  crew: string;

  /** The number of non-essential people this starship can transport */
  passengers: string;

  /** The maximum number of kilograms that this starship can transport */
  cargo_capacity: string;

  /** The maximum length of time that this starship can provide consumables for its crew without resupply */
  consumables: string;

  /** The class of this starship's hyperdrive */
  hyperdrive_rating: string;

  /** The Maximum number of Megalights this starship can travel in a standard hour */
  MGLT: string;

  /** The class of this starship (e.g. Starfighter, Deep Space Mobile Battlestation) */
  starship_class: string;

  /** An array of people resource URLs that this starship has been piloted by */
  pilots: string[];

  /** An array of film resource URLs that this starship has appeared in */
  films: string[];

  /** The ISO 8601 date format of the time that this resource was created */
  created: string;

  /** The ISO 8601 date format of the time that this resource was edited */
  edited: string;

  /** The hypermedia URL of this resource */
  url: string;
}

/**
 * Helper interface for starship with resolved ID
 */
export interface StarshipWithId extends Starship {
  id: number;
}
