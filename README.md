# rna-seq-visualization

A web app that visualizes RNA sequencing data.

https://user-images.githubusercontent.com/17756417/148440880-fee4b5ff-a5b1-436e-b02d-f1678d4f157b.mov



### Getting started

1. Check that nothing is running on port 3000.
2. Run the following commands in the root directory:
```
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Testing

1. Run the following command:
```
npm test
```
2. Follow the instructions in your terminal to proceed with testing (Press `a` to run all test).

# Challenge Summary
### Assumptions
- If the count for a range is X, then each integer position in the range’s count is also X. I mainly did this to make the data more ingestible for the chart components, and it seemed like most ranges were from one integer to the same integer. 
- As a result of the first point, this chart disregards decimal position values.
- `counts.json` will always be in the same format.

### Solution
I used Airbnb’s visx to create this chart because of its nice default aesthetics and easy-to-use brush element. Having a brush element seemed essential in this case because the 5k+ data points were being crammed into a small chart area. I first tried using nivo and decided to switch over because it doesn’t have a brush component, and it would have taken a while to build one from scratch with d3. 

I chose an area chart because counts are a total of overlapping reads, and it would have that “overlapping feeling from position to position.

To display the provided annotations, I added simple SVG graphics to the chart. 

### Libraries/Tools used
- visx for chart creation
- Create React App project with TypeScript for the web interface
- Jest for testing
- ESLint and Prettier for formatting
- Axios for API calls
- Express.js for the API server

### If it was a bigger project
- I would create a form that lets users input their own data.
- I would try out a Canvas implementation instead of SVG to handle more data points and make the tooltip more responsive. 
- There could be a better way to show the data than just in a list below the chart. 
