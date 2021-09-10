import * as React from 'react'
import {wrap} from 'components/profiler'

function useSafeDispatch(dispatch) {
  const mounted = React.useRef(false)
  React.useLayoutEffect(() => {
    mounted.current = true
    return () => (mounted.current = false)
  }, [])
  return React.useCallback(
    (...args) => (mounted.current ? dispatch(...args) : void 0),
    [dispatch],
  )
}

// Example usage:
// const {data, error, status, run} = useAsync()
// React.useEffect(() => {
//   run(fetchPokemon(pokemonName))
// }, [pokemonName, run])
const defaultInitialState = {status: 'idle', data: null, error: null}
function useAsync(initialState) {
  const initialStateRef = React.useRef({
    ...defaultInitialState,
    ...initialState,
  })
  const [{status, data, error}, setState] = React.useReducer(
    (s, a) => ({...s, ...a}),
    initialStateRef.current,
  )

  const safeSetState = useSafeDispatch(setState)

  const setData = React.useCallback(
    data => safeSetState({data, status: 'resolved'}),
    [safeSetState],
  )
  const setError = React.useCallback(
    error => safeSetState({error, status: 'rejected'}),
    [safeSetState],
  )
  const reset = React.useCallback(
    () => safeSetState(initialStateRef.current),
    [safeSetState],
  )

  const run = React.useCallback(
    promise => {
      if (!promise || !promise.then) {
        throw new Error(
          `The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?`,
        )
      }
      safeSetState({status: 'pending'})
      return promise.then(
        wrap(data => {
          setData(data)
          return data
        }),
        wrap(error => {
          setError(error)
          return error
        }),
      )
    },
    [safeSetState, setData, setError],
  )

  return {
    // using the same names that react-query uses for convenience
    isIdle: status === 'idle',
    isLoading: status === 'pending',
    isError: status === 'rejected',
    isSuccess: status === 'resolved',

    setData,
    setError,
    error,
    status,
    data,
    run,
    reset,
  }
}

export {useAsync}

// Profile All Updates in an Interaction (Extra) ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// As great as it is that we can track this interaction, there are several others state updates that happen as well as
// a result of this interaction that just happened later. I want to capture all of those state updates, and associate
// that to this interaction.

// In review, what we did here is we imported unstable_wrap, we erased it as wrap from the scheduler/tracing module.
// Then down here, inside of our run callback, we wrapped all the functions that we knew we're going to run later as
// a result of this interaction.

// One other thing that I want to do here is I don't want to import scheduler/tracing all over the place. I'd rather
// have all of my profiler stuff in my profiler module. I'm going to export { unstable_trace as trace, unstable_wrap
// as wrap } from "scheduler/tracing". With that now, I can import trace from the profiler module right here.
// I can import wrap from the components/profiler module there.

// Now I have the ability to give all of the information needed for the production performance monitoring to be
// really useful and helping me triage performance bottlenecks that my users experience in production.
