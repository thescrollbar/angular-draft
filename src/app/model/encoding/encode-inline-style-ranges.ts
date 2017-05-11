import { List } from 'immutable';
import { findRangesImmutable } from '../immutable/find-ranges-immutable';
import { ContentBlock } from '../immutable/content-block';
import { DraftInlineStyle } from '../immutable/draft-inline-style';
import { InlineStyleRange } from './inline-style-range';
import { strlen } from '../../utils/strlen';

var areEqual = (a, b) => a === b;
var isTruthy = a => !!a;
var EMPTY_ARRAY = [];

/**
 * Helper function for getting encoded styles for each inline style. Convert
 * to UTF-8 character counts for storage.
 */
function getEncodedInlinesForType(
  block: ContentBlock,
  styleList: List<DraftInlineStyle>,
  styleToEncode: string,
): Array<InlineStyleRange> {
  var ranges = [];

  // Obtain an array with ranges for only the specified style.
  var filteredInlines = styleList
    .map(style => style.has(styleToEncode))
    .toList();

  findRangesImmutable(
    filteredInlines,
    areEqual,
    // We only want to keep ranges with nonzero style values.
    isTruthy,
    (start, end) => {
      var text = block.getText();
      ranges.push({
        offset: strlen(text.slice(0, start)),
        length: strlen(text.slice(start, end)),
        style: styleToEncode,
      });
    },
  );

  return ranges;
}

/*
 * Retrieve the encoded arrays of inline styles, with each individual style
 * treated separately.
 */
export function encodeInlineStyleRanges(
  block: ContentBlock,
): Array<InlineStyleRange> {
  var styleList = block.getCharacterList().map(c => c.getStyle()).toList();
  var ranges = styleList
    .flatten()
    .toSet()
    .map(style => getEncodedInlinesForType(block, styleList, style));

  return Array.prototype.concat.apply(EMPTY_ARRAY, ranges.toJS());
}
