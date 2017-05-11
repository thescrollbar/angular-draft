import { DraftStringKey } from './draft-string-key';
import { encodeEntityRanges } from './encode-entity-ranges';
import { encodeInlineStyleRanges } from './encode-inline-style-ranges';
import { ContentState } from '../immutable/content-state';
import { RawDraftContentState } from './raw-draft-content-state';

export function convertFromDraftStateToRaw(
  contentState: ContentState,
): RawDraftContentState {
  var entityStorageKey = 0;
  var entityStorageMap = {};
  var rawBlocks = [];

  contentState.getBlockMap().forEach((block, blockKey) => {
    block.findEntityRanges(
      character => character.getEntity() !== null,
      start => {
        // Stringify to maintain order of otherwise numeric keys.
        var stringifiedEntityKey = DraftStringKey.stringify(
          block.getEntityAt(start),
        );

        if (!entityStorageMap.hasOwnProperty(stringifiedEntityKey)) {
          entityStorageMap[stringifiedEntityKey] = '' + (entityStorageKey++);
        }
      },
    );

    rawBlocks.push({
      key: blockKey,
      text: block.getText(),
      type: block.getType(),
      depth: block.getDepth(),
      inlineStyleRanges: encodeInlineStyleRanges(block),
      entityRanges: encodeEntityRanges(block, entityStorageMap),
      data: block.getData().toObject(),
    });
  });

  // Flip storage map so that our storage keys map to global
  // DraftEntity keys.
  var entityKeys = Object.keys(entityStorageMap);
  var flippedStorageMap = {};
  entityKeys.forEach((key, jj) => {

    var entity = contentState.getEntity(DraftStringKey.unstringify(key));
    flippedStorageMap[jj] = {
      type: entity.getType(),
      mutability: entity.getMutability(),
      data: entity.getData(),
    };
  });

  return {
    entityMap: flippedStorageMap,
    blocks: rawBlocks,
  };
}
