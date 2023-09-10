// Main Javascript
let q;
let settings = {};
let customRef = false;
let topscores = [["0","0"], ["0","0"], ["0","0"]];


window.onload = () => {
    //parse file upon upload
    document.getElementById("queryUpload").addEventListener("change", event => { //query
        fileGrabQuery(event.target.files[0]); //first file selected by user
        
    });

    document.getElementById("refUpload").addEventListener("change", event => { //ref
        fileGrabRef(event.target.files[0]); //first file selected by user
        
    });

    //compare button
    document.getElementById("compareButton").addEventListener("click",() => {
        if (customRef == true) {
            references = customReferences;
        } else {
            references = referenceDatabase;
        }
        settings = settingsGrab();
        inputParsing();
        compare();
    });
};

// compare ref with query
function compare() {
    let tableDiv = document.getElementById("concordanceResults");
    document.getElementById("results").style.display = "block";
    for (let element of Array.from(tableDiv.children)) {
        element.remove();
    }

    for (q = 0; q < queries.length; q++) {
        //compare each reference against query and make array of top 3 scoring references
        topscores = [["0","0"], ["0","0"], ["0","0"]];
        for (let i = 0; i < references.length; i++) {
            let x = Math.round(calculateConcordance(references[i], queries[q], settings.mode, settings.algorithm, settings.amelogenin)*100)/100;
            if (x > topscores[2][1]) {
                if (x > topscores[1][1]) {
                    if (x > topscores[0][1]) {
                        topscores.unshift([i, x]);
                    } else {
                        topscores.splice(1, 0, [i, x]);
                    }
                } else {
                    topscores.splice(2, 0, [i, x]);
                }
            }
        }
        //build table here
        tableDiv.appendChild(createResultsTable(references[topscores[0][0]], queries[q], topscores[0][1]));
    }
}

// generate table for single query
function createResultsTable(reference, query, concordancePercentage) {
    let table = document.createElement("table");
    let markers = [...names];

    for (let x = 0; x < 3; x++) {

        reference = references[topscores[x][0]];
        concordancePercentage = topscores[x][1];

        let alleles = Object.keys(query.loci);
        for (let key of Object.keys(reference.loci)) {
            if (!alleles.includes(key)) {
                alleles.push(key);
            }
        }

        alleles.unshift("");
        let tempTD, tempData;
        let w = 0;
        let y = 0;

        for (let i = 0; i < 3; i++) {

            let length = 0;
            table.appendChild(document.createElement("tr"));
            for (let allele of alleles) {

                if (i == 0 && x == 0) { //build marker row at top
                    tempTD = table.lastChild.appendChild(document.createElement("th"));
                    if(allele == "am" || allele == "AM" || allele == "Amelogenin" || allele == "AMEL" || allele == "amel" || allele == "amelogenin" || allele == "Am") {
                        tempTD.appendChild(document.createTextNode("AMEL"));
                    } else {
                        tempTD.appendChild(document.createTextNode(allele)); 
                    }

                    if (y==0) {
                        tempTD.appendChild(document.createTextNode("Cell Line"));
                        y++;
                    }
                    if (w == 0) {
                        tempTD = table.lastChild.appendChild(document.createElement("th"));
                        tempTD.appendChild(document.createTextNode("Score"));
                        w++;
                    }

                    if(allele == "am" || allele == "AM" || allele == "Amelogenin" || allele == "AMEL" || allele == "amel" || allele == "amelogenin" || allele == "Am") {
                        markers.splice(0,1);
                    } else {
                        for (let x = 0; x < markers.length; x++) {
                            if (allele == markers[x]) {
                                markers.splice(x, 1);
                            }
                        }
                    }
                } else if (i == 1 && x == 0) { //query row
                    if (allele == "") {
                        tempTD = table.lastChild.appendChild(document.createElement(`th`)); //write query name at left
                        if (p != 0 && q == 0) {
                            tempTD.appendChild(document.createTextNode(`Query`));
                        } else {
                            tempTD.appendChild(document.createTextNode(`Sample: ` + query.modelIdentification[1]));
                        }
                    } else {
                        if (w == 1) {
                            tempTD = table.lastChild.appendChild(document.createElement(`td`));
                            tempTD.appendChild(document.createTextNode("N/A"));
                            w++;
                        }
                        tempTD = table.lastChild.appendChild(document.createElement("td"));
                        tempData = '';
                        if (Object.keys(query.loci).includes(allele)) {
                            query.loci[allele].sort(function (a, b) {
                                return Number(a) - Number(b);
                            });
                            for (let num of query.loci[allele]) {
                                tempData += num + ',';
                            }
                            tempData = tempData.slice(0, tempData.length - 1);
                        }
                        tempTD.appendChild(document.createTextNode(tempData));
                        length++;
                    }
                } else { //build reference row
                    if (allele == "") {
                        tempTD = table.lastChild.appendChild(document.createElement("th"));
                        tempTD.appendChild(document.createTextNode(reference.modelIdentification[1]));

                        tempTD = table.lastChild.appendChild(document.createElement("td"));
                        tempTD.appendChild(document.createTextNode(concordancePercentage + `%`));
                    } else {
                        tempTD = table.lastChild.appendChild(document.createElement("td"));
                        tempData = '';
                        if (Object.keys(reference.loci).includes(allele)) {
                            reference.loci[allele].sort(function (a, b) {
                                return Number(a) - Number(b);
                            });
                            for (let num of reference.loci[allele]) {
                                tempData += num + ',';
                            }
                            tempData = tempData.slice(0, tempData.length - 1);

                        }
                        tempTD.appendChild(document.createTextNode(tempData));
                        length++;
                    }
                    i = 3;
                }
                
            }

            if (length < 16 && length != 0) { //if table row shorter than it should be, adds filler cells
                for (r = 16-length; r > 0; r--) {
                    tempTD = table.lastChild.appendChild(document.createElement("td"));
                    tempTD.appendChild(document.createTextNode(" "));
                }
            }

            if (i > 1 && concordancePercentage >= 80) { //colour the concordance score
                table.lastChild.children[1].style.color = "green";
            } else if (i > 1 && concordancePercentage >= 60 && concordancePercentage < 80) {
                table.lastChild.children[1].style.color = "orange";
            } else if (i > 1) {
                table.lastChild.children[1].style.color = "red";
            }
        } 
    } 
    //if header is missing alleles, fills them in
    if (markers.length != 0) {
        for (let x = 0; x < markers.length; x++) {
            tempTD = table.firstChild.appendChild(document.createElement(`th`));
            tempTD.appendChild(document.createTextNode(markers[x]));
        }
    }

    return table;
}
 