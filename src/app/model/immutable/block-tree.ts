import {
  List,
  Repeat,
  Record
} from 'immutable';
import { findRangesImmutable } from './find-ranges-immutable';
import { CharacterMetadata } from './character-metadata';
import { ContentState } from './content-state';
import { ContentBlock } from './content-block';
import { DraftDecoratorType } from '../decorators/draft-decorator-type';
import { emptyFunction } from '../../utils/empty-function';

var returnTrue = (<any> emptyFunction).thatReturnsTrue;

var FINGERPRINT_DELIMITER = '-';

var defaultLeafRange: {
  start: number,
  end: number,
} = {
  start: null,
  end: null,
};

const LeafRange = Record(defaultLeafRange);

var defaultDecoratorRange: {
  start: number,
  end: number,
  decoratorKey: string,
  leaves: List<any>,
} = {
  start: null,
  end: null,
  decoratorKey: null,
  leaves: null,
};

var DecoratorRange = Record(defaultDecoratorRange);

export var BlockTree = {
  /**
   * Generate a block tree for a given ContentBlock/decorator pair.
   */
  generate: function(
    contentState: ContentState,
    block: ContentBlock,
    decorator: DraftDecoratorType,
  ): List<any> {
    var textLength = block.getLength();
    if (!textLength) {
      return List.of(
        new DecoratorRange({
          start: 0,
          end: 0,
          decoratorKey: null,
          leaves: List.of(
            new LeafRange({start: 0, end: 0}),
          ),
        }),
      );
    }

    var leafSets = [];
    var decorations = decorator ?
      decorator.getDecorations(block, contentState) :
      List(Repeat(null, textLength));

    var chars = block.getCharacterList();

    findRangesImmutable(
      decorations,
      areEqual,
      returnTrue,
      (start, end) => {
        leafSets.push(
          new DecoratorRange({
            start,
            end,
            decoratorKey: decorations.get(start),
            leaves: generateLeaves(
              chars.slice(start, end).toList(),
              start,
            ),
          }),
        );
      },
    );

    return List(leafSets);
  },

  /**
   * Create a string representation of the given tree map. This allows us
   * to rapidly determine whether a tree has undergone a significant
   * structural change.
   */
  getFingerprint: function(tree: List<any>): string {
    return tree.map(
      leafSet => {
        var decoratorKey = leafSet.get('decoratorKey');
        var fingerprintString = decoratorKey !== null ?
          decoratorKey + '.' + (leafSet.get('end') - leafSet.get('start')) :
          '';
        return '' + fingerprintString + '.' + leafSet.get('leaves').size;
      },
    ).join(FINGERPRINT_DELIMITER);
  },
};

/**
 * Generate LeafRange records for a given character list.
 */
function generateLeaves(
  characters: List<CharacterMetadata>,
  offset: number,
): List<any> {
  var leaves = [];
  var inlineStyles = characters.map(c => c.getStyle()).toList();
  findRangesImmutable(
    inlineStyles,
    areEqual,
    returnTrue,
    (start, end) => {
      leaves.push(
        new LeafRange({
          start: start + offset,
          end: end + offset,
        }),
      );
    },
  );
  return List(leaves);
}

function areEqual(a: any, b: any): boolean {
  return a === b;
}
