export var nullthrows = function<T>(x: T): T {
  if (x != null) {
    return x;
  }
  throw new Error("Got unexpected null or undefined");
};
