import * as React from 'react'
import {useAuth} from './context/auth-context'
// 🐨 you'll want to render the FullPageSpinner as the fallback (X)
import {FullPageSpinner} from './components/lib'
// 🐨 exchange these for React.lazy calls (X)
// import {UnauthenticatedApp} from './unauthenticated-app'
// import {AuthenticatedApp} from './authenticated-app'

const AuthenticatedApp = React.lazy(() => import('./authenticated-app'))
const UnauthenticatedApp = React.lazy(() => import('./unauthenticated-app'))

function App() {
  const {user} = useAuth()
  // 🐨 wrap this in a <React.Suspense /> component (X)
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </React.Suspense>
  )
}

export {App}


// Improve the Time to First Meaningful Paint ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// When the user loads the application, this is the first component that we're actually going to render. It's this 
// app component that uses the useAuth hook to render the authenticated app if we have the user logged in or the 
// unauthenticated app if we don't.

// We've loaded all of the code for entire application under this authenticated app, and it's totally unnecessary. It 
// would make a lot more sense to just load the unauthenticated app first. When the user's logged in, then we can 
// load the authenticated app.

// If you do Cmd+Shift+P or Ctrl+Shift+P and search for coverage, then that will show up in the drawer here. Here, 
// we're going to click on start instrumenting coverage and reload page. That will record all of the code that's 
// actually being used on this page.

// In review, all that we did here is we swapped those static imports for dynamic imports. Now neither one of these 
// is going to appear in our main bundle. Then we had to update these modules to export by default, because that is 
// required by React.lazy, that the module that's being imported has a default export that is a component.

// Because of the way we have things set up in our workshop, we also had to re-export that default export from our 
// exercise files. Then we are able to lazily load that code and render that within a Suspense component, so we could 
// provide a fallback while we're waiting for that code to load.