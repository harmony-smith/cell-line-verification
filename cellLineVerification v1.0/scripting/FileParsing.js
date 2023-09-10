// FINAL RESULT OF EACH PARSED FILE
let queries;
let defined = 0;
let customReferences;
let p;
let old = 0;

// FOR QUERY: gets file, leads into fileParse
function fileGrabQuery(file){
    //grabs file info as stringResults
    let fileReader = new FileReader(); //reads content of file
    fileReader.addEventListener("load", event => {
        let stringResults = event.target.result;
        //decide what file type it is
        let fileType = file.name.split(".").pop();
        old = 0;
        //initiates file parsing
        queries = fileParse(stringResults, fileType);
        defined = 1;
    });
    if (typeof file != Blob) {
        defined = 0;
        queries = ["0"];
    }
    fileReader.readAsText(file); //reads content as text to activate load for event listener
}

function fileGrabRef(file){
    //grabs file info as stringResults
    let fileReader = new FileReader(); //reads content of file
    fileReader.addEventListener("load", event => {
        customRef = true;
        let stringResults = event.target.result;
        //decide what file type it is
        let fileType = file.name.split(".").pop();

        //initiates file parsing
        customReferences = fileParse(stringResults, fileType);
        for (let x = 0; x < customReferences.length; x++) {
            customReferences[x].modelIdentification.shift();
            customReferences[x].modelIdentification.unshift(x+1);
        }
    });
    if (typeof file !== Blob) {
        customRef = false;
    }
    fileReader.readAsText(file); //reads content as text to activate load for event listener
}

//parses file, leads into csvHandeling 
function fileParse(stringResults, fileType){
    if (fileType === "csv") {
        //if its csv split it into an array based upon new lines, each element of array is a row in file
        let valuesArray = stringResults.split(/\r?\n|\r/);
        //passes it to handeling for csv files
        return csvHandeling(valuesArray);
    } else {
        //yield error because wrong file type
        alert("Incorrect File Type: please enter a CSV file and try again.");
    }
}

function csvHandeling(array){
      //needs to clean extra commas to keep data together
      //there are commas within cells so it switches them with "^" to avoid splitting the cells
      let isComma = false;
      for(y = 0; y < array.length; y++){
          for(x = 0; x < array[y].length; x++){
              if(array[y].charAt(x) == "\""  && !isComma){
                  isComma = true;
              }
              else if(array[y].charAt(x) == "\""  && isComma){
                  isComma = false;
              }
              if(isComma && array[y].charAt(x) == ","){
                  array[y] = array[y].replaceAt(x,"^");
              }
          } 
      }

      //breaks array into multidimentional array
      for(let x = 0; x < array.length; x++){
          array[x] = array[x].split(",");
      }

      //finds which column has mod_id and deletes everything before it, deletes everything between mod_id and AM, deletes everything after the last loci
      let correctColumn = 0;
      while(array[0][correctColumn] != "mod_id" && array[0][correctColumn] != "name" && array[0][correctColumn] != "Name" && array[0][correctColumn] != "sample" && array[0][correctColumn] != "sample"){
          correctColumn ++;
      }
      for(let y = 0; y < array.length; y++){
          array[y].splice(0,correctColumn);
      }

      correctColumn = 0;

      for(x = 0; x < array[0].length; x++){
          if(array[0][x].slice(0,3) == "mod" && array[0][x] != "mod_id"){
              correctColumn = x;
          }
      }
      if(correctColumn > 0){
          for(let y = 0; y < array.length; y++){
              array[y].splice(correctColumn,array[0].length - 1);
          }
      }
      for(y = 0; y < array.length; y++){
        for(x = 0; x < array[y].length; x++){
            for(z = 0; z < array[y][x].length; z++){
                if(array[y][x].charAt(z) == "\""){
                    array[y][x] = array[y][x].substr(1);
                    array[y][x] = array[y][x].substr(0, array[y][x].length - 1);
                }
            }
        }
    }

    for(y = 0; y < array.length; y++){
        for(x = 1; x < array[y].length; x++){
            array[y][x] = array[y][x].split("^");
        }
    }

    //object maker 
    let objArray = [];
    let loci = {};
    for(let y = 1; y < array.length; y++){
        tempObj = {}
        loci  = {};
        for(x = 1; x < array[y].length; x++){
            if (array[y][x][0] !== "" && array[y][x][0] !== "{null}" && array[y][x][0] !== "0") {
                for (let i = 0; i < array[y][x].length; i++) {
                    if (array[y][x][i] === "") {
                        array[y][x].splice(i);
                    }
                }
                loci[array[0][x]] = array[y][x];
            }
        }
        tempObj.loci = loci;
        tempObj.modelIdentification = array[y][0];
        objArray[y - 1] = tempObj;
    }
    for(let y = 0; y < objArray.length; y++){
        if(objArray[y].modelIdentification === "" || objArray[y].modelIdentification === undefined || objArray[y].modelIdentification === null || objArray[y].modelIdentification === "<empty string>"){
            objArray.splice(y,1);
            y--;
        }
    }

    for (let y in objArray) { //takes the mod idenification and changes it to be ["1", "ID"]
        let x = ["1"];
        x.push(objArray[y].modelIdentification);
        objArray[y].modelIdentification = x;
    }

    return objArray;
}

function inputParsing() { //consolidates the individual marker input into main query array
    let q;
    let temp;
    p = 0;

    //grabs input from boxes
    for (let x = 0; x < 16; x++) {
        if (document.getElementById(`input`+ (x+1)).value.length != 0){
            if (p == 0) {
                temp = {[names[x]]:[document.getElementById(`input`+ (x+1)).value]};
                temp[names[x]] = temp[names[x]][0].split(",");
                p++;
            } else {
                temp[names[x]] = [document.getElementById(`input`+ (x+1)).value];
                temp[names[x]] = temp[names[x]][0].split(",");
            }
        }
    }

    //dedcides where in query array to add the new query
    if (p != 0) {
        q = {"loci":[0], "modelIdentification":["1"]};
        q.loci = temp;
        if (defined == 0) { //if input box query is new, it replaces the old input query
            queries = ["0"]; //if there are other queries from the file input, it get puts at the front
            queries[0] = q;
        } else {
            if (q != queries[0] && old != 0) {
                queries.shift();
                queries.unshift(q);
            } else {
                queries.unshift(q);
            }
        }
        old = queries[0];
    } else { //if input box query was deleted, delete old query entry
        if (old != 0) {
            queries.shift();
        }
        old = 0;
    }
}

//method to replace characters in a string based upon index
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length, this.length);
}

