import * as invariant from 'invariant';
import { ContentBlock } from '../immutable/content-block';
import { DraftRange } from './draft-range';

/**
 * Obtain the start and end positions of the range that has the
 * specified entity applied to it.
 *
 * Entity keys are applied only to contiguous stretches of text, so this
 * method searches for the first instance of the entity key and returns
 * the subsequent range.
 */
export function getRangesForDraftEntity(
  block: ContentBlock,
  key: string,
): Array<DraftRange> {
  var ranges = [];
  block.findEntityRanges(
    c => c.getEntity() === key,
    (start, end) => {
      ranges.push({start, end});
    },
  );

  invariant(
    !!ranges.length,
    'Entity key not found in this range.',
  );

  return ranges;
}
