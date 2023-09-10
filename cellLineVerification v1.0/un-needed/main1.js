// Main Javascript

let settings = {};

let topscores = [["0","0"], ["0","0"], ["0","0"]];


window.onload = () => {

    console.log("online");

    //parse file upon upload
    document.getElementById("queryUpload").addEventListener("change", event => { //query
        fileGrabQuery(event.target.files[0]); //first file selected by user
        
    });

    //compare button
    document.getElementById("compareButton").addEventListener("click",() => {
        settings = settingsGrab();
        compare();
    });

    console.log(references);
};


// compare ref with query
function compare() {

    console.log(queries);

    let tableDiv = document.getElementById("concordanceResults");
    let referenceEquivIndex;
    let referenceIDs = [];
    document.getElementById("results").style.display = "block";
    for (let element of Array.from(tableDiv.children)) {
        element.remove();
    }
    

    /*for (let i in references) {
        referenceIDs.push(references[i].modelIdentification[0]); //creates array of just the mod ID's names called referenceID
    }*/
    
    for (let q in queries) {
        //referenceEquivIndex = referenceIDs.indexOf(queries[q].modelIdentification[0]);//searches for identical ID then makes table
        //if (referenceEquivIndex != -1) { //below creates results table
         //   tableDiv.appendChild(createResultsTable(references[referenceEquivIndex], queries[q], Math.round(calculateConcordance(references[referenceEquivIndex], queries[q], settings.mode, settings.algorithm, settings.amelogenin) * 100) / 100));
        //} else {
         /*   console.log("Query", queries[q].modelIdentification, "lacks a reference equivalent.");
        }*/
        //let topscores = [["0","0"], ["0","0"], ["0","0"]]; //compare each reference against query and make array of top 3 scoring references
        for (let i = 0; i < references.length; i++) {
            let x = Math.round(calculateConcordance(references[i], queries[q], settings.mode, settings.algorithm, settings.amelogenin)*100)/100;
            console.log("concordance: " + x + "i: " + i);
            if (x > topscores[2][1]) {
                //topscores = [i, x];
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
        console.log(topscores);
        //build table here
        //for (let x = 0; x < 3; x++) {
            //let y = [0, 1, 2];
            //console.log("x: " + y[x]);

            tableDiv.appendChild(createResultsTable(references[topscores[0][0]], queries[q], topscores[0][1]));
        //}
    }
}


// generate single table for one comparison
function createResultsTable(reference, query, concordancePercentage) {
    let table = document.createElement("table");
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
        for (let i = 0; i < 3; i++) {
            table.appendChild(document.createElement("tr"));
            for (let allele of alleles) {
                if (i == 0 && x == 0) {
                    tempTD = table.lastChild.appendChild(document.createElement("th"));
                    tempTD.appendChild(document.createTextNode(allele)); //build marker row at top
                } else if (i == 1 && x == 0) {
                    if (allele == "") {
                        tempTD = table.lastChild.appendChild(document.createElement("th")); //write query name at left
                        tempTD.appendChild(document.createTextNode("Query"));
                    } else {
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
                    }
                } else { //build reference row
                    if (allele == "") {
                        tempTD = table.lastChild.appendChild(document.createElement("th"));
                        tempTD.appendChild(document.createTextNode("Reference\n" + reference.modelIdentification[1]));
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

                            // if ref doesn't match query
                            if (tempData != table.children[table.children.length - 2].children[alleles.indexOf(allele)].innerHTML && x != 0) {
                                tempTD.style.color = "#ff0000";
                                table.children[table.children.length - 2].children[alleles.indexOf(allele)].style.color = "#ff0000";
                            }
                        }
                        tempTD.appendChild(document.createTextNode(tempData));
                    }
                    i = 3;
                }
                
            }
            if (i == 3) {
                let percentage = table.lastChild.appendChild(document.createElement('th'));
                percentage.appendChild(document.createTextNode(concordancePercentage + "%"));
                percentage.rowSpan = 3;
                }
          
        }
    
    /*let percentage = table.lastChild.appendChild(document.createElement('th'));
    percentage.appendChild(document.createTextNode(concordancePercentage + "%"));
    percentage.rowSpan = 3;*/
    }
    return table;
}
 