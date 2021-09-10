/** @jsx jsx */
import {jsx} from '@emotion/core'

import {useListItems} from 'utils/list-items'
import {BookListUL} from './lib'
import {BookRow} from './book-row'
import {Profiler} from './profiler'

function ListItemList({filterListItems, noListItems, noFilteredListItems}) {
  const listItems = useListItems()

  const filteredListItems = listItems.filter(filterListItems)

  if (!listItems.length) {
    return <div css={{marginTop: '1em', fontSize: '1.2em'}}>{noListItems}</div>
  }
  if (!filteredListItems.length) {
    return (
      <div css={{marginTop: '1em', fontSize: '1.2em'}}>
        {noFilteredListItems}
      </div>
    )
  }

  return (
    <Profiler
      id="List Item List"
      metadata={{listItemCount: filteredListItems.length}}
    >
      <BookListUL>
        {filteredListItems.map(listItem => (
          <li key={listItem.id} aria-label={listItem.book.title}>
            <BookRow book={listItem.book} />
          </li>
        ))}
      </BookListUL>
    </Profiler>
  )
}

export {ListItemList}

// List item List and Discover Screen List (Extra) ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Let's add some profiling to this list of books on both of these pages, and also some profiling to these books here 
// as well. Both of those listItem pages use this listItem list component so we can just wrap our booklist ul in a 
// profiler.

// Here, we'll render the profiler and we'll put our booklist ul inside of that. Of course, we will need to import 
// the profiler. We'll import { profiler } from 'profiler'. We're in the component's directory here, so it's right 
// next door.

// In review, all that we did here was apply the profiler to two other places in our app. You typically want to put 
// the profiler in very specific parts of your app that you have a feeling might run into a performance regression of 
// some kind.

// The reason that you'll do it localized like we're doing here, rather than just globally around your whole app is 
// because the more localized you are, the more information that you can give to your backend for the graphs that you 
// show to help in the triaging of performance regressions.