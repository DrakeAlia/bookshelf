import {formatDate} from '../misc'

test('formatDate formats the date to look nice', () => {
    expect(formatDate(new Date('October 18, 1993'))).toBe('Oct 93')
})

// Test formatDate ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// For our first test, I will scope us down to the missModule here. We're only running this one test file. Then I'm 
// going to import { formatDate } from the missModule. We're going to remove the .toDo here and add our test function.

// Now if we ever change anything in a way that breaks that, then we'll be notified in our test. If we remove the year 
// configuration here, then we're going to get an error right there, telling us that we either need to update our test 
// because the requirements change, or we need to update our code because we broke a use case that this code 
// supported before.

// In review, all we had to do here was import what we wanted to test and write a test function here. Inside of our 
// callback, we simply call the function that we're trying to test with some input and then use Jest expect 
// function to make an assertion on what the output of that function is.