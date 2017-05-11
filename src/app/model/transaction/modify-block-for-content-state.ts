import { Map } from 'immutable';
import { ContentBlock } from '../immutable/content-block';
import { ContentState } from '../immutable/content-state';
import { SelectionState } from '../immutable/selection-state';

export function modifyBlockForContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  operation: (block: ContentBlock) => ContentBlock,
): ContentState {
  var startKey = selectionState.getStartKey();
  var endKey = selectionState.getEndKey();
  var blockMap = contentState.getBlockMap();
  var newBlocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat(Map([[endKey, blockMap.get(endKey)]]))
    .map(operation);

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  }) as ContentState;
}
