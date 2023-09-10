//this function takes in an array of queries (queryList) 
//this function takes in algorithm (1 for tanabe, 2 for Masters vs. query, and 3 for Masters vs. reference)
//this function takes in mode (0 for non-empty marker, 1 for query marker. and 2 for reference markers)
//this function takes in amelogenin (true if amelogenin is to be used when comparing the query)
//returns an array of DOM object that contains the corresponding desired tables.
function getClastrResults(query, algorithm, mode, amelogenin) {
	//Getting URL.
    let baseURL = "https://web.expasy.org/cellosaurus-str-search/api/query";
	//Defining various variables.
    let query, markerNames, keyName, algorithmType, scoringMode, includeAmelogenin, outputFormat, fullURL;
	//Declaring an array which will contain the table and its associated data.
	//Creating the URL.
	//Markernames is initially declared as empty.
	markerNames = "";

	for (let j = 0; j < Object.keys(query.loci).length; j++) {
	   keyName = Object.keys(query.loci)[j];

	   if (j == 0) {
	       markerNames += "?";
	   } else {
	       markerNames += "&";
	   }

	   markerNames += `${keyName}=`;

	   let k;
	   for (let k = 0; k < query.loci[keyName].length; k++) {
	       if (k != 0) {
		   markerNames += ",";
	       }

	       markerNames += `${query.loci[keyName][k]}`;
	   }
	}
	//The URL will contain the algorithm, scoring mode, amelogenin and such.
	algorithmType = `&algorithm=${algorithm}`;

	scoringMode = `&scoringMode=${mode + 1}`;

	includeAmelogenin =  `&includeAmelogenin=${amelogenin}`;

	outputFormat = "&outputFormat=json";

	fullURL = baseURL + markerNames + algorithmType + scoringMode + includeAmelogenin + outputFormat;


	//Getting the API.
	let request = new XMLHttpRequest();

	request.open('GET', fullURL);

	request.send();      
	//Adding the data to the resultsArray variable. The data is a JSON object.
	request.onreadystatechange = function() {
	    if (this.status >= 200 && this.status <= 400 && this.readyState == 4) {
		let data = JSON.parse(this.responseText);

		return (makeTable(data)); 

	    } else {
		console.log(`this.readyState: ${this.readyState}`);
	    }
	};

    
}

function makeTable(JSONdata) {
    //makes the table to be returned
  	let table = document.createElement("table");
  
    //makes the header row of the table
  	let headerRow = document.createElement("tr");
    table.appendChild(headerRow);

    //this function adds a header (th) to the headerRow
    let addHeader = function(data, containerRow) {
        let temp = document.createElement("th");
        temp.innerHTML = `${data}`;
        containerRow.appendChild(temp);
    }

    //adds the easily added headers to the DOM table
    addHeader("Accension", headerRow);
    addHeader("Name", headerRow);
    addHeader("No. Markers", headerRow);
    addHeader("Score", headerRow);
    
    //gets the name of all of the markers nad puts it into the allMarkers array
    let allMarkers = [];

    let paramMarkers = JSONdata.parameters.markers

    for (let i = 0; i < Object.keys(paramMarkers).length; i++) {
        if (!allMarkers.includes(paramMarkers[String(i)].name)) {
            allMarkers.push(paramMarkers[String(i)].name);
        }
    }

    for (let i = 0; i < Object.keys(JSONdata.results).length; i++) {
        let currentResult = JSONdata.results[String(i)].profiles["0"].markers;
        for (let j = 0; j < Object.keys(currentResult).length; j++) {
            if (!allMarkers.includes(currentResult[String(j)].name)) {
                allMarkers.push(currentResult[String(j)].name);
            }
        }
    }
  
    //makes a header of all of the markerNames into the table and adds it to the headerRow object
    for (let i = 0; i < allMarkers.length; i++) {
        addHeader(String(allMarkers[i]), headerRow);
    }

    //this function adds the data to a row
    let addCell = function(data, containerRow) {
        let temp = document.createElement("td");
        containerRow.appendChild(temp);
        temp.innerHTML = `${data}`;
    }

    //formats the alleles into a csv-esque format
    let format = function(alleles) {
        console.log(alleles);
        let outputString = "";
        for (let i = 0; i < alleles.length; i++) {
            if (i) {
                outputString += ",";
            }

            outputString += `${alleles[i].value}`;
        }
				console.log(outputString);
        return outputString;
    }

    //make the row for the query
    let queryRow = document.createElement("tr");
    table.appendChild(queryRow);
    addCell("NA", queryRow);
    addCell("Query", queryRow);
    addCell("NA", queryRow);
    addCell("NA", queryRow);
    for (let i = 0; i < allMarkers.length; i++) {
        let markerName = allMarkers[i];
        let exists = false;
        for (let j in JSONdata.parameters.markers) {
          	j = JSONdata.parameters.markers[`${j}`];
            if (j.name == markerName) {
                addCell(`${format(j.alleles)}`, queryRow);
                exists = true;
                break;
            }
        }

        if (!exists) {
            addCell("", queryRow);
        }
    }

    //this function adds a row to the DOM table which contains the data on a specific reference.
    let addRow = (specRef, containerTable) => {
      	specRef = JSONdata.results[`${specRef}`];
      
        let row = document.createElement("tr");
        containerTable.appendChild(row);

        addCell(`${specRef.accession}`, row);
        addCell(`${specRef.name}`, row);
        addCell(`${specRef.profiles["0"].markerNumber}`, row);
        addCell(`${Math.round(specRef.profiles["0"].score * 100) / 100}`, row);

        for (let i = 0; i < allMarkers.length; i++) {
            let markerName = allMarkers[i];
            let exists = false;
            for (let j in specRef.profiles["0"].markers) {
              	j = specRef.profiles["0"].markers[`${j}`];
                if (j.name == markerName) {
                    addCell(`${format(j.alleles)}`, row);
                    exists = true;
                    break;
                }
            }
    
            if (!exists) {
                addCell("", row);
            }
        }
    }

    //adds all of the rows to the table
    for (result in JSONdata.results) {
        addRow(result, table);
    }

    //returns the final table
    console.log(table);
    return table;
}
