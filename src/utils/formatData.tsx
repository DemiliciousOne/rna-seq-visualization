// logic for transforming data from JSON format to be easily ingestible by chart components

// Creates list of annotations with 'range' changed to a tuple/list
export const formatAnnotations = (annotations: any) => {
  let newAnnotationsList = [];
  for (var y in annotations[0]) {
    let name = annotations[0][y].Gene;
    let range = [annotations[0][y].range[0].start, annotations[0][y].range[0].end];
    newAnnotationsList.push({ gene: name, range: range });
  }
  return newAnnotationsList;
};

// Creates list of position (integer) and count pairs
export const formatData = (counts: any) => {
  let newCountsList = [];
  for (var x in counts) {
    for (let step = counts[x].range[0].start; step <= counts[x].range[0].end; step++) {
      let count = counts[x].count;
      let point = {
        count: count,
        position: step
      };
      newCountsList.push(point);
    }
  }
  return newCountsList;
};
