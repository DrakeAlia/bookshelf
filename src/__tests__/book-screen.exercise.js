// 🐨 here are the things you're going to need for this test: (X)
import * as React from 'react'
import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import {queryCache} from 'react-query'
import {buildUser, buildBook} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {App} from 'app'

// 🐨 after each test, clear the queryCache and auth.logout

test('renders all the book information', async () => {
  const user = buildUser()
  window.localStorage.setItem(auth.localStorageKey, 'SOME_FAKE_TOKEN')

  const book = buildBook()
  const route = `/book/${book.id}`
  window.history.pushState({}, 'Test page', route)

  const originalFetch = window.fetch
  window.fetch = async (url, config) => {
    if (url.endsWith('/bootstrap')) {
      return {
        ok: true,
        json: async () => ({
          user: {...user, token: 'SOME_FAKE_TOKEN'},
          listItems: [],
        }),
      }
    } else if (url.endsWith(`/books/${book.id}`)) {
      return {ok: true, json: async () => ({book})}
    }
    return originalFetch(url, config)
  }

  render(<App />, {wrapper: AppProviders})

  await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.title)).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()

  expect(
    screen.queryByRole('button', {name: /remove to list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textarea', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('radio', {name: /star/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})
// 🐨 "authenticate" the client by setting the auth.localStorageKey in localStorage to some string value (can be anything for now)

// 🐨 create a user using `buildUser`
// 🐨 create a book use `buildBook`
// 🐨 update the URL to `/book/${book.id}`
//   💰 window.history.pushState({}, 'page title', route)
//   📜 https://developer.mozilla.org/en-US/docs/Web/API/History/pushState

// 🐨 reassign window.fetch to another function and handle the following requests:
// - url ends with `/bootstrap`: respond with {user, listItems: []}
// - url ends with `/list-items`: respond with {listItems: []}
// - url ends with `/books/${book.id}`: respond with {book}
// 💰 window.fetch = async (url, config) => { /* handle stuff here*/ }
// 💰 return Promise.resolve({ok: true, json: async () => ({ /* response data here */ })})

// 🐨 render the App component and set the wrapper to the AppProviders
// (that way, all the same providers we have in the app will be available in our tests)

// 🐨 use waitFor to wait for the queryCache to stop fetching and the loading
// indicators to go away
// 📜 https://testing-library.com/docs/dom-testing-library/api-async#waitfor
// 💰 if (queryCache.isFetching or there are loading indicators) then throw an error...

// 🐨 assert the book's info is in the document

// Render the Application with AppProviders ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Let's get started by making this an async test. I know that this will be async, and pretty much all integration
// tests will be. The first thing that we want to do is render our app. Let's import the app from that App Module
// that we've got.

// If we're going to want to create an app element, we'll need to import react from 'react' to create React elements,
// and we'll import render from '@testing-library/react.' We'll also want to interact with the screen. We'll do
// screen here, then we'll render the app, and we'll say screen.debug.

// Now, we've got a full-page spinner. We're rendering the app, and it's attempting to load the user's information.
// We've got some act warnings that we can deal with later. Let's go ahead and stop here and review what we've done
// so far.

// First, we're rendering the entire application. That's what an integration test is. In particular, we're going to
// be just rendering the book screen, but we want to render everything, including our router, and our query provider
// for a react-query, and our own authentication provider.

// We're going to render the app itself and then make sure we can land on the book screen to test that specific
// book screen. This is to get us going. We're rendering our app in the same way that we're rendering it in
// production. By doing this, we are well on our way to writing an integration test for the booking screen.

// Wait for Loading Element to Be Removed //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Now we want to wait for this full-page spinner to go
// away, and it's got a label of loading for screen readers. We can query it by that, and wait for that to go away.
// There's a utility for that, waitForElementToBeRemoved. Right here we'll await waitForElementToBeRemoved, we'll say screen getByLabelText(/loading/i)).

// This is a quick one. All we did was import waitForElementToBeRemoved, then we added a callback in here and waitForElementToBeRemoved.

// We'll call this callback every time there's a DOM change
// or on a regular interval, and it will prevent our test from running any further until that element no longer returns.

// Reverse-engineer AuthProvide and Log In //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// We're not on the right screen right now. We should be logged in rather than showing the log in and register. We need to trick our application in the thinking that we're logged in.

// In review, what we did here was we reverse engineered our AuthProvider and found that they stick some fake token in localStorage.

// They even expose that localStorage key as part of the providers' exports. We're able to trick the authentication provider into thinking that the user is logged in by setting that localStorage key to some fake token.

// Then to make sure that we handle the request that's made when our user lands on the page in the first place and they're logged in, we override window.fetch to handle when the fetch request is to anything at /bootstrap and we return a successful response. Here we say, "OK, true," and JSON is this async function that returns some data.

// If we dive into our API client, then that is exactly what we need. We need to have a response with a JSON function that's async, so we can await it and then respond, "OK, needs to be true," so it returns that data.

// With all of that setup, now we're in the locked inside of the application.

// Render a Book Page in a Test ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Before we render our app, let's navigate to that page so when our app is rendered, we're already at the right spot. We're going to say window.history pushState, but the first argument is the state. We don't really care about that.

// In review, we did a couple of things here. First, we wanted to get our test on the route that the user's going to land on for the bookScreen. We used window.history.pushState to get us on the right page. We also generated a book and we used that books id.

// Then through this process, we noticed that our API Mark here was not complete. Even though our test was passing, the code wasn't functioning the way that it actually would in production. We needed to fix our API Mark a little bit to send that token along with the bootstrap request.

// Then with all this set up, our code started to make a request to the books endpoint for the book that we landed on. We had to add an additional handler here, and we simply returned the book information that our backend would return if we hit our backend at that url.

// Doing all of that made it so that when we called screen.debug, we see that we are on the book page and we see all of the book's information.

// Test What UI Elements are Present /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Now that we've successfully rendered our book to the screen, let's make sure that all the book's information is on the screen, and we have the right buttons in place for adding this to our list.

// Let's review this whole thing really quick. The first thing that we did was we rendered our entire application. We noticed that there was a problem with our provider not being rendered, so we added a wrapper option with the app providers. When we did that, we noticed that we're just rendering the loading screen.

// We added waitForElementToBeRemoved, so that we waited until that loading spinner disappeared. Then we noticed we started making some network requests. We mocked fetch to handle those network requests. We wanted to make sure we landed on the book page.

// We built a book and routed ourselves to that book's page. We also made sure that we are tricking our authProvider into thinking we're actually logged in. Again, this will differ based on the authProvider that you use. Some of them you might actually have to mock the entire module itself.

// Once we got all of that set up finished, we were able to make some assertions on what should appear on the screen, as well as what should not. This gives us a huge amount of confidence in the screen page itself and all of the providers and everything else that's doing work to get our users to that screen page.

// Yes, it may be quite a bit of work to get to this point, but it is 100 percent worth it for all of the confidence that we get from this test.