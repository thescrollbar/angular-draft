import { DraftStringKey } from './draft-string-key';
import { ContentBlock } from '../immutable/content-block';
import { EntityRange } from './entity-range';
import { strlen } from '../../utils/strlen';

/**
 * Convert to UTF-8 character counts for storage.
 */
export function encodeEntityRanges(
  block: ContentBlock,
  storageMap: Object,
): Array<EntityRange> {
  var encoded = [];
  block.findEntityRanges(
    character => !!character.getEntity(),
    (/*number*/ start, /*number*/ end) => {
      var text = block.getText();
      var key = block.getEntityAt(start);
      encoded.push({
        offset: strlen(text.slice(0, start)),
        length: strlen(text.slice(start, end)),
        // Encode the key as a number for range storage.
        key: Number(storageMap[DraftStringKey.stringify(key)]),
      });
    },
  );
  return encoded;
}
