/**
 * A plain object representation of an entity attribution.
 *
 * The `key` value corresponds to the key of the entity in the `entityMap` of
 * a `ComposedText` object, not for use with `DraftEntity.get()`.
 */
export type EntityRange = {
  key: number,
  offset: number,
  length: number,
};
