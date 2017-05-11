import { List } from 'immutable';
import * as invariant from 'invariant';
import { CharacterMetadata } from '../immutable/character-metadata';
import { findRangesImmutable } from '../immutable/find-ranges-immutable';
import { ContentBlock } from '../immutable/content-block';
import { EntityMap } from '../immutable/entity-map';
import { ContentState } from '../immutable/content-state';
import { SelectionState } from '../immutable/selection-state';

export function removeEntitiesAtEdges(
  contentState: ContentState,
  selectionState: SelectionState,
): ContentState {

  var blockMap = contentState.getBlockMap();
  var entityMap = contentState.getEntityMap();

  var updatedBlocks = {};

  var startKey = selectionState.getStartKey();

  var startOffset = selectionState.getStartOffset();
  var startBlock = blockMap.get(startKey);
  var updatedStart = removeForBlock(entityMap, startBlock, startOffset);

  if (updatedStart !== startBlock) {
    updatedBlocks[startKey] = updatedStart;
  }

  var endKey = selectionState.getEndKey();
  var endOffset = selectionState.getEndOffset();
  var endBlock = blockMap.get(endKey);
  if (startKey === endKey) {
    endBlock = updatedStart;
  }

  var updatedEnd = removeForBlock(entityMap, endBlock, endOffset);

  if (updatedEnd !== endBlock) {
    updatedBlocks[endKey] = updatedEnd;
  }

  if (!Object.keys(updatedBlocks).length) {
    return contentState.set('selectionAfter', selectionState) as ContentState;
  }

  return contentState.merge({
    blockMap: blockMap.merge(updatedBlocks),
    selectionAfter: selectionState,
  }) as ContentState;
}

function getRemovalRange(
  characters: List<CharacterMetadata>,
  key: string,
  offset: number,
): Object {
  var removalRange;
  findRangesImmutable(
    characters,
    (a, b) => a.getEntity() === b.getEntity(),
    element => element.getEntity() === key,
    (start, end) => {
      if (start <= offset && end >= offset) {
        removalRange = {start, end};
      }
    },
  );
  invariant(
    typeof removalRange === 'object',
    'Removal range must exist within character list.',
  );
  return removalRange;
}

function removeForBlock(
  entityMap: EntityMap,
  block: ContentBlock,
  offset: number,
): ContentBlock {
  var chars = block.getCharacterList();
  var charBefore = offset > 0 ? chars.get(offset - 1) : undefined;
  var charAfter = offset < chars.count() ? chars.get(offset) : undefined;
  var entityBeforeCursor = charBefore ? charBefore.getEntity() : undefined;
  var entityAfterCursor = charAfter ? charAfter.getEntity() : undefined;

  if (entityAfterCursor && entityAfterCursor === entityBeforeCursor) {
    var entity = entityMap.__get(entityAfterCursor);
    if (entity.getMutability() !== 'MUTABLE') {
      var { start, end } = getRemovalRange(chars, entityAfterCursor, offset) as any;
      var current;
      while (start < end) {
        current = chars.get(start);
        chars = chars.set(start, CharacterMetadata.applyEntity(current, null));
        start++;
      }
      return block.set('characterList', chars) as ContentBlock;
    }
  }

  return block;
}
