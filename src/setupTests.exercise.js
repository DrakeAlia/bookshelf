import '@testing-library/jest-dom/extend-expect'
import {act, waitFor} from '@testing-library/react'
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
import {server} from 'test/server'
import * as usersDB from 'test/data/users'
import * as listItemsDB from 'test/data/list-items'
import * as booksDB from 'test/data/books'

// we don't need the profiler in tests
jest.mock('components/profiler')

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

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

// real times is a good default to start, individual tests can
// enable fake timers if they need, and if they have, then we should
// run all the pending timers (in `act` because this can trigger state updates)
// then we'll switch back to realTimers.
// it's important this comes last here because jest runs afterEach callbacks
// in reverse order and we want this to be run first so we get back to real timers
// before any other cleanup
afterEach(async () => {
  // waitFor is important here. If there are queries that are being fetched at
  // the end of the test and we continue on to the next test before waiting for
  // them to finalize, the tests can impact each other in strange ways.
  await waitFor(() => expect(queryCache.isFetching).toBe(0))
  if (jest.isMockFunction(setTimeout)) {
    act(() => jest.runOnlyPendingTimers())
    jest.useRealTimers()
  }
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

// Set up Mock Profiler for Tests (Extra)

// There's one other thing that we probably should consider when doing this integration 
// test. Remember, this integration test grabs the app. The app is going to grab and set up 
// a whole bunch of the other things that we're doing within our codebase.

// All of this is doing is it creates a Profiler component, which takes children and just 
// returns the children. It's, basically, an empty component, and then it exports that 
// Profiler. We export everything that this module exports. It is a legit mock.

// Now all we have to is make sure that every test is mocking that. We never set that up. 
// I'm going to add a jest.mock right here for componentsProfiler. This will make it so 
// that any time somebody tries to render a Profiler they're going to render this one 
// instead of this one.

// It means that we'll never import this module, so we'll never set this interval to start 
// sending the Profiler queue every five seconds. With that, let's make sure this is going 
// to work out, and voilà, our test continued to pass, and we don't have to worry about 
// setting that interval or rendering that Profiler component.

// 