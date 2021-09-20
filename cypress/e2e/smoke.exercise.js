// 🐨 visit '/' (📜 https://docs.cypress.io/api/commands/visit.html)
// 📜 https://docs.cypress.io/api/commands/within.html#Syntax
// 📜 https://docs.cypress.io/api/commands/type.html#Syntax
// 💰 https://docs.cypress.io/api/commands/should.html (.should('have.length', 1))
// 📜 https://docs.cypress.io/api/commands/click.html#Arguments
// 🐨 you'll want a fake user to register as: (X)
import {buildUser} from '../support/generate'

describe('smoke', () => {
  it('should allow a typical user flow', () => {
    const user = buildUser()
    cy.visit('/')

    cy.findByRole('button', {name: /register/i}).click()

    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox', {name: /username/i}).type(user.username)
      cy.findByLabelText(/password/i).type(user.password)
      cy.findByRole('button', {name: /register/i}).click()
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /discover/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox', {name: /search/i}).type('Voice of war{enter}')
      cy.findByRole('listitem', {name: /voice of war/i}).within(() => {
        cy.findByRole('button', {name: /add to list/i}).click()
      })
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /reading list/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('link', {name: /voice of war/i}).click()
    })

    cy.findByRole('textbox', {name: /notes/i}).type('This is an awesome book')
    cy.findByLabelText(/loading/i).should('exist')
    cy.findByLabelText(/loading/i).should('not.exist')

    cy.findByRole('button', {name: /mark as read/i}).click()

    // the radio buttons are fancy and the inputs themselves are visually hidden
    // in favor of nice looking stars, so we have to force the click.
    cy.findByRole('radio', {name: /5 stars/i}).click({force: true})

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /finished books/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('radio', {name: /5 stars/i}).should('be.checked')
      cy.findByRole('link', {name: /voice of war/i}).click()
    })

    cy.findByRole('button', {name: /remove from list/i}).click()
    cy.findByRole('textbox', {name: /notes/i}).should('not.exist')
    cy.findByRole('radio', {name: /5 stars/i}).should('not.exist')

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /finished books/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 0)
    })
  })
})

// 🐨 create a fake user (X)
// 🐨 find the button named "register" and click it (X)
// 🐨 within the "dialog" find the username and password fields,
//    type into them the values for your fake user, then click the register
//    button to submit the form (X)
//
// 🐨 within the "navigation", find the link named "discover" and click it (X)
//
// 🐨 within the "main", type in the "searchbox" the title of a book and hit enter (X)
//   💰 when using "type" you can make it hit the enter key with "{enter}"
//   🐨 within the listitem with the name of your book, find the button
//      named "add to list" and click it. (X)
//
// 🐨 click the reading list link in the navigation (X)
//
// 🐨 ensure the "main" only has one element "listitem" (X)
//   🐨 click the link with the name of the book you added to the list to go to the book's page (X)
//
// 🐨 type in the notes textbox
// The textbox is debounced, so the loading spinner won't show up immediately
// so to make sure this is working, we need to wait for the spinner to show up
// and *then* wait for it to go away. (X)
// 🐨 wait for the loading spinner to show up (💰 .should('exist')) (X)
// 🐨 wait for the loading spinner to go away (💰 .should('not.exist')) (X)
//
// 🐨 mark the book as read
// the radio buttons are fancy and the inputs themselves are visually hidden
// in favor of nice looking stars, so we have to the force option to click. (X)
// 🐨 click the 5 star rating radio button (X)
//
// 🐨 navigate to the finished books page (X)
//
// 🐨 make sure there's only one listitem here (within "main") (X)
// 🐨 make sure the 5 star rating radio button is checked (X)
// 🐨 click the link for your book to go to the books page again (X)
//
// 🐨 remove the book from the list (X)
// 🐨 ensure the notes textbox and the rating radio buttons are gone (X)
//
// 🐨 navigate back to the finished books page (X)
//
// 🐨 ensure there are no books in the list (X)

// Register a User in Cypress

// The first thing we want to do here is run site visit/. This is going to visit the home
// route of our application. Thanks to the way that we have things configured here in our
// plugins, where we specified the base URL, it's going to be relative to that URL right
// there. When we say '/', it's going to be relative to this full URL. 0:22 It's going to
// go to http://localhost:3000, for us. That's exactly what it does because of our dev
// server and the way it's set up, this gets redirected to list. That's working out just
// fine for us. We're off to the races. We've got our app up and running.

// irst off, we want to register a new user, so we use the build user utility from support
// generate. Then we use cy.visit to go to the home page of our app. Then we find the
// register button, and we click on it.

// Then, we fill in the registration form within the dialog with that user's user name and
// password. Finally, click on the register button. Ultimately, that takes us to the app in
// our logged-in state.

// Find and Add a Book to Reading

// Now that we've successfully logged in, I want to navigate to the Discover page. We can 
// click on Discover and navigate around here out of book and do all the rest of the stuff 
// we want to do here.

// Once we did all this registration, then we clicked on the Discover link within the 
// navigation and that's useful because that's actually what the user does. 
// They don't just look for text all over the screen and find links that say discover. 
// They're looking at the navigation area.

// This is why it's important for our applications to be accessible, so we can test it like 
// this, just like a regular user would use it, as well as a user with a screen reader.

// That's why we're typically putting everything inside of within, like we're doing here, 
// because we're trying to behave like the user. Then, within our main content area, we're 
// going to say, "Hey, let's find that search box and type in Voice of War," and then 
// let's find the listItem that is named Voice of War, so that has the title of Voice of War.

// Then we'll say findByRole('button') for Add to List, we'll click on that. Then, we'll 
// navigate over to the Reading List and make sure that only one item shows up, the one we 
// just added, and that item happens to be Voice of War, and we'll click on it.

// Mark Book as Read and Rate

// The first thing that we want to do here is run site visit/. This is going to visit the 
// home route of our application. Thanks to the way that we have things configured here in 
// our plugins, where we specified the base URL, it's going to be relative to that URL 
// right there. When we say '/', it's going to be relative to this full URL.

// First off, we want to register a new user, so we use the build user utility from 
// support generate. Then we use cy.visit to go to the home page of our app. Then we 
// find the register button, and we click on it.

// Then, we fill in the registration form within the dialog with that user's user 
// name and password. Finally, click on the register button. Ultimately, that takes us to 
// the app in our logged-in state.

// Remove Book from Reading List

// Now that we're here on the book page with our finished book, let's make sure that we 
// can remove this from our list and verify that the rating goes away and the notes go 
// away from the bottom, and then go through our finished books and verify that it doesn't 
// show up here either.

// I feel confident with my ability to ship my app with these tests and triage any 
// problems that come up if these tests fail because the tools that we have at our 
// disposal are just super great.

// In review, we clicked on the Remove from the list button for this last bit of our test 
// and verified the notes, and the stars don't show up. We went to the finished book page 
// and verified that it was removed from our reading list.