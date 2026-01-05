/**
 * Interface representing a Star Wars character/person from SWAPI
 * Based on SWAPI schema: https://swapi.info/api/people
 */
export interface Person {
  /** The name of this person */
  name: string;

  /** The height of the person in centimeters */
  height: string;

  /** The mass of the person in kilograms */
  mass: string;

  /** The hair color of this person. "n/a" if no hair, "unknown" if unknown */
  hair_color: string;

  /** The skin color of this person */
  skin_color: string;

  /** The eye color of this person */
  eye_color: string;

  /** The birth year of the person, using the in-universe standard of BBY or ABY */
  birth_year: string;

  /** The gender of this person (male, female, hermaphrodite, or unknown) */
  gender: string;

  /** The URL of a planet resource, a planet that this person was born on or inhabits */
  homeworld: string;

  /** An array of film resource URLs that this person has been in */
  films: string[];

  /** An array of species resource URLs that this person belongs to */
  species: string[];

  /** An array of vehicle resource URLs that this person has piloted */
  vehicles: string[];

  /** An array of starship resource URLs that this person has piloted */
  starships: string[];

  /** The ISO 8601 date format of the time that this resource was created */
  created: string;

  /** The ISO 8601 date format of the time that this resource was edited */
  edited: string;

  /** The hypermedia URL of this resource */
  url: string;
}

/**
 * Helper interface for person with resolved ID
 */
export interface PersonWithId extends Person {
  id: number;
}
