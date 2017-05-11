import { generateRandomKey } from '../keys/generate-random-key';
import { removeEntitiesAtEdges } from './remove-entities-at-edges';
import { BlockMap } from '../immutable/block-map';
import { ContentState } from '../immutable/content-state';
import { SelectionState } from '../immutable/selection-state';

export function getContentStateFragment(
  contentState: ContentState,
  selectionState: SelectionState,
): BlockMap {
  var startKey = selectionState.getStartKey();
  var startOffset = selectionState.getStartOffset();
  var endKey = selectionState.getEndKey();
  var endOffset = selectionState.getEndOffset();

  // Edge entities should be stripped to ensure that we don't preserve
  // invalid partial entities when the fragment is reused. We do, however,
  // preserve entities that are entirely within the selection range.
  var contentWithoutEdgeEntities = removeEntitiesAtEdges(
    contentState,
    selectionState,
  );

  var blockMap = contentWithoutEdgeEntities.getBlockMap();
  var blockKeys = blockMap.keySeq();
  var startIndex = blockKeys.indexOf(startKey);
  var endIndex = blockKeys.indexOf(endKey) + 1;

  var slice = blockMap.slice(startIndex, endIndex).map((block, blockKey) => {
    var newKey = generateRandomKey();

    var text = block.getText();
    var chars = block.getCharacterList();

    if (startKey === endKey) {
      return block.merge({
        key: newKey,
        text: text.slice(startOffset, endOffset),
        characterList: chars.slice(startOffset, endOffset),
      });
    }

    if (blockKey === startKey) {
      return block.merge({
        key: newKey,
        text: text.slice(startOffset),
        characterList: chars.slice(startOffset),
      });
    }

    if (blockKey === endKey) {
      return block.merge({
        key: newKey,
        text: text.slice(0, endOffset),
        characterList: chars.slice(0, endOffset),
      });
    }

    return block.set('key', newKey);
  });

  return slice.toOrderedMap() as BlockMap;
}
