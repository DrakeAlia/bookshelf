// this is for extra credit
import React from 'react'
import {client} from 'utils/api-client'

let queue = []

setInterval(sendProfileQueue, 5000)

function sendProfileQueue() {
  if (!queue.length) {
    return Promise.resolve({success: true})
  }
  const queueToSend = [...queue]
  queue = []
  return client('profile', {data: queueToSend})
}

function Profiler({phases, ...props}) {
  function reportProfile(
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  ) {
    if (!phases || phases.includes(phase)) {
    }
    queue.push({
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions,
    })
  }

  return <React.Profiler onRender={reportProfile} {...props} />
}

export {Profiler}

// Custom React.Profiler to Monitor App (Extra) ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// It would be really nice if I had some sort of insight into how my React application is performing in production.
// The React Profiler component allows me to get that insight.

// I'm going to wrap the React Profiler component around my entire application, right here. We'll say React Profiler,
// we'll put everything inside of there. Then the React Profiler component accepts an ID.

// I'm going to wrap the React Profiler component around my entire application, right here. We'll say React Profiler,
// we'll put everything inside of there. Then the React Profiler component accepts an ID.

// Let's stop here really quick and review what we've done. We wanted to get a little bit of insight into how long it
// takes for our entire application to mount at the very start. React exposes this capability with the React.Profiler
// component, but we wanted to control that a little bit further.

// We made our own profiler component here, which has a report profile that takes all of the arguments that report
// profile gets and pushes them onto a queue. Every five seconds, we send to that queue to our back-end API at the
// profile endpoint.
