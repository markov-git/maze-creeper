const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
export default {
  SSE_URL: `${BASE_URL}/sse/init`,
  NEW_ROOM: `${BASE_URL}/sse/newRoom`,
  NEW_STATE: `${BASE_URL}/sse/newState`,
  GET_ROOMS: key => `${BASE_URL}/sse/info/${key}`,
  CONNECT: `${BASE_URL}/sse/connect`,
  REMOVE: `${BASE_URL}/sse/remove`
}