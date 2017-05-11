function makeEmptyFunction<T>(arg: T): (...args: Array<any>) => T {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
export const emptyFunction: (...args: Array<any>) => void = function() {};

(<any> emptyFunction).thatReturns = makeEmptyFunction;
(<any> emptyFunction).thatReturnsFalse = makeEmptyFunction(false);
(<any> emptyFunction).thatReturnsTrue = makeEmptyFunction(true);
(<any> emptyFunction).thatReturnsNull = makeEmptyFunction(null);
(<any> emptyFunction).thatReturnsThis = function() { return this; };
(<any> emptyFunction).thatReturnsArgument = function(arg) { return arg; };
