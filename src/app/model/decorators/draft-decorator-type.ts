import { List } from 'immutable';
import { ContentBlock } from '../immutable/content-block';
import { ContentState } from '../immutable/content-state';

/**
 * An interface for document decorator classes, allowing the creation of
 * custom decorator classes.
 *
 * See `CompositeDraftDecorator` for the most common use case.
 */
export type DraftDecoratorType = {
  /**
   * Given a `ContentBlock`, return an immutable List of decorator keys.
   */
   getDecorations(
     block: ContentBlock,
     contentState: ContentState,
   ): List<string>,

  /**
   * Given a decorator key, return the component to use when rendering
   * this decorated range.
   */
  getComponentForKey(key: string): Function,

  /**
   * Given a decorator key, optionally return the props to use when rendering
   * this decorated range.
   */
  getPropsForKey(key: string): Object
};
