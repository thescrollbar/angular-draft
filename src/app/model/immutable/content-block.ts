import { CharacterMetadata } from './character-metadata';
import { DraftBlockType } from '../constants/draft-block-type';
import { DraftInlineStyle } from './draft-inline-style';
import { findRangesImmutable } from './find-ranges-immutable';
import {
  List,
  Map,
  OrderedSet,
  Record,
} from 'immutable';

const EMPTY_SET = OrderedSet<string>();

const defaultRecord: {
  key: string,
  type: DraftBlockType,
  text: string,
  characterList: List<CharacterMetadata>,
  depth: number,
  data: Map<any, any>,
} = {
  key: '',
  type: 'unstyled',
  text: '',
  characterList: List<CharacterMetadata>(),
  depth: 0,
  data: Map(),
};

var ContentBlockRecord = Record(defaultRecord);

export class ContentBlock extends ContentBlockRecord {
  getKey(): string {
    return this.get('key');
  }

  getType(): DraftBlockType {
    return this.get('type');
  }

  getText(): string {
    return this.get('text');
  }

  getCharacterList(): List<CharacterMetadata> {
    return this.get('characterList');
  }

  getLength(): number {
    return this.getText().length;
  }

  getDepth(): number {
    return this.get('depth');
  }

  getData(): Map<any, any> {
    return this.get('data');
  }

  getInlineStyleAt(offset: number): DraftInlineStyle {
    var character = this.getCharacterList().get(offset);
    return character ? character.getStyle() : EMPTY_SET;
  }

  getEntityAt(offset: number): string {
    var character = this.getCharacterList().get(offset);
    return character ? character.getEntity() : null;
  }

  /**
   * Execute a callback for every contiguous range of styles within the block.
   */
  findStyleRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void,
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualStyle,
      filterFn,
      callback,
    );
  }

  /**
   * Execute a callback for every contiguous range of entities within the block.
   */
  findEntityRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void,
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualEntity,
      filterFn,
      callback,
    );
  }
}

function haveEqualStyle(
  charA: CharacterMetadata,
  charB: CharacterMetadata,
): boolean {
  return charA.getStyle() === charB.getStyle();
}

function haveEqualEntity(
  charA: CharacterMetadata,
  charB: CharacterMetadata,
): boolean {
  return charA.getEntity() === charB.getEntity();
}
