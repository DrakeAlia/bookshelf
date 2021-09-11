/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import { queryCache } from 'react-query'
import * as auth from 'auth-provider'
import {client} from 'utils/api-client'
import {useAsync} from 'utils/hooks'
import {FullPageSpinner, FullPageErrorFallback} from 'components/lib'

async function getUser() {
  console.log('getUser')
  let user = null

  const token = await auth.getToken()
  if (token) {
    const data = await client('bootstrap', {token})
    queryCache.setQueryData('list-items', data.listItems, {
      staleTime: 5000,
    })
    user = data.user
  }

  return user
}

const AuthContext = React.createContext()
AuthContext.displayName = 'AuthContext'

// we need to call getUser() sooner.
// 🐨 move the next line to just outside the AuthProvider (X)
// 🦉 this means that as soon as this module is imported,
// it will start requesting the user's data so we don't
// have to wait until the app mounts before we kick off
// the request.
// We're moving from "Fetch on render" to "Render WHILE you fetch"!
const userPromise = getUser()

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
    console.log('useEffect')
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

  const value = React.useMemo(() => ({user, login, logout, register}), [
    login,
    logout,
    register,
    user,
  ])

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

// Fetch User before AuthProvider Mounts ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Let's take a look at the problem here first. If I right click here with the DevTools open, I'll see this empty 
// cache and hard reload. Let's try that.

// We'll see this waterfall effect of everything that happens as the user comes on to our page. I'm going to drag 
// this over here, so we can scope this down to just what's happening at the very start.

// Literally all that we did is we took this one line, which was called after the authProvider's mounted. We moved 
// it out of the authProvider entirely, so that it's called at the same time the authProvider is defined, giving us 
// a little bit of time to start getting the user's information when the app is loading.

// Preload All Initial Data (Extra) /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// For the extra credit we've got another little optimization that we can make here, and that is we get the user's 
// information. Then we wait until that user's information comes back before we go to get the user's list items. 
// We have a waterfall effect between those two requests.

// It would be better if we make both of those requests at the same time, because if we have the user's token and 
// they're logged in, we may as well get the user's username while we're getting all of the user's list items.

// In review, what we did here is we updated our getUser to call the bootstrap endpoint instead, which will not only 
// give us the user but also give the user's list items, as well.

// Then we can use that to set that into the queryCache, so that any component that uses those list items will have 
// immediate access to them, rather than having to request them.

// Then we prevented react-query from attempting to update that cache for five seconds, so that our components have 
// time to render and display that data without react-query bothering to update that data, without react-query 
// automatically assuming that data is stale. 