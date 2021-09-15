// 🐨 instead of React Testing Library, you'll use React Hooks Testing Library (X)
import {renderHook, act} from '@testing-library/react-hooks'
// 🐨 Here's the thing you'll be testing:
import {useAsync} from '../hooks'

// 💰 I'm going to give this to you. It's a way for you to create a promise
// which you can imperatively resolve or reject whenever you want.
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
test('calling run with a promise which resolves', async () => {
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
})
// 🐨 get a promise and resolve function from the deferred utility
// 🐨 use renderHook with useAsync to get the result
// 🐨 assert the result.current is the correct default state

// 🐨 call `run`, passing the promise
//    (💰 this updates state so it needs to be done in an `act` callback)
// 🐨 assert that result.current is the correct pending state

// 🐨 call resolve and wait for the promise to be resolved
//    (💰 this updates state too and you'll need it to be an async `act` call so you can await the promise)
// 🐨 assert the resolved state

// 🐨 call `reset` (💰 this will update state, so...)
// 🐨 assert the result.current has actually been reset

test('calling run with a promise which rejects', async () => {})
// 🐨 this will be very similar to the previous test, except you'll reject the
// promise instead and assert on the error state.
// 💰 to avoid the promise actually failing your test, you can catch
//    the promise returned from `run` with `.catch(() => {})`

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