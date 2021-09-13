// this isn't used in the solution. Only in the extra credit
import {server} from 'test/server'

// 🐨 add a beforeAll to start the server with `server.listen()` (X)
// 🐨 add an afterAll to stop the server when `server.close()` (X)
// 🐨 afterEach test, reset the server handlers to their original handlers
// via `server.resetHandlers()` (X)
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

// Use setupTests.js (Extra) /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// This is the kind of thing we probably want to do in every one of our tests, especially when we start testing 
// things that are making network requests, so we probably want to move this into our setup.

// In review, all that we did here was take that common setup that we had at the top of this file and move it into 
// our setupTest file, which is configured to be imported in every single test. Now, we don't need to worry about 
// getting that server up and going for our future tests.