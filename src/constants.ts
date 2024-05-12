// Identifiers of the schemas we use
export const EVENTS_SCHEMA_ID =
  'events_002059d5a03b7fe7b1c9c5c752146e25f354b39d23a31e31dd6a5b3ecb25c28e71ed';
export const PROFILES_SCHEMA_ID =
  'profiles_00200ce1565eb24a1c1c3eadff919d9b8e2376870f93285228eb5e4a0a3a5777029c';
export const REACTIONS_SCHEMA_ID =
  'reactions_0020186d7a7f24f478357be25684c0a9c019a595671762a8cf71b2ca72332b9defc1';
export const COMMENTS_SCHEMA_ID =
  'comments_0020412850392f504a2ed54a780bedf2d7807f067dc7b47fbe14aa37ed9784276503';

// URL of your local aquadoggo node
export const ENDPOINT = process.env.ENDPOINT || 'http://localhost:2020/graphql';

// Time-range of the unconference event
export const MIN_DATE = '2024-05-24';
export const MAX_DATE = '2024-05-26';
