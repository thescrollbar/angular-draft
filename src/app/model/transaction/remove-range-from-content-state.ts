import { List, Map, OrderedMap } from 'immutable';
import { CharacterMetadata } from '../immutable/character-metadata';
import { ContentState } from '../immutable/content-state';
import { SelectionState } from '../immutable/selection-state';
import { ContentBlock } from '../immutable/content-block';

export function removeRangeFromContentState(
  contentState: ContentState,
  selectionState: SelectionState,
): ContentState {
  if (selectionState.isCollapsed()) {
    return contentState;
  }

  var blockMap = contentState.getBlockMap();
  var startKey = selectionState.getStartKey();
  var startOffset = selectionState.getStartOffset();
  var endKey = selectionState.getEndKey();
  var endOffset = selectionState.getEndOffset();

  var startBlock = blockMap.get(startKey);
  var endBlock = blockMap.get(endKey);
  var characterList;

  if (startBlock === endBlock) {
    characterList = removeFromList(
      startBlock.getCharacterList(),
      startOffset,
      endOffset,
    );
  } else {
    characterList = startBlock
      .getCharacterList()
      .slice(0, startOffset)
      .concat(endBlock.getCharacterList().slice(endOffset));
  }

  var modifiedStart = startBlock.merge({
    text: (
      startBlock.getText().slice(0, startOffset) +
      endBlock.getText().slice(endOffset)
    ),
    characterList,
  });

  var newBlocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat(Map([[endKey, null]]))
    .map((_, k) => { return k === startKey ? modifiedStart : null; }) as any;

  blockMap = blockMap.merge(newBlocks).filter(block => !!block) as any;

  return contentState.merge({
    blockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: startKey,
      anchorOffset: startOffset,
      focusKey: startKey,
      focusOffset: startOffset,
      isBackward: false,
    }),
  }) as ContentState;
}

/**
 * Maintain persistence for target list when removing characters on the
 * head and tail of the character list.
 */
function removeFromList(
  targetList: List<CharacterMetadata>,
  startOffset: number,
  endOffset: number,
): List<CharacterMetadata> {
  if (startOffset === 0) {
    while (startOffset < endOffset) {
      targetList = targetList.shift();
      startOffset++;
    }
  } else if (endOffset === targetList.count()) {
    while (endOffset > startOffset) {
      targetList = targetList.pop();
      endOffset--;
    }
  } else {
    var head = targetList.slice(0, startOffset);
    var tail = targetList.slice(endOffset);
    targetList = head.concat(tail).toList();
  }
  return targetList;
}
