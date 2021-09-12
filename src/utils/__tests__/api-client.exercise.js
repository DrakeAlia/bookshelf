// 🐨 you'll need the test server
// 💰 the way that our tests are set up, you'll find this in `src/test/server/test-server.js`
import {server, rest} from 'test/server'
// 🐨 grab the client (X)
import {client} from '../api-client'

const apiURL = process.env.REACT_APP_API_URL

// 🐨 add a beforeAll to start the server with `server.listen()` (X)
// 🐨 add an afterAll to stop the server when `server.close()` (X)
// 🐨 afterEach test, reset the server handlers to their original handlers
// via `server.resetHandlers()` (X)

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

// 🐨 add a server handler to handle a test request you'll be making (X)
// 🐨 call the client (don't forget that it's asynchronous) (X)
// 🐨 assert that the resolved value from the client call is correct (X)
test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint)

  expect(result).toEqual(mockResult)
})

// 🐨 create a fake token (it can be set to any string you want) (X)
// 🐨 create a "request" variable with let (X)
// 🐨 create a server handler to handle a test request you'll be making (X)
// 🐨 inside the server handler, assign "request" to "req" so we can use that (X)
// 🐨 call the client with the token (note that it's async) (X)
// 🐨 verify that `request.headers.get('Authorization')` is correct (it should include the token) (X)
test('adds auth token when a token is provided', async () => {
  const token = 'FAKE_TOKEN'

  let request 
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )
  await client(endpoint, {token})

  expect(request.headers.get('Authorization')).toBe(`Bearer ${token}`)
})

// 🐨 do a very similar setup to the previous test
// 🐨 create a custom config that specifies properties like "mode" of "cors" and a custom header
// 🐨 call the client with the endpoint and the custom config
// 🐨 verify the request had the correct properties
test('allows for config overrides', async () => {

})


// 🐨 create a mock data object
// 🐨 create a server handler very similar to the previous ones to handle the post request
//    💰 Use rest.post instead of rest.get like we've been doing so far
// 🐨 call client with an endpoint and an object with the data
//    💰 client(endpoint, {data})
// 🐨 verify the request.body is equal to the mock data object you passed
test('when data is provided, it is stringified and the method defaults to POST', async () => {

})


// Set up a Server to Test Requests /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// For the API client, let's go ahead and bring in the client, which is the thing we're going to be testing, API 
// client. For each of these tests, let's just get rid of that, to do, right there.

// In review, what we wanted to do here is call the client with a given endpoint, make sure that it makes a GET 
// request to that endpoint, and return the result returned from that endpoint. To do all this, we had to use an 
// MSW server that we had set up in this project already. We also brought in the client, of course, and the API URL 
// that the client's using.

// We started the server before the test run, we set it up to stop after the tests are finished, and we set it up to 
// clear all of these runtime handlers between each test. I just realized we should probably make this an afterEach, 
// so that we clear it immediately after each one of the test.

// It doesn't make a huge difference whether we use it before or after. It makes more sense to me that we would use 
// after to say that we clear them after each test, because the test is the thing that set this up in the first place.

// Then we created an endpoint that we wanted to hit, we created a mock result that we wanted to return, we awaited 
// the client at that endpoint, and we verified the result we got back from the client is the same one that we send 
// back from the server.

// Test if a Request has an Auth Header ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// For our API client, if we pass a token, it will behave a little bit differently because it's going to set this 
// authorization header. We want to make sure that authorization header makes it to our server.

// In review, what we did here is copy lots of the stuff that we're doing over here, and then just get rid of the 
// assertions and other things that we didn't need and add a variable to assign to this request so we can assert that 
// that request has the information that our backend will need to authorize the request.