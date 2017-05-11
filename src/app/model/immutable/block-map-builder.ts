import { OrderedMap } from 'immutable';
import { BlockMap } from './block-map';
import { ContentBlock } from './content-block';

export const BlockMapBuilder = {
  createFromArray: function(
    blocks: Array<ContentBlock>,
  ): BlockMap {
    return OrderedMap<string, ContentBlock>(
      blocks.map(
        block => [block.getKey(), block],
      ),
    );
  },
};
