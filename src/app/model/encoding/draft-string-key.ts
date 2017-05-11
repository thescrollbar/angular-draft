export var DraftStringKey = {
  stringify: function(key: any): string {
    return '_' + String(key);
  },

  unstringify: function(key: string): string {
    return key.slice(1);
  },
};
