export default function getProvider() {
  return new Promise((resolve, reject) => {
    const set = function (target, prop, value) {
      if (prop === "sporran") resolve(value);
      return !!(target[prop] = value);
    };
    window.kilt = window.kilt || new Proxy({}, { set });
  });
}
