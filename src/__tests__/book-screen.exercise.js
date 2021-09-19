// 📜 https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
// 📜 https://testing-library.com/docs/dom-testing-library/api-async#waitfor
import * as React from 'react'
import {
  render,
  screen,
  waitForLoadingToFinish,
  userEvent,
  loginAsUser,
} from 'test/app-test-utils'
import {server, rest} from 'test/server'
import {buildBook, buildListItem} from 'test/generate'
import {App} from 'app'
import * as booksDB from 'test/data/books'
import {formatDate} from 'utils/misc'
import * as listItemsDB from 'test/data/list-items'
import faker from 'faker'

const apiURL = process.env.REACT_APP_API_URL

async function renderBookScreen({user, book, listItem} = {}) {
  if (user === undefined) {
    user = await loginAsUser()
  }

  if (book === undefined) {
    book = await booksDB.create(buildBook())
  }

  if (listItem === undefined) {
    listItem = await listItemsDB.create(buildListItem({owner: user, book}))
  }
  const route = `/book/${book.id}`

  const utils = await render(<App />, {route, user})

  return {...utils, user, book, listItem}
}

test('renders all the book information', async () => {
  const {book} = await renderBookScreen({listItem: null})

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
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  await renderBookScreen({listItem: null})

  const addToListButton = screen.getByRole('button', {name: /add to list/i})
  userEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: /notes/i})).toBeInTheDocument()

  const startDateNode = screen.getByLabelText(/start date/i)
  expect(startDateNode).toHaveTextContent(formatDate(new Date()))

  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
})

test('can remove a list item for the book', async () => {
  await renderBookScreen()

  const removeFromListButton = screen.getByRole('button', {
    name: /remove from list/i,
  })
  userEvent.click(removeFromListButton)
  expect(removeFromListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  const {listItem} = await renderBookScreen()
  await listItemsDB.update(listItem.id, {finishDate: null})

  const markAsReadButton = screen.getByRole('button', {
    name: /mark as read/i,
  })
  userEvent.click(markAsReadButton)
  expect(markAsReadButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()

  const startAndFinishDateNode = screen.getByLabelText(/start and finish date/i)
  expect(startAndFinishDateNode).toHaveTextContent(
    `${formatDate(listItem.startDate)} — ${formatDate(Date.now())}`,
  )

  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
})

test('can edit a note', async () => {
  // using fake timers to skip debounce time
  jest.useFakeTimers()
  const {listItem} = await renderBookScreen()

  const newNotes = faker.lorem.words()
  const notesTextarea = screen.getByRole('textbox', {name: /notes/i})

  userEvent.clear(notesTextarea)
  userEvent.type(notesTextarea, newNotes)

  // wait for the loading spinner to show up
  await screen.findByLabelText(/loading/i)
  // wait for the loading spinner to go away
  await waitForLoadingToFinish()

  expect(notesTextarea).toHaveValue(newNotes)

  expect(await listItemsDB.read(listItem.id)).toMatchObject({
    notes: newNotes,
  })
})

describe('console errors', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  test('shows an error message when the book fails to load', async () => {
    const book = {id: 'BAD_ID'}
    await renderBookScreen({listItem: null, book})

    expect(
      (await screen.findByRole('alert')).textContent,
    ).toMatchInlineSnapshot(`"There was an error: Book not found"`)
    expect(console.error).toHaveBeenCalled()
  })

  test('note update failures are displayed', async () => {
    // using fake timers to skip debounce time
    jest.useFakeTimers()
    await renderBookScreen()

    const newNotes = faker.lorem.words()
    const notesTextarea = screen.getByRole('textbox', {name: /notes/i})

    const testErrorMessage = '__test_error_message__'
    server.use(
      rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({status: 400, message: testErrorMessage}),
        )
      }),
    )

    userEvent.type(notesTextarea, newNotes)
    // wait for the loading spinner to show up
    await screen.findByLabelText(/loading/i)
    // wait for the loading spinner to go away
    await waitForLoadingToFinish()

    expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
      `"There was an error: __test_error_message__"`,
    )
  })
})

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
// There's a utility for that, waitForElementToBeRemoved. Right here we'll await waitForElementToBeRemoved, we'll say screen
// getByLabelText(/loading/i)).

// This is a quick one. All we did was import waitForElementToBeRemoved, then we added a callback in here and
// waitForElementToBeRemoved.

// We'll call this callback every time there's a DOM change
// or on a regular interval, and it will prevent our test from running any further until that element no longer
// returns.

// Reverse-engineer AuthProvide and Log In //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// We're not on the right screen right now. We should be logged in rather than showing the log in and register.
// We need to trick our application in the thinking that we're logged in.

// In review, what we did here was we reverse engineered our AuthProvider and found that they stick some fake token
// in localStorage.

// They even expose that localStorage key as part of the providers' exports. We're able to trick the authentication
// provider into thinking that the user is logged in by setting that localStorage key to some fake token.

// Then to make sure that we handle the request that's made when our user lands on the page in the first place and
// they're logged in, we override window.fetch to handle when the fetch request is to anything at /bootstrap and we
// return a successful response. Here we say, "OK, true," and JSON is this async function that returns some data.

// If we dive into our API client, then that is exactly what we need. We need to have a response with a JSON
// function that's async, so we can await it and then respond, "OK, needs to be true," so it returns that data.

// With all of that setup, now we're in the locked inside of the application.

// Render a Book Page in a Test ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Before we render our app, let's navigate to that page so when our app is rendered, we're already at the right
// spot. We're going to say window.history pushState, but the first argument is the state. We don't really care about
// that.

// In review, we did a couple of things here. First, we wanted to get our test on the route that the user's going to
// land on for the bookScreen. We used window.history.pushState to get us on the right page. We also generated a book
// and we used that books id.

// Then through this process, we noticed that our API Mark here was not complete. Even though our test was passing,
// the code wasn't functioning the way that it actually would in production. We needed to fix our API Mark a little
// bit to send that token along with the bootstrap request.

// Then with all this set up, our code started to make a request to the books endpoint for the book that we
// landed on. We had to add an additional handler here, and we simply returned the book information that our backend
// would return if we hit our backend at that url.

// Doing all of that made it so that when we called screen.debug, we see that we are on the book page and we see
// all of the book's information.

// Test What UI Elements are Present /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Now that we've successfully rendered our book to the screen, let's make sure that all the book's information is
// on the screen, and we have the right buttons in place for adding this to our list.

// Let's review this whole thing really quick. The first thing that we did was we rendered our entire application.
// We noticed that there was a problem with our provider not being rendered, so we added a wrapper option with the
// app providers. When we did that, we noticed that we're just rendering the loading screen.

// We added waitForElementToBeRemoved, so that we waited until that loading spinner disappeared. Then we noticed we
// started making some network requests. We mocked fetch to handle those network requests. We wanted to make sure we
// landed on the book page.

// We built a book and routed ourselves to that book's page. We also made sure that we are tricking our authProvider
// into thinking we're actually logged in. Again, this will differ based on the authProvider that you use. Some of
// them you might actually have to mock the entire module itself.

// Once we got all of that set up finished, we were able to make some assertions on what should appear on the
// screen, as well as what should not. This gives us a huge amount of confidence in the screen page itself and all
// of the providers and everything else that's doing work to get our users to that screen page.

// Yes, it may be quite a bit of work to get to this point, but it is 100 percent worth it for all of the confidence
// that we get from this test.

// Isolate Tests by Cleaning up State and Cache ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// There's one other thing that I want to share before moving on. That is we always want to make sure we clean
// things up. As we render through all of this stuff, we're going to be loading the query cache with a bunch of
// information, and we'll want to clear that out.

// I'm going to add an afterEach() for our cleanup. This is going to be an async function, because we want to
// await auth.logout.

// Create Mock msw Server (Extra) /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// We should probably take this window.fetch mark and move it somewhere more and more general, so it can be used
// for all of our integration tests.

// Let's review what we did here. We had a window.fetch mock right here that we just wanted to get rid of,
// because it wasn't giving us enough confidence. We swapped it out for the test server that we already had
// configured for a previous test that we setup.

// That was configured to have all of these server handlers that were already written, so we can handle every
// request that our application makes. These server handlers interact with a database and get our test setup
// before we actually render our app, we interact with that database ourselves.

// Then we also want to make sure that we're in a good non-loading state before we continue with the rest of our
// tests. We enhanced our wait for element to be removed to make sure we're no longer in the loading state, and
// then we also cleaned up after each one of our tests.

// Write Second Integration Test (Extra) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Now that we've been able to test it that we can load this in and all the data shows up, let's handle the use case
// for clicking on the addToList button.

// Let's review what we've got here. For the first part of this test, we need all the same things that we had in our
// last test. We need a user, we need a book, and we need to wait for the loading state to go away.

// Then, we can click on the addToList button. We verified that it's disabled when we click on it. Then we wait for
// the loading state to go away again. Then we can verify that markAsRead shows up, Remove from list shows up,
// the Notes show up, and the startDate is correct.

// Then we verify that addToList isn't there, markAsUnread shouldn't be there, and the star ratings shouldn't be
// there either.

// Abstract Functionality (Extra) ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// There are several things in each of these tests that I think could be shared between them. Let's start with this
// waitForElementToBeRemoved business. We're doing this a couple of times. We could abstract this away as a very
// simple function that simply waitForLoadingToFinish(), and that can be an arrow function that just simply
// returns a call to that.

// Let's review here, all that we did was take two bits of code that were pretty common between both of our tests,
// and abstracted them out into separate functions, so that we can reduce the amount of duplication, and
// potentially use this in other integration tests throughout our code base.

// Custom Render Function (Extra) /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// There's still a fair amount of duplication here, I can see all of that, including the wait for loading to finish
// as well. Why don't we put all of this in a separate function too, so I'm going to make a function and this one,
// I'm going to call it render. I'm going to change the name of the render that I pull from React Testing Library,
// and I'll call that as RTL render.

// Let's review what we did. All that we did is make this render function. This render function simulates the render
// from React Testing Library, except it is async, because in here we can create a user for you automatically, and
// we wait for loading to finish automatically for you.

// You can proceed from your test right after calling render right here. You don't have to worry about waiting for
// loading to finish it up at all. We also navigate to a specific route.

// You can provide a route or we navigate to the default route. Then we allow you to specify your own user if you
// want to or automatically log in as a user. Then we can return that user to you, so you can use its ID or anything
// else that you need for the test that you're going to be writing.

// Global Utils (Extra) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// There's plenty of stuff in here that would be useful throughout our codebase, especially this cleanup. Every
// single test file should probably make sure we clean up all of this stuff, so we don't have to worry about putting
// that in all of our test files.

// Great, things are looking pretty good. Let's go ahead and review what we did. We just removed a ton of code. We
// took all of the generic utilities that we've built inside of this file, and we moved them into this
// app-test-utils module.

// Then reexported all of those, we reexported userEvent, and reexported everything from Testing Library React. We
// only have one file that we need to worry about importing our utilities from.

// We also took the generically useful cleanup that we had in that file and stuck it in here so that every test
// could benefit from the cleanup. We never have to worry about the user being logged in between one test to the
// next, or any of the in-memory databases that we have, and data that was set up in one test and now impacting
// another, which should help in the stability of our test.

// Can Remove List Item for Book (Extra) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Let's review. First, we create our own user, our book, and a listItem. We needed to create our own user and our
// own book, so that we could build a listItem that's associated to that user and that book, and with that,
// we render to the route based on that booksID, as well as the user that we are currently logged in with so that we
// don't log in as a different user.

// Then we find the Remove from list button. We click on that, verify it's disabled. We wait for the loading state
// to go away. Then we verify that Add to list is now in the document, and the Remove from list button that we
// clicked on is no longer in the document.

// Can Mark a List Item as Read (Extra)

// For this next one, let's copy the removeFromListItem because we still want to create our own listItem, and for this test we're going to
// say, "Can mark a list item as read." We have a listItem already, and instead of clicking on the removeFromList, we're going to click on
// markAsRead. This will be our markAsRead button.

// Things are looking super awesome. Let's get rid of that screen debug and review what we've got. Here, we still wanted to create our own
// user and book so that we could create a listItem that's associated to the user and book.

// We also specified a finishDate so that this listItem would not be marked as finished so that we could then say markAsRead and click on
// that. Wait for the loading state to finish when we're finished clicking on that, and then verify that the markAsUnread button shows up
// now.

// We also have the startAndFinishDate node with the properly formatted dates. We have markAsRead is no longer in the document.

// Can Edit a Note (Extra)

// This one's going to be a little bit trickier. For this one, we're going to say can edit a note. The reason
// this is trickier is because editing a note has a debounce involved. The user has to wait for 300 milliseconds
// after they finish typing before we send the update request. That way, we're not sending an update requests for
// every character they type.

// Let's go ahead and review what we've got here now. We wanted to make sure we can edit a note. We needed a user
// and a book, so we can create a ListItem. We render that with that user on that route.

// Then, we create some random notes. We grab our notes text area. We query the text area and type those new
// notes in there. We wait for the loading indicator to show up. By that time, our notes text area has been
// updated, and the ListItem database has that ListItem actually updated.

// Create Component-Specific Utility (Extra)

// Remember when we made this render utility, and it was awesome because we were able to
// share a bunch of common stuff between our tests? As I've been writing this, I've been
// noticing that we have some more common stuff between most of these tests that might be
// nice to abstract away into an abstraction within this test file.

// In review, we identified some similarities between the tests that we had in this file
// and made an in-file utility that we could use across all of our tests. We have this
// renderBookScreen that will accept user, book, and listItem.

// If those are provided, that's great. If they're not, then we'll create them ourselves
// and then we'll forward them along to the render function that is a generic render
// function for all of the tests in our app.

// It handles ensuring that you're logged in as a user, and ensuring that you're on the
// right page, and that your component is wrapped in all of the providers that it's going to
// be wrapped in, when you ship this component to production.

// With this composition of utilities, we have some tests that are pretty easy to
// understand. We say, "Hey, I'm going to render a book screen. This book screen has a
// book that doesn't have a list item, and this is what that book screen should look like."

// Then, for this one, "Hey, I am rendering a book screen as well. This one doesn't have a
// list item. This is what it should look like and how it should behave for a book that
// doesn't have a list item."

// Then for this one, it's a regular book screen. It has a list item, pretty normal
// situation. We're going to remove that list item. Here we're going to mark it as read
// and so on.

// Show Error when Load Fails (Extra)

// Sometimes, errors happen, and we want to make sure that our application functions
// properly when they do. I'm going to add a test that shows an error message when the
// book fails to load. This will be an async test because we will await
// renderBookScreen, except that we want to provide a listItem that is null, so no
// listItem for this book.

// We're using this renderBookScreen utility that we created in this file. We want to have
// a book that doesn't have a listItem because it doesn't even exist in the database,
// so we made a fake book that just has an id of badID. This pretty much just allows us
// to render to the route of book/badID so then we can determine what happens when
// I render the app at that route.

// We can verify when happens with this assertion right here. Things are looking good for
// us. Now we have to deal with this error message.

// Scope Hooks to Describe Block (Extra)

// What do you do when you've got a console.error here that is part of a test that you are
// expecting that error to happen? What we're going to do is I'll have a beforeAll, where
// I'll say jest.spyOn( console, 'error'), and then mock that implementation to do nothing.

// Often, people will use describe blocks to group different tests together in a single
// file. I would rather just make two different test files and they can be run in parallel
// that way too, which is even better. Sometimes, if I want to scope down a couple of hooks
// to a specific set of tests, then I will use a describe block just like this.

// If we save this now, we're not going to run into any errors, and if one of these other
// tests triggers an error...We'll do a console.error inaudible right here. Then we are
// going to see that error message, and we can deal with it in the way that we need to.

// We're in a good place here with our console errors by nesting these hooks for the
// setup of mocking that implementation and the cleanup of mocking that implementation
// within this describe block, so they only apply to this one test.

// Update Failures are Dispalyed (Extra)

// Now what happens if the server has some problem? It sends 400 response or 500, or
// there's something wrong with the server when we request the listItem. To do that,
// we're going to need to handle the request a little differently from the default
// handling that our server has.

// Let's just double check what we've got here. We're going to be testing the no update
// failure. We are using fake timers for this test because I don't want to wait for the
// debounce time for typing into this input.

// We're rendering that book screen and getting that listItem. We configure our server to
// handle put request at that listItem endpoint. It's going to respond with the 400
// response with some json so that our code can handle this and display this message for
// the user.

// We clear the input and type in. We wait for that loading spinner show up, and then we
// wait for it to go away. We verify that the alert shows up indicating that there was a
// problem and displaying the exact message that we sent from our mock request handler.
// We also to verify that the listItems database was not updated with these new nodes.
