// 🐨 you'll need the test server
// 💰 the way that our tests are set up, you'll find this in `src/test/server/test-server.js`
import {server, rest} from 'test/server'
// 🐨 grab the client (X)
import {client} from '../api-client'
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'

const apiURL = process.env.REACT_APP_API_URL

jest.mock('react-query')
jest.mock('auth-provider')

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

// 🐨 do a very similar setup to the previous test (X)
// 🐨 create a custom config that specifies properties like "mode" of "cors" and a custom header (X)
// 🐨 call the client with the endpoint and the custom config (X)
// 🐨 verify the request had the correct properties (X)
test('allows for config overrides', async () => {
  let request
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.put(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  const customConfig = {
    method: 'PUT',
    headers: {'Content-Type': 'fake-type'},
  }

  await client(endpoint, customConfig)

  expect(request.headers.get('Content-Type')).toBe(
    customConfig.headers['Content-Type'],
  )
})

// 🐨 create a mock data object (X)
// 🐨 create a server handler very similar to the previous ones to handle the post request (X)
// 🐨 call client with an endpoint and an object with the data  (X)
// 🐨 verify the request.body is equal to the mock data object you passed (X)
test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const endpoint = 'test-endpoint'
  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(req.body))
    }),
  )

  const data = {a: 'b'}

  const result = await client(endpoint, {data})

  expect(result).toEqual(data)
})

test('automatically logs the user out if a request returns a 401', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(401), ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint).catch(e => e)

  expect(result.message).toMatchInlineSnapshot(`"Please re-authenticate."`)

  expect(queryCache.clear).toHaveBeenCalledTimes(1)
  expect(auth.logout).toHaveBeenCalledTimes(1)
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

// Client Request Config Overrides //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Another thing that our client allows us the ability to override configuration both for the headers and the rest
// of the config, so we can override the method or the body or anything that we want to, so let's make sure that that
// still works.

// We're going to come over here and copy all of this because we're going to be doing several of the same things.
// We'll paste it right here. We don't need a token, so we're not going to pass that token, but we do need to have a
// customConfig. That's what we'll put right here, customConfig.

// For config overrides, we create our own custom config here, pass it along to the client, make sure we're
// listening for the right request based on the method that we're going to customize we verify that the content
// type is what we specified here.

// POST by Default when Body Present and Stringified ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Another thing that's really important that our client does is send the body and the method automatically if we
// pass some data, as well as the content type. We want to test for all of those cases.

// We're going to do a lot of the same stuff that we were doing in this previous test. I'll copy this. We'll paste it
// right here. For this one, we could make assertions on the request and make sure that the body is what it should be.

// In review what we did here is copy and paste lots of the previous test to have a server that's listening on POST
// for this endpoint, simply returning the request body. Then we send this data along and verify that the result we
// got from the server is the same thing that we sent along as the data. That gives us all the confidence we need for
// this particular feature.


// Automatic Log Out on 401 Error //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// This is all fine and dandy if everything is going OK, but what happens if there is an error? In the API client, if 
// we get an error from the response where the response status is 401, then we're going to clear the queryCache, 
// log the user out, and refresh the page for them. We probably want to make sure that those things aren't happening 
// in our test.

// In review, for this test, we did the same thing our first test did with the happy path for this test. We just 
// modified it for sending the status of 401, which indicates to the client that the user is making a request that 
// they're not allowed to do, probably because their token is expired, and they need to log in again.

// We make the request, which we know will fail, so we catch that, convert that promise from rejected to resolved by 
// just returning the rejected value. We get that result. We verify the result message is, "Please reauthenticate 
// using toMatchInlineSnapshot." Then we verify that the queryCache is cleared and auth.logOut is called.