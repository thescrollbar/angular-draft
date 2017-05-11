import * as invariant from 'invariant';
import { Map } from 'immutable';
import { generateRandomKey } from '../keys/generate-random-key';
import { ContentState } from '../immutable/content-state';
import { SelectionState } from '../immutable/selection-state';
import { ContentBlock } from '../immutable/content-block';

export function splitBlockInContentState(
  contentState: ContentState,
  selectionState: SelectionState,
): ContentState {
  invariant(
    selectionState.isCollapsed(),
    'Selection range must be collapsed.',
  );

  var key = selectionState.getAnchorKey();
  var offset = selectionState.getAnchorOffset();
  var blockMap = contentState.getBlockMap();
  var blockToSplit = blockMap.get(key);

  var text = blockToSplit.getText();
  var chars = blockToSplit.getCharacterList();

  var blockAbove = blockToSplit.merge({
    text: text.slice(0, offset),
    characterList: chars.slice(0, offset),
  }) as ContentBlock;

  var keyBelow = generateRandomKey();
  var blockBelow = blockAbove.merge({
    key: keyBelow,
    text: text.slice(offset),
    characterList: chars.slice(offset),
    data: Map(),
  }) as ContentBlock;

  var blocksBefore = blockMap.toSeq().takeUntil(v => v === blockToSplit);
  var blocksAfter = blockMap.toSeq().skipUntil(v => v === blockToSplit).rest();
  var newBlocks = blocksBefore.concat(
    [[blockAbove.getKey(), blockAbove], [blockBelow.getKey(), blockBelow]],
    blocksAfter,
  ).toOrderedMap();

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: keyBelow,
      anchorOffset: 0,
      focusKey: keyBelow,
      focusOffset: 0,
      isBackward: false,
    }),
  }) as ContentState;
}
