import * as invariant from 'invariant';
import { OrderedSet, Map } from 'immutable';
import { CharacterMetadata } from '../immutable/character-metadata';
import { ContentStateInlineStyle } from '../transaction/content-state-inline-style';
import { applyEntityToContentState } from '../transaction/apply-entity-to-content-state';
import { getCharacterRemovalRange } from './get-character-removal-range';
import { getContentStateFragment } from '../transaction/get-content-state-fragment';
import { insertFragmentIntoContentState } from '../transaction/insert-fragment-into-content-state';
import { insertTextIntoContentState } from '../transaction/insert-text-into-content-state';
import { modifyBlockForContentState } from '../transaction/modify-block-for-content-state';
import { removeEntitiesAtEdges } from '../transaction/remove-entities-at-edges';
import { removeRangeFromContentState } from '../transaction/remove-range-from-content-state';
import { splitBlockInContentState } from '../transaction/split-block-in-content-state';
import { BlockMap } from '../immutable/block-map';
import { ContentState } from '../immutable/content-state';
import { DraftBlockType } from '../constants/draft-block-type';
import { DraftInlineStyle } from '../immutable/draft-inline-style';
import { DraftRemovalDirection } from '../constants/draft-removal-direction';
import { SelectionState } from '../immutable/selection-state';
import { ContentBlock } from '../immutable/content-block';

const DraftFeatureFlags = {
  draft_killswitch_allow_nontextnodes: false,
  draft_segmented_entities_behavior: false,
};

/**
 * `DraftModifier` provides a set of convenience methods that apply
 * modifications to a `ContentState` object based on a target `SelectionState`.
 *
 * Any change to a `ContentState` should be decomposable into a series of
 * transaction functions that apply the required changes and return output
 * `ContentState` objects.
 *
 * These functions encapsulate some of the most common transaction sequences.
 */
export var DraftModifier = {
  replaceText: function(
    contentState: ContentState,
    rangeToReplace: SelectionState,
    text: string,
    inlineStyle?: DraftInlineStyle,
    entityKey?: string,
  ): ContentState {
    var withoutEntities = removeEntitiesAtEdges(contentState, rangeToReplace);
    var withoutText = removeRangeFromContentState(
      withoutEntities,
      rangeToReplace,
    );

    var character = CharacterMetadata.create({
      style: inlineStyle || OrderedSet<string>(),
      entity: entityKey || null,
    });

    return insertTextIntoContentState(
      withoutText,
      withoutText.getSelectionAfter(),
      text,
      character,
    );
  },

  insertText: function(
    contentState: ContentState,
    targetRange: SelectionState,
    text: string,
    inlineStyle?: DraftInlineStyle,
    entityKey?: string,
  ): ContentState {
    invariant(
      targetRange.isCollapsed(),
      'Target range must be collapsed for `insertText`.',
    );
    return DraftModifier.replaceText(
      contentState,
      targetRange,
      text,
      inlineStyle,
      entityKey,
    );
  },

  moveText: function(
    contentState: ContentState,
    removalRange: SelectionState,
    targetRange: SelectionState,
  ): ContentState {
    var movedFragment = getContentStateFragment(contentState, removalRange);

    var afterRemoval = DraftModifier.removeRange(
      contentState,
      removalRange,
      'backward',
    );

    return DraftModifier.replaceWithFragment(
      afterRemoval,
      targetRange,
      movedFragment,
    );
  },

  replaceWithFragment: function(
    contentState: ContentState,
    targetRange: SelectionState,
    fragment: BlockMap,
  ): ContentState {
    var withoutEntities = removeEntitiesAtEdges(contentState, targetRange);
    var withoutText = removeRangeFromContentState(
      withoutEntities,
      targetRange,
    );

    return insertFragmentIntoContentState(
      withoutText,
      withoutText.getSelectionAfter(),
      fragment,
    );
  },

  removeRange: function(
    contentState: ContentState,
    rangeToRemove: SelectionState,
    removalDirection: DraftRemovalDirection,
  ): ContentState {
    let startKey, endKey, startBlock, endBlock;
    if (rangeToRemove.getIsBackward()) {
      rangeToRemove = rangeToRemove.merge({
        anchorKey: rangeToRemove.getFocusKey(),
        anchorOffset: rangeToRemove.getFocusOffset(),
        focusKey: rangeToRemove.getAnchorKey(),
        focusOffset: rangeToRemove.getAnchorOffset(),
        isBackward: false,
      }) as SelectionState;
    }
    startKey = rangeToRemove.getAnchorKey();
    endKey = rangeToRemove.getFocusKey();
    startBlock = contentState.getBlockForKey(startKey);
    endBlock = contentState.getBlockForKey(endKey);
    const startOffset = rangeToRemove.getStartOffset();
    const endOffset = rangeToRemove.getEndOffset();

    const startEntityKey = startBlock.getEntityAt(startOffset);
    const endEntityKey = endBlock.getEntityAt(endOffset - 1);

    // Check whether the selection state overlaps with a single entity.
    // If so, try to remove the appropriate substring of the entity text.
    if (startKey === endKey) {
      if (startEntityKey && startEntityKey === endEntityKey) {
        const adjustedRemovalRange = getCharacterRemovalRange(
          contentState.getEntityMap(),
          startBlock,
          endBlock,
          rangeToRemove,
          removalDirection,
        );
        return removeRangeFromContentState(contentState, adjustedRemovalRange);
      }
    }
    let adjustedRemovalRange = rangeToRemove;
    if (DraftFeatureFlags.draft_segmented_entities_behavior) {
      // Adjust the selection to properly delete segemented and immutable
      // entities
      adjustedRemovalRange = getCharacterRemovalRange(
        contentState.getEntityMap(),
        startBlock,
        endBlock,
        rangeToRemove,
        removalDirection,
      );
    }

    var withoutEntities = removeEntitiesAtEdges(
      contentState,
      adjustedRemovalRange,
    );
    return removeRangeFromContentState(withoutEntities, adjustedRemovalRange);
  },

  splitBlock: function(
    contentState: ContentState,
    selectionState: SelectionState,
  ): ContentState {
    var withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
    var withoutText = removeRangeFromContentState(
      withoutEntities,
      selectionState,
    );

    return splitBlockInContentState(
      withoutText,
      withoutText.getSelectionAfter(),
    );
  },

  applyInlineStyle: function(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string,
  ): ContentState {
    return ContentStateInlineStyle.add(
      contentState,
      selectionState,
      inlineStyle,
    );
  },

  removeInlineStyle: function(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string,
  ): ContentState {
    return ContentStateInlineStyle.remove(
      contentState,
      selectionState,
      inlineStyle,
    );
  },

  setBlockType: function(
    contentState: ContentState,
    selectionState: SelectionState,
    blockType: DraftBlockType,
  ): ContentState {
    return modifyBlockForContentState(
      contentState,
      selectionState,
      (block) => block.merge({type: blockType, depth: 0}) as ContentBlock,
    );
  },

  setBlockData: function(
    contentState: ContentState,
    selectionState: SelectionState,
    blockData: Map<any, any>,
  ): ContentState {
    return modifyBlockForContentState(
      contentState,
      selectionState,
      (block) => block.merge({data: blockData}) as ContentBlock,
    );
  },

  mergeBlockData: function(
    contentState: ContentState,
    selectionState: SelectionState,
    blockData: Map<any, any>,
  ): ContentState {
    return modifyBlockForContentState(
      contentState,
      selectionState,
      (block) => block.merge({data: block.getData().merge(blockData)}) as ContentBlock,
    );
  },


  applyEntity: function(
    contentState: ContentState,
    selectionState: SelectionState,
    entityKey: string,
  ): ContentState {
    var withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
    return applyEntityToContentState(
      withoutEntities,
      selectionState,
      entityKey,
    );
  },
};
