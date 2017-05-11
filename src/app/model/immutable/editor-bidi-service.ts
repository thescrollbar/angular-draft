import { OrderedMap, is } from 'immutable';
import { ContentState } from './content-state';
import { nullthrows } from '../../utils/nullthrows';
import { UnicodeBidiService } from '../../utils/unicode/unicode-bidi-service';

var bidiService;

export var EditorBidiService = {
  getDirectionMap: function(
    content: ContentState,
    prevBidiMap?: OrderedMap<any, any>,
  ): OrderedMap<any, any> {
    if (!bidiService) {
      bidiService = new UnicodeBidiService();
    } else {
      bidiService.reset();
    }

    var blockMap = content.getBlockMap();
    var nextBidi = blockMap
      .valueSeq()
      .map(block => nullthrows(bidiService).getDirection(block.getText()));
    var bidiMap = OrderedMap(blockMap.keySeq().zip(nextBidi));

    if (prevBidiMap != null && is(prevBidiMap, bidiMap)) {
      return prevBidiMap;
    }

    return bidiMap;
  },
};
