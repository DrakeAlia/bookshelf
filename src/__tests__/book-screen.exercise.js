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
    render(<App />, {wrapper: AppProviders})
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))
    screen.debug()
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