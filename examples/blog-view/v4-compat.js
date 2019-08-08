module.exports = function(keystone) {
  return {
    list: key => {
      return {
        model: keystone.getListByKey(key).adapter.model,
      };
    },
  };
};
