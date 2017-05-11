import {
  Map,
  OrderedSet,
  Record,
} from 'immutable';
import { DraftInlineStyle } from './draft-inline-style';

// Immutable.map is typed such that the value for every key in the map
// must be the same type
type CharacterMetadataConfigValueType = DraftInlineStyle | string;

type CharacterMetadataConfig = {
  style?: CharacterMetadataConfigValueType,
  entity?: CharacterMetadataConfigValueType,
};

const EMPTY_SET = OrderedSet<string>();

const defaultRecord: CharacterMetadataConfig = {
  style: EMPTY_SET,
  entity: null,
};

const CharacterMetadataRecord = Record(defaultRecord);

export class CharacterMetadata extends CharacterMetadataRecord {
  static EMPTY;

  getStyle(): DraftInlineStyle {
    return this.get('style');
  }

  getEntity(): string {
    return this.get('entity');
  }

  hasStyle(style: string): boolean {
    return this.getStyle().includes(style);
  }

  static applyStyle(
    record: CharacterMetadata,
    style: string,
  ): CharacterMetadata {
    var withStyle = record.set('style', record.getStyle().add(style));
    return CharacterMetadata.create(withStyle);
  }

  static removeStyle(
    record: CharacterMetadata,
    style: string,
  ): CharacterMetadata {
    var withoutStyle = record.set('style', record.getStyle().remove(style));
    return CharacterMetadata.create(withoutStyle);
  }

  static applyEntity(
    record: CharacterMetadata,
    entityKey: string,
  ): CharacterMetadata {
    var withEntity = record.getEntity() === entityKey ?
      record :
      record.set('entity', entityKey);
    return CharacterMetadata.create(withEntity);
  }

  /**
   * Use this function instead of the `CharacterMetadata` constructor.
   * Since most content generally uses only a very small number of
   * style/entity permutations, we can reuse these objects as often as
   * possible.
   */
  static create(config?: CharacterMetadataConfig): CharacterMetadata {
    if (!config) {
      return EMPTY;
    }

    const defaultConfig: CharacterMetadataConfig =
      {style: EMPTY_SET, entity: null};

    // Fill in unspecified properties, if necessary.
    var configMap = Map(defaultConfig).merge(config);

    var existing: CharacterMetadata = pool.get(configMap);
    if (existing) {
      return existing;
    }

    var newCharacter = new CharacterMetadata(configMap);
    pool = pool.set(configMap, newCharacter);
    return newCharacter;
  }
}

var EMPTY = new CharacterMetadata();
var pool: any = Map(
  [[Map(defaultRecord), EMPTY]],
);

CharacterMetadata.EMPTY = EMPTY;
