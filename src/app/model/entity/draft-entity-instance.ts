import { Record } from 'immutable';
import { DraftEntityType } from './draft-entity-type';
import { DraftEntityMutability } from './draft-entity-mutability';

var DraftEntityInstanceRecord = Record({
  type: 'TOKEN',
  mutability: 'IMMUTABLE',
  data: Object,
});

/**
 * An instance of a document entity, consisting of a `type` and relevant
 * `data`, metadata about the entity.
 *
 * For instance, a "link" entity might provide a URI, and a "mention"
 * entity might provide the mentioned user's ID. These pieces of data
 * may be used when rendering the entity as part of a ContentBlock DOM
 * representation. For a link, the data would be used as an href for
 * the rendered anchor. For a mention, the ID could be used to retrieve
 * a hovercard.
 */
export class DraftEntityInstance extends DraftEntityInstanceRecord {
  getType(): DraftEntityType {
    return this.get('type');
  }

  getMutability(): DraftEntityMutability {
    return this.get('mutability');
  }

  getData(): Object {
    return this.get('data');
  }
}
