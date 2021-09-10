/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import * as auth from 'auth-provider'
import {client} from 'utils/api-client'
import {useAsync} from 'utils/hooks'
import {FullPageSpinner, FullPageErrorFallback} from 'components/lib'

async function getUser() {
  let user = null

  const token = await auth.getToken()
  if (token) {
    const data = await client('me', {token})
    user = data.user
  }

  return user
}

const AuthContext = React.createContext()
AuthContext.displayName = 'AuthContext'

function AuthProvider(props) {
  const {
    data: user,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
    status,
  } = useAsync()

  React.useEffect(() => {
    const userPromise = getUser()
    run(userPromise)
  }, [run])

  const login = React.useCallback(
    form => auth.login(form).then(user => setData(user)),
    [setData],
  )
  const register = React.useCallback(
    form => auth.register(form).then(user => setData(user)),
    [setData],
  )
  const logout = React.useCallback(() => {
    auth.logout()
    setData(null)
  }, [setData])

  const value = React.useMemo(
    () => ({user, login, register, logout}),
    [login, logout, register, user],
  )

  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />
  }

  if (isSuccess) {
    return <AuthContext.Provider value={value} {...props} />
  }

  throw new Error(`Unhandled status: ${status}`)
}

function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error(`useAuth must be used within a AuthProvider`)
  }
  return context
}

function useClient() {
  const {
    user: {token},
  } = useAuth()
  return React.useCallback(
    (endpoint, config) => client(endpoint, {...config, token}),
    [token],
  )
}

export {AuthProvider, useAuth, useClient}


// Memoize Context (Extra) /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Earlier when we we're rendering this AuthContext.Provider, you may have seen this value and had a little bit of a 
// kneejerk reaction because you know that any time you pass a value to a provider, if you're creating that value 
// during render, that's going to trigger all of the consumers to re-render anytime this provider re-renders 
// because if the provider value changes between renders, all consumers will be re-rendered to get that change update.

// This optimization and all of this complexity is not at all necessary. We can go ahead and leave it in there, 
// especially for these useCallbacks here, just in case somebody wants to put those in a dependency list, but even 
// then, because the function body is not going to run unless we are doing a full-on re-render of our whole app, 
// that's probably not going to be a problem either.

// It's important that you measure before and after before adding complexity to your code base because you could end 
// up creating a really big object here having a ton of dependencies, and if you make one mistake in one of those 
// dependencies by not memoizing it properly, then not only have you added the complexity, but you've also undone 
// all of the memoization that you're trying to accomplish anyway.

// Just be careful as you're adding these optimizations. Remember that an optimization always comes with a cost but 
// doesn't always come with a benefit.

// The reason I wanted to show you this isn't just to tell you to never use useCallback or useMemo or optimize your 
// contextValue because very often, you do want to do these things. It just so happens that this particular context 
// provider doesn't really need that optimization.

// What you should take away from this extra credit is that it's important that you measure before and after and 
// consider all of the impacts of your changes, rather than just assuming that an optimization is going to make 
// things faster.