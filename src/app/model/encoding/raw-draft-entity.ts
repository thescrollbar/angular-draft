import { DraftEntityMutability } from '../entity/draft-entity-mutability';
import { DraftEntityType } from '../entity/draft-entity-type';

/**
 * A plain object representation of an EntityInstance.
 */
export type RawDraftEntity = {
  type: DraftEntityType,
  mutability: DraftEntityMutability,
  data: {[key: string]: any},
};
