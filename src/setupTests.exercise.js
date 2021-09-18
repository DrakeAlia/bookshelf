import '@testing-library/jest-dom/extend-expect'
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
import {server} from 'test/server'
import * as usersDB from 'test/data/users'
import * as listItemsDB from 'test/data/list-items'
import * as booksDB from 'test/data/books'

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())


beforeEach(() => jest.useRealTimers())

// general cleanup
afterEach(async () => {
  queryCache.clear()
  await Promise.all([
    auth.logout(),
    usersDB.reset(),
    booksDB.reset(),
    listItemsDB.reset(),
  ])
})

// Use Jest Fake Timers (Extra)

// This test in particular puts me on edge a little bit because here we're waiting for that loading indicator to 
// show up, but I don't want to wait for that loading indicator to show up at all. It's got 300 ms right now as 
// our debounce delay, but what if we increase that debounce to 500 ms?

// We can say first that the loading indicator does show up, and then we wait for that loading indicator to go 
// away. The only reason we can do this is that we have a lot more control over the timing of everything that's 
// going on when we're using fake timers.

// Now, we can have that in place, and our tests will continue to pass. Remember, we must ensure that we're using 
// real timers for every other test.

// We'll just say beforeEach let's use real timers, and then in the test that we care about, we can just use 
// jest.useFakeTimers. When we're using fake timers, we don't have to worry about this loading indicator showing 
// up and then disappearing before the rest of our test can run. We can add this correct waitForLoadingToFinish 
// right here before continuing with the rest of our test.