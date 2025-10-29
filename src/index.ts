import { handleRequest } from './handler'

declare global {
  const HAMMAL_CACHE: KVNamespace
  const DOCKER_USERNAME: string
  const DOCKER_PASSWORD: string
  var REGISTRY_USERNAME: string | undefined
  var REGISTRY_PASSWORD: string | undefined
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})
