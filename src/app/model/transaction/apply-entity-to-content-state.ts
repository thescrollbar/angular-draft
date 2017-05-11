import { OrderedMap } from 'immutable';
import { ContentState } from '../immutable/content-state';
import { SelectionState } from '../immutable/selection-state';
import { applyEntityToContentBlock } from './apply-entity-to-content-block';

export function applyEntityToContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  entityKey: string,
): ContentState {
  const blockMap = contentState.getBlockMap();
  const startKey = selectionState.getStartKey();
  const startOffset = selectionState.getStartOffset();
  const endKey = selectionState.getEndKey();
  const endOffset = selectionState.getEndOffset();

  const newBlocks = blockMap
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .toOrderedMap()
    .merge(OrderedMap<any>([[endKey, blockMap.get(endKey)]]))
    .map((block, blockKey) => {
      const sliceStart = blockKey === startKey ? startOffset : 0;
      const sliceEnd = blockKey === endKey ? endOffset : block.getLength();
      return applyEntityToContentBlock(
        block,
        sliceStart,
        sliceEnd,
        entityKey,
      );
    });

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  }) as ContentState;
}
