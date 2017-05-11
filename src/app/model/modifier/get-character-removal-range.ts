import * as invariant from 'invariant';
import { DraftEntitySegments } from './draft-entity-segments';
import { getRangesForDraftEntity } from './get-ranges-for-draft-entity';
import { ContentBlock } from '../immutable/content-block';
import { DraftRemovalDirection } from '../constants/draft-removal-direction';
import { SelectionState } from '../immutable/selection-state';
import { EntityMap } from '../immutable/entity-map';

/**
 * Given a SelectionState and a removal direction, determine the entire range
 * that should be removed from a ContentState. This is based on any entities
 * within the target, with their `mutability` values taken into account.
 *
 * For instance, if we are attempting to remove part of an "immutable" entity
 * range, the entire entity must be removed. The returned `SelectionState`
 * will be adjusted accordingly.
 */
export function getCharacterRemovalRange(
  entityMap: EntityMap,
  startBlock: ContentBlock,
  endBlock: ContentBlock,
  selectionState: SelectionState,
  direction: DraftRemovalDirection,
): SelectionState {
  var start = selectionState.getStartOffset();
  var end = selectionState.getEndOffset();
  var startEntityKey = startBlock.getEntityAt(start);
  var endEntityKey = endBlock.getEntityAt(end - 1);
  if (!startEntityKey && !endEntityKey) {
    return selectionState;
  }
  var newSelectionState = selectionState;
  if (startEntityKey && (startEntityKey === endEntityKey)) {
    newSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntityKey,
      true,
      true,
    );
  } else if (startEntityKey && endEntityKey) {
    const startSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntityKey,
      false,
      true,
    );
    const endSelectionState = getEntityRemovalRange(
      entityMap,
      endBlock,
      newSelectionState,
      direction,
      endEntityKey,
      false,
      false,
    );
    newSelectionState = newSelectionState.merge({
      anchorOffset: startSelectionState.getAnchorOffset(),
      focusOffset: endSelectionState.getFocusOffset(),
      isBackward: false,
    }) as SelectionState;
  } else if (startEntityKey) {
    const startSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntityKey,
      false,
      true,
    );
    newSelectionState = newSelectionState.merge({
      anchorOffset: startSelectionState.getStartOffset(),
      isBackward: false,
    }) as SelectionState;
  } else if (endEntityKey) {
    const endSelectionState = getEntityRemovalRange(
      entityMap,
      endBlock,
      newSelectionState,
      direction,
      endEntityKey,
      false,
      false,
    );
    newSelectionState = newSelectionState.merge({
      focusOffset: endSelectionState.getEndOffset(),
      isBackward: false,
    }) as SelectionState;
  }
  return newSelectionState;
}

function getEntityRemovalRange(
  entityMap: EntityMap,
  block: ContentBlock,
  selectionState: SelectionState,
  direction: DraftRemovalDirection,
  entityKey: string,
  isEntireSelectionWithinEntity: boolean,
  isEntityAtStart: boolean,
): SelectionState {
  var start = selectionState.getStartOffset();
  var end = selectionState.getEndOffset();
  var entity = entityMap.__get(entityKey);
  var mutability = entity.getMutability();
  const sideToConsider = isEntityAtStart ? start : end;

  // `MUTABLE` entities can just have the specified range of text removed
  // directly. No adjustments are needed.
  if (mutability === 'MUTABLE') {
    return selectionState;
  }

  // Find the entity range that overlaps with our removal range.
  var entityRanges = getRangesForDraftEntity(block, entityKey).filter(
    (range) => sideToConsider <= range.end && sideToConsider >= range.start,
  );

  invariant(
    entityRanges.length == 1,
    'There should only be one entity range within this removal range.',
  );

  var entityRange = entityRanges[0];

  // For `IMMUTABLE` entity types, we will remove the entire entity range.
  if (mutability === 'IMMUTABLE') {
    return selectionState.merge({
      anchorOffset: entityRange.start,
      focusOffset: entityRange.end,
      isBackward: false,
    }) as SelectionState;
  }

  // For `SEGMENTED` entity types, determine the appropriate segment to
  // remove.
  if (!isEntireSelectionWithinEntity) {
    if (isEntityAtStart) {
      end = entityRange.end;
    } else {
      start = entityRange.start;
    }
  }

  var removalRange = DraftEntitySegments.getRemovalRange(
    start,
    end,
    block.getText().slice(entityRange.start, entityRange.end),
    entityRange.start,
    direction,
  );

  return selectionState.merge({
    anchorOffset: removalRange.start,
    focusOffset: removalRange.end,
    isBackward: false,
  }) as SelectionState;
}
