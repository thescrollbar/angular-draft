import { Map, OrderedMap } from 'immutable';
import { CharacterMetadata } from '../immutable/character-metadata';
import { ContentState } from '../immutable/content-state';
import { SelectionState } from '../immutable/selection-state';
import { ContentBlock } from "../immutable/content-block";

export var ContentStateInlineStyle = {
  add: function(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string,
  ): ContentState {
    return modifyInlineStyle(contentState, selectionState, inlineStyle, true);
  },

  remove: function(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string,
  ): ContentState {
    return modifyInlineStyle(contentState, selectionState, inlineStyle, false);
  },
};

function modifyInlineStyle(
  contentState: ContentState,
  selectionState: SelectionState,
  inlineStyle: string,
  addOrRemove: boolean,
): ContentState {
  var blockMap = contentState.getBlockMap();
  var startKey = selectionState.getStartKey();
  var startOffset = selectionState.getStartOffset();
  var endKey = selectionState.getEndKey();
  var endOffset = selectionState.getEndOffset();

  var newBlocks = blockMap
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat(Map([[endKey, blockMap.get(endKey)]]))
    .map((block, blockKey) => {
      var sliceStart;
      var sliceEnd;

      if (startKey === endKey) {
        sliceStart = startOffset;
        sliceEnd = endOffset;
      } else {
        sliceStart = blockKey === startKey ? startOffset : 0;
        sliceEnd = blockKey === endKey ? endOffset : block.getLength();
      }

      var chars = block.getCharacterList();
      var current;
      while (sliceStart < sliceEnd) {
        current = chars.get(sliceStart);
        chars = chars.set(
          sliceStart,
          addOrRemove ?
            CharacterMetadata.applyStyle(current, inlineStyle) :
            CharacterMetadata.removeStyle(current, inlineStyle),
        );
        sliceStart++;
      }

      return block.set('characterList', chars);
    }) as OrderedMap<string, ContentBlock>;

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  }) as ContentState;
}
