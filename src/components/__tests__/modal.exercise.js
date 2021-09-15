// 🐨 you're gonna need this stuff: (X)
import React from 'react'
import {render, screen, within} from '@testing-library/react'
import {Modal, ModalContents, ModalOpenButton} from '../modal'
import userEvent from '@testing-library/user-event'

// 🐨 render the Modal, ModalOpenButton, and ModalContents (X)
// 🐨 click the open button (X)
// 🐨 verify the modal contains the modal contents, title, and label (X)
// 🐨 click the close button (X)
// 🐨 verify the modal is no longer rendered (X)
// 💰 (use `query*` rather than `get*` or `find*` queries to verify it is not rendered)
test('can be opened and closed', () => {
  const label = 'Modal Label'
  const title = 'Modal Title'
  const content = 'Modal content'
  render(
    <Modal>
      <ModalOpenButton>
        <button>Open</button>
      </ModalOpenButton>
      <ModalContents aria-label={label} title={title}>
        <div>Modal content</div>
      </ModalContents>
    </Modal>,
  )
  userEvent.click(screen.getByRole('button', {name: /open/i}))

  const modal = screen.getByRole('dialog')
  expect(modal).toHaveAttribute('aria-label', label)
  const inModal = within(modal)
  expect(inModal.getByRole('heading', {name: title})).toBeInTheDocument()
  expect(inModal.getByText(content)).toBeInTheDocument()

  userEvent.click(screen.getByRole('button', {name: /close/i}))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})


// Modal Compound Components /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// For our modal test we've got this todo test in here. Let's get rid of that todo, and add our test function here. 
// Now let's think about how we expect this modal to be used.

// If we pull up the unauthenticated app than we can see exactly how it is used currently. We can copy that, and 
// paste in a render right here. Then we know a couple of things that we're going to need.

// In review, what we did here is take the typical usage of the components that we wanted to test here, and we put 
// that directly into our test. Then we interacted with it in the same way the user would.

// Looking for a button that says open, we clicked on that, we verified that the modal had an aria-label, so it 
// worked nicely with screen readers. We verified that there was a heading within the modal that had the right 
// title, and it had the right content.

// We verified that the user could close the modal, and we verified that the modal was indeed closed.