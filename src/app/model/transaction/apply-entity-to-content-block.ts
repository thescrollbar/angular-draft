import { CharacterMetadata } from '../immutable/character-metadata';
import { ContentBlock } from '../immutable/content-block';

export function applyEntityToContentBlock(
  contentBlock: ContentBlock,
  start: number,
  end: number,
  entityKey: string,
): ContentBlock {
  var characterList = contentBlock.getCharacterList();
  while (start < end) {
    characterList = characterList.set(
      start,
      CharacterMetadata.applyEntity(characterList.get(start), entityKey),
    );
    start++;
  }
  return contentBlock.set('characterList', characterList) as ContentBlock;
}
