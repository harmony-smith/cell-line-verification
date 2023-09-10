// This function takes in the parameters for a tanabe-style reference and returns the concordance amount.
// The mode is an int with 0 being non-empty markers, 1 being query markers, and 2 being reference markers.
//The algorithm is an int with 0 being tanabe, 1 being masters vs query, and 2 being masters vs. reference.
function calculateConcordance(reference, query, mode = 0, algorithm = 0, amelogenin = true, replace) {
  //figures out which name for amelogenin is being used in the refernce
  let referenceAmelogeninName = " ";
  for (let i = 0; i < Object.keys(reference.loci).length; i++) {
    if (["Am", "AM", "am", "Amelogenin", "amelogenin", "AMEL", "amel"].includes(Object.keys(reference.loci)[i])) {
      referenceAmelogeninName = Object.keys(reference.loci)[i];
    }
  }
  
  //figures out which name for amelogenin is being used in the refernce
  let queryAmelogeninName = " ";
  for (let i = 0; i < Object.keys(query.loci).length; i++) {
    if (["Am", "AM", "am", "Amelogenin", "amelogenin", "AMEL", "amel"].includes(Object.keys(query.loci)[i])) {
      queryAmelogeninName = Object.keys(query.loci)[i];
    }
  }

  //if query amel name doesnt match reference name, change query to match reference
  if (referenceAmelogeninName != queryAmelogeninName) {
      let name = queryAmelogeninName;
      const temp = {name: query.loci[name]};

      if (temp.name != undefined) {
        query.loci = {[referenceAmelogeninName]: temp.name, ...query.loci};
        delete query.loci[name];
      }

  }
  
  let numSharedAlleles = 0;
  let numReferenceAlleles = 0;
  let numQueryAlleles = 0;
  
  if (mode == 0) {
    //non-empty marker case

    for (let i = 0; i < Object.keys(query.loci).length; i++) {
      let keyName = Object.keys(query.loci)[i];
      
      //strides through all the shared locations but not amelogenin
      if (keyName in reference.loci && keyName != queryAmelogeninName) {
        if (query.loci[keyName].length > 0 && reference.loci[keyName].length > 0) {
          
          //calculates the num of shared alleles
          for (let j = 0; j < query.loci[keyName].length; j++) {
            if (reference.loci[keyName].includes(query.loci[keyName][j])) {
              numSharedAlleles++;
            }
          }
          
          //calculates the number of query alleles
          numQueryAlleles += query.loci[keyName].length;
          
          //calculates the number of reference alleles
          numReferenceAlleles += reference.loci[keyName].length;
        }
      } else if (keyName == queryAmelogeninName && referenceAmelogeninName != " " && amelogenin) {
        //in the case that we consider amelogenin
        if (query.loci[keyName].length > 0 && reference.loci[referenceAmelogeninName].length > 0) {
          
          //calculates the num of shared alleles
          for (let j = 0; j < query.loci[keyName].length; j++) {
            if (reference.loci[referenceAmelogeninName].includes(query.loci[keyName][j].toLowerCase()) ||
                  reference.loci[referenceAmelogeninName].includes(query.loci[keyName][j].toUpperCase())) {
              numSharedAlleles++;
            }
          }
          
          //calculates the number of query alleles
          numQueryAlleles += query.loci[keyName].length;
          
          //calculates the number of reference alleles
          numReferenceAlleles += reference.loci[referenceAmelogeninName].length;
        }
      }
    }
    
  } else if (mode == 1) {
    //query marker case
    
    for (let i = 0; i < Object.keys(query.loci).length; i++) {
      let keyName = Object.keys(query.loci)[i];
      
      //strides through all the query specific locations but not amelogenin
      if (query.loci[keyName].length > 0 && keyName != queryAmelogeninName) {
        //calculates the num of shared alleles
        if (keyName in reference.loci) {
          for (let j = 0; j < query.loci[keyName].length; j++) {
            if (reference.loci[keyName].includes(query.loci[keyName][j])) {
              numSharedAlleles++;
            }
          }
        }

        //calculates the number of query alleles
        numQueryAlleles += query.loci[keyName].length;

        //calculates the number of reference alleles
        if (keyName in reference.loci){
          numReferenceAlleles += reference.loci[keyName].length;
        }
      } else if (keyName == queryAmelogeninName && amelogenin) {
        //in the case that we consider amelogenin
        if (referenceAmelogeninName != " " && query.loci[keyName].length > 0 && reference.loci[referenceAmelogeninName].length > 0) {
          
          for (let j = 0; j < query.loci[keyName].length; j++) {
            if (reference.loci[referenceAmelogeninName].includes(query.loci[keyName][j].toLowerCase()) || 
                  reference.loci[referenceAmelogeninName].includes(query.loci[keyName][j].toUpperCase())) {
              numSharedAlleles++;
            }
          }
          
          //calculates the number of query alleles
          numQueryAlleles += query.loci[keyName].length;

          //calculates the number of reference alleles
          if (referenceAmelogeninName != " ") {
            numReferenceAlleles += reference.loci[referenceAmelogeninName].length;
          }
        }
      }
    }
  
  } else if (mode == 2) {
    //reference marker case
    
    for (let i = 0; i < Object.keys(reference.loci).length; i++) {
      let keyName = Object.keys(reference.loci)[i];
      
      //strides through all the reference specific locations but not amelogenin
      if (reference.loci[keyName].length > 0 && keyName != referenceAmelogeninName) {
        //calculates the num of shared alleles
        if (keyName in query.loci) {
          for (let j = 0; j < reference.loci[keyName].length; j++) {
            if (query.loci[keyName].includes(reference.loci[keyName][j])) {
              numSharedAlleles++;
            }
          }
        }

        //calculates the number of reference alleles
        numReferenceAlleles += reference.loci[keyName].length;

        //calculates the number of query alleles
        if (keyName in query.loci) {
          numQueryAlleles += query.loci[keyName].length;
        }
      } else if (keyName == referenceAmelogeninName && amelogenin) {
        //in the case that we consider amelogenin
        if (queryAmelogeninName != " " && reference.loci[keyName].length > 0 && query.loci[queryAmelogeninName].length > 0) {
          
          for (let j = 0; j < reference.loci[keyName].length; j++) {
            if (query.loci[queryAmelogeninName].includes(reference.loci[keyName][j].toLowerCase()) ||
                  query.loci[queryAmelogeninName].includes(reference.loci[keyName][j].toUpperCase())) {
              numSharedAlleles++;
            }
          }
          
          //calculates the number of reference alleles
          numReferenceAlleles += reference.loci[keyName].length;

          //calculates the number of query alleles
          if (queryAmelogeninName != " ") {
            numQueryAlleles += query.loci[queryAmelogeninName].length;
          }
        }
      }
    }
  }

  //returns the the concordance amount in percent
  if (algorithm == 0) {
    return (100 * (2 * numSharedAlleles) / (numReferenceAlleles + numQueryAlleles));
  } else if (algorithm == 1) {
    return (100 * (numSharedAlleles) / (numQueryAlleles));
  } else {
    return (100 * (numSharedAlleles) / (numReferenceAlleles));
  }
  
}
