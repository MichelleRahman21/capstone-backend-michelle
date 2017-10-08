// this is a recursive implimentation of deep merging
// that deeply merges objects and overwrites everything
// else, including e.g. arrays that contain objects

const deepMerge = function (target, source) {
  Object.keys(source).forEach(key => {
    if (typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])) {
      target[key] = deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  })
  return target
}

module.exports = deepMerge
