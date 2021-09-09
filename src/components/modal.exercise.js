/** @jsx jsx */
import {jsx} from '@emotion/core'

// It's just a light wrapper around ReachUI Dialog
// 📜 https://reacttraining.com/reach-ui/dialog/
import * as React from 'react'
// 🐨 you're going to need the Dialog component (X)
import {Dialog} from './lib'

const callAll = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args))

// we need this set of compound components to be structurally flexible
// meaning we don't have control over the structure of the components. But
// we still want to have implicitly shared state, so...
// 🐨 create a ModalContext here with React.createContext (X)
const ModalContext = React.createContext()

// 🐨 create a Modal component that manages the isOpen state (via useState)
// and renders the ModalContext.Provider with the value which will pass the
// isOpen state and setIsOpen function (X)
function Modal(props) {
  const [isOpen, setIsOpen] = React.useState(false)

  return <ModalContext.Provider value={[isOpen, setIsOpen]} {...props} />
}

// 🐨 create a ModalDismissButton component that accepts children which will be
// the button which we want to clone to set it's onClick prop to trigger the
// modal to close (X)
// 📜 https://reactjs.org/docs/react-api.html#cloneelement
// 💰 to get the setIsOpen function you'll need, you'll have to useContext!
// 💰 keep in mind that the children prop will be a single child (the user's button)
function ModalDismissButton({children: child}) {
  const [, setIsOpen] = React.useContext(ModalContext)
  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(false), child.props.onClick),
  })
}

// 🐨 create a ModalOpenButton component which is effectively the same thing as
// ModalDismissButton except the onClick sets isOpen to true (X)
function ModalOpenButton({children: child}) {
  const [, setIsOpen] = React.useContext(ModalContext)
  return React.cloneElement(child, {
      onClick: callAll(() => setIsOpen(true), child.props.onClick),
    })
}

// 🐨 create a ModalContents component which renders the Dialog.
// Set the isOpen prop and the onDismiss prop should set isOpen to close (X)
// 💰 be sure to forward along the rest of the props (especially children).
function ModalContents(props) {
  const [isOpen, setIsOpen] = React.useContext(ModalContext)
  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

// 🐨 don't forget to export all the components here
export {Modal, ModalDismissButton, ModalOpenButton, ModalContents}

// Create Compound Components for a Flexible Modal /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Let's start out by making the API that we want to have exist and then we'll go ahead and build that API. What we
// want to be able to do is have a modal component, and inside of that modal component we want to have a control for
// the openButton. We'll have a modalOpenButton.

// Let's review how we made this abstraction. Here, we made a modalContext. That's how we implicitly share some
// state between all of these modal components. The modal is responsible for rendering that contextProvider and
// providing that value to all of the models compound components.

// Those children components consume that context and grab the piece of that contextValue that they need to do their
// job. The dismissButton and openButton have an API that accepts a single child and makes a copy of that child
// setting the onClick prop to update that isOpenState that is implicitly shared from the modal component.

// Then our modal contents component is the one that's responsible for rendering the reach-ui-dialog. It forwards
// along the isOpenState. It also handles the onDismiss callback to update the state that's been implicitly shared.


// Create Compound Components for a Flexible Modal (Extra) /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// We've got a small problem with the way our modal-dismiss-button and modal-open-button work. I can demonstrate that 
// by adding an onClick handler to our button for opening the log in modal.

// In review, what we did here is make this little abstraction here -- that is, a function that accepts any number of 
// functions, and it returns a function that accepts any number of arguments. Then when that's called for each of the 
// functions that were passed, if that function does exist, then we'll call that function with all of the arguments 
// this function was called with.

// If this bit is a little bit confusing, that's OK. You can rewrite this yourself into something that makes a little 
// bit more sense, or you could just inline it like we were doing here if you find that to be slightly simpler.

// If you do end up running into this problem a lot, having a nice abstraction like this is really handy, and that's 
// something I learned firsthand when I was building downshift.