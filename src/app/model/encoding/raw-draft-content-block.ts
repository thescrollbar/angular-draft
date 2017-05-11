import { DraftBlockType } from '../constants/draft-block-type';
import { EntityRange } from './entity-range';
import { InlineStyleRange } from './inline-style-range';

/**
 * A plain object representation of a ContentBlock, with all style and entity
 * attribution repackaged as range objects.
 */
export type RawDraftContentBlock = {
  key: string,
  type: DraftBlockType,
  text: string,
  depth: number,
  inlineStyleRanges: Array<InlineStyleRange>,
  entityRanges: Array<EntityRange>,
  data?: Object,
};
