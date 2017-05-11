import * as invariant from 'invariant';
import { Repeat } from 'immutable';
import { insertIntoList } from './insert-into-list';
import { CharacterMetadata } from '../immutable/character-metadata';
import { ContentState } from '../immutable/content-state';
import { SelectionState } from '../immutable/selection-state';
import { ContentBlock } from '../immutable/content-block';

export function insertTextIntoContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  text: string,
  characterMetadata: CharacterMetadata,
): ContentState {
  invariant(
    selectionState.isCollapsed(),
    '`insertText` should only be called with a collapsed range.',
  );

  var len = text.length;
  if (!len) {
    return contentState;
  }

  var blockMap = contentState.getBlockMap();
  var key = selectionState.getStartKey();
  var offset = selectionState.getStartOffset();
  var block = blockMap.get(key);
  var blockText = block.getText();

  var newBlock = block.merge({
    text: (
      blockText.slice(0, offset) +
      text +
      blockText.slice(offset, block.getLength())
    ),
    characterList: insertIntoList(
      block.getCharacterList(),
      Repeat(characterMetadata, len).toList(),
      offset,
    ),
  }) as ContentBlock;

  var newOffset = offset + len;

  return contentState.merge({
    blockMap: blockMap.set(key, newBlock),
    selectionAfter: selectionState.merge({
      anchorOffset: newOffset,
      focusOffset: newOffset,
    }),
  }) as ContentState;
}
