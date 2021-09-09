import * as React from 'react'
import {useAuth} from './context/auth-context'
// 🐨 you'll want to render the FullPageSpinner as the fallback (X)
import {FullPageSpinner} from './components/lib'
// 🐨 exchange these for React.lazy calls (X)
// import {UnauthenticatedApp} from './unauthenticated-app'
// import {AuthenticatedApp} from './authenticated-app'

const AuthenticatedApp = React.lazy(() => 
import(/* webpackPrefetch: true */ './authenticated-app')
)
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

// Prefetch the Authenticated App (Extra) ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Let's imagine a scenario where a user comes to our application for the first time, they aren't logged in, so we 
// end up loading the unauthenticated app code. Then the user fills in the log in form, and when they hit submit 
// then we load the authenticated app form. This is going to take a little bit of time, which might make it longer 
// for the user to see their logged in state.

// What if instead we lazy load the authenticated app while the users are filling in the form? We load that code as 
// soon as possible, without slowing down the initial render of our app.

// Because webpack is managing our bundles and chunking our JavaScript modules for us, we have to communicate to 
// webpack that this is something we want to do for a specific module. Webpack has a special API called magic 
// comments that you can put inside of import statements like this one.

// Here, we'll add a comment. It will be webpackPrefetch: true. With that in place, we can come over to our 
// application. Let's turn online back on, so we don't have to wait so long. Let's do empty cache and hard reload 
// here, and look, there it is right there. There's our chunk that we're supposed to lazily load, which is our 
// application.

// All that we needed to do was to leverage the built-in capabilities of the browser by communicating to webpack that 
// we want to enable that optimization for this specific module.

// You wouldn't want to do this for every single dynamic import that you have, just the ones where you're pretty 
// confident that the user's going to need this code soon, which is definitely the case for our authenticated app, 
// because we don't expect users to come to our application without anticipating that they're going to log in.

// There are various other comments like this one that you can use with webpack to further optimize the way that your 
// modules are going to be loaded over the course of your users using your app.

