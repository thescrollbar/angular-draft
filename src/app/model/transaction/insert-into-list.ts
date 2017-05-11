import { List } from 'immutable';

/**
 * Maintain persistence for target list when appending and prepending.
 */
export function insertIntoList<T>(
  targetList: List<T>,
  toInsert: List<T>,
  offset: number,
): List<T> {
  if (offset === targetList.count()) {
    toInsert.forEach(c => {
      targetList = targetList.push(c);
    });
  } else if (offset === 0) {
    toInsert.reverse().forEach(c => {
      targetList = targetList.unshift(c);
    });
  } else {
    var head = targetList.slice(0, offset);
    var tail = targetList.slice(offset);
    targetList = head.concat(toInsert, tail).toList();
  }
  return targetList;
}
