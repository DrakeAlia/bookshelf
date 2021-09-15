// 🐨 instead of React Testing Library, you'll use React Hooks Testing Library (X)
import {renderHook, act} from '@testing-library/react-hooks'
// 🐨 Here's the thing you'll be testing:
import {useAsync} from '../hooks'

// 💰 I'm going to give this to you. It's a way for you to create a promise
// which you can imperatively resolve or reject whenever you want. (X)
// function deferred() {
//   let resolve, reject
//   const promise = new Promise((res, rej) => {
//     resolve = res
//     reject = rej
//   })
//   return {promise, resolve, reject}
// }

// Use it like this:
// const {promise, resolve} = deferred()
// promise.then(() => console.log('resolved'))
// do stuff/make assertions you want to before calling resolve
// resolve()
// await promise
// do stuff/make assertions you want to after the promise has resolved

// 🐨 flesh out these tests

// 🐨 get a promise and resolve function from the deferred utility (X)
// 🐨 use renderHook with useAsync to get the result (X)
// 🐨 assert the result.current is the correct default state (X)

// 🐨 call `run`, passing the promise (X)
//    (💰 this updates state so it needs to be done in an `act` callback)
// 🐨 assert that result.current is the correct pending state (X)

// 🐨 call resolve and wait for the promise to be resolved (X)
//    (💰 this updates state too and you'll need it to be an async `act` call so you can await the promise)
// 🐨 assert the resolved state (X)

// 🐨 call `reset` (💰 this will update state, so...) (X)
// 🐨 assert the result.current has actually been reset (X)

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual({
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'idle',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
  })

  let p
  act(() => {
    result.current.run(promise)
  })

  expect(result.current).toEqual({
    isIdle: false,
    isLoading: true,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'pending',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
  })

  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    resolve(resolvedValue)
    await p
  })

  expect(result.current).toEqual({
    isIdle: false,
    isLoading: false,
    isError: false,
    isSuccess: true,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'resolved',
    data: resolvedValue,
    run: expect.any(Function),
    reset: expect.any(Function),
  })

  act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual({
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'idle',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
  })
})


// 🐨 this will be very similar to the previous test, except you'll reject the
// promise instead and assert on the error state.
// 💰 to avoid the promise actually failing your test, you can catch
//    the promise returned from `run` with `.catch(() => {})`
test('calling run with a promise which rejects', async () => {
    const {promise, reject} = deferred()
    const {result} = renderHook(() => useAsync())
    expect(result.current).toEqual({
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
      setData: expect.any(Function),
      setError: expect.any(Function),
      error: null,
      status: 'idle',
      data: null,
      run: expect.any(Function),
      reset: expect.any(Function),
    })
  
    let p
    act(() => {
      p = result.current.run(promise)
    })
  
    expect(result.current).toEqual({
      isIdle: false,
      isLoading: true,
      isError: false,
      isSuccess: false,
      setData: expect.any(Function),
      setError: expect.any(Function),
      error: null,
      status: 'pending',
      data: null,
      run: expect.any(Function),
      reset: expect.any(Function),
    })
  
    const rejectedValue = Symbol('rejected value')
    await act(async () => {
      reject(rejectedValue)
      await p.catch(() => {
        //  ignore error
      })
    })
  
    expect(result.current).toEqual({
      isIdle: false,
      isLoading: false,
      isError: true,
      isSuccess: false,
      setData: expect.any(Function),
      setError: expect.any(Function),
      error: rejectedValue,
      status: 'rejected',
      data: null,
      run: expect.any(Function),
      reset: expect.any(Function),
    })
  
    act(() => {
      result.current.reset()
    })
  
    expect(result.current).toEqual({
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
      setData: expect.any(Function),
      setError: expect.any(Function),
      error: null,
      status: 'idle',
      data: null,
      run: expect.any(Function),
      reset: expect.any(Function),
    })
})

test('can specify an initial state', async () => {})
// 💰 useAsync(customInitialState)

test('can set the data', async () => {})
// 💰 result.current.setData('whatever you want')

test('can set the error', async () => {})
// 💰 result.current.setError('whatever you want')

test('No state updates happen if the component is unmounted while pending', async () => {})
// 💰 const {result, unmount} = renderHook(...)
// 🐨 ensure that console.error is not called (React will call console.error if updates happen when unmounted)

test('calling "run" without a promise results in an early error', async () => {})


// Set up useAsync Test with renderHook ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// It looks like this useAsync hook has a lot to do, so let's do it. Let's get rid of the todos. We'll make an
// async test here because we are testing something asynchronous. We'll probably need to await some stuff here.

// What we did here is, we called useAsync. When we called it by itself, we realized that we can't do that
// because that can only happen within the body of a function component when React is rendering that function
// component.

// We're using react-hooks-testing-library and the renderHook method from it to manage creating a function
// component and calling our useAsync hook here within the function body of that function component.

// That returns a couple utilities, as well as the result, which is whatever we return from useAsync. Then, we
// can assert what we get back.

// Wrap an act around an async Fucntion /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// All right, so I've organized some of these values here to make it a little bit easier. The next thing we want to
// do is call this run function, and make sure that the state update's appropriately from that.

// We'll say result.current.run, and we'll call that. Now we're going to get an error that says, "Hey, the
// argument passed to useAsync.run must be a promise," and we didn't pass anything. Let's make a promise to
// handle this for us.

// Now we're one step closer where we call the run function, and we can assert on all of the change state, because
// of that run function being called.

// We also noticed an act warning, and because we're triggering a state update directly when we call this run
// function we need to tell React that, yes, we are expecting this to happen. We want all of those effects to be
// flushed when we finish running all of this stuff we're doing inside this callback.

// This ensures that we're asserting the same UI type that the end-user would be interacting with when we make our
// assertions.

// Add an async act to Resolve a Promise /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Now that we've run this, and we made an assertion on running this, useAsyncFunction, we're going to resolve this
// promise and see what happens next. We'll say resolve, which is going to call this resolve function, which will
// trigger this promise to resolve. Then our useAsyncHook will update the state because it attached event handler to
// that promise.

// In review, for this one, when we called this resolve it did trigger that update but it happened asynchronously.
// We've got an act warning telling us that, "Hey, there was a state update and I don't think that you were expecting
// that." Which of course we really were, but we weren't communicating that in our code, and it resulted in our
// result.current not getting updated properly.

// We added an async act to resolve this promise to that specific value. Then we waited for the promise we get back
// from run to resolve before continuing on to make our assertion.

// Reset React in a Test ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// One last thing that I want to do here is make sure that I could reset the state. We'll say result.current.reset. 
// We'll expect all of this stuff to be reset to what it was originally. At first assertion, I'll copy that paste it 
// right here, and this should pass, which it does, but we are again getting this act warning.

// Great, so that gets us our first use case for calling run with a promise that resolves, and we can assert on 
// every state change that happens throughout that process.

// Call Run with a Promise That Rejected ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Now, our rejection test will be very similar to our previous one, so I'm going to copy all of this, and we'll 
// paste it right here. We'll save that. Of course, it's going to pass because it's a copy. This time, instead of 
// resolve, we're going to reject.

// Great, so now our test is passing, things are looking great, and we can review. All that we did was copy the 
// previous test. We're doing very much the same thing. We grabbed reject instead of resolve, and then we called 
// reject instead of resolved here with a rejectedValue.

// We verified that our status was successfully set to rejected. Our data is null, our error is the rejected value, 
// isError is true and isSuccess is false. Then we're still able to reset us back to the original state.