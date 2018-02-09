// this method checks if the user trying to modify a resource is the owner of
// resource, and throws an error if not

// `requestObject` should be the actual `req` object from the route file
const requireOwnership = (requestObject, resource) => {
  // `requestObject.user` will be defined in any route that uses `requireToken`
  // `requireToken` MUST be passed to the route as a second argument
  if (!requestObject.user._id.equals(resource.owner)) {
    throw new Error({ name: 'OwnershipError' })
  }
}

module.exports = requireOwnership
