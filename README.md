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

# Project Structure
| Directory | Description |
|-----------|-------------|
|/|Configuration files|
|/src/assets|UI enhancers like stylesheets and color constants|
|/src/components|Re-usable components|
|/src/tests|Tests|
|/src/utils|Logic functions, types, and interfaces|
|/src/views|Components in a route|

# Challenge Summary
### Assumptions
- If the count for a range is X, then each integer position in the range’s count is also X. I mainly did this to make the data more ingestible for the chart components, and it seemed like most ranges were from one integer to the same integer. 
- As a result of the first point, this chart disregards decimal position values.
- `counts.json` will always be in the same format.

### Solution
I decided to use [visx](https://airbnb.io/visx/) to create this chart because of its nice default aesthetics and easy-to-use brush element. Having a brush element seemed essential in this case because the 5k+ data points were being crammed into a small chart area. I first tried using nivo and decided to switch over because I would have had to build a brush component from scratch. 

Visx probably wasn’t the quickest solution to use out-of-the-box, but it allowed me to re-use code to make some useful customizations, like the annotations design. To display those, I used d3 scaling to position SVG graphics on the lower chart. 

### Libraries/Tools used
- [visx](https://airbnb.io/visx/) for chart creation
- Create React App project with TypeScript for the web interface
- Jest for testing
- ESLint and Prettier for formatting
- Axios for API calls
- Express.js for the API server

### Future Improvements
- Create a form that lets users input their own data. This might be further improved with an integration with another tool where the data is coming from.
- Try out a Canvas implementation instead of SVG to handle more data points and make the tooltip more responsive. 
- There should be a better way to show the data than just in a list below the chart. Right now, it's not that useful for finding insights.
- Greater test coverage
