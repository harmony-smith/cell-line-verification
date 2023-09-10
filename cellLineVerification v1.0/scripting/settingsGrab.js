function settingsGrab(){
    let settings = {}
    //modes 
    if(document.getElementById("nonEmptySelect").checked){
        settings.mode = 0;
    }
    else if(document.getElementById("querySelect").checked){
        settings.mode = 1;
    }
    else if(document.getElementById("referenceSelect").checked){
        settings.mode = 2;
    }
    //algorithm
    if(document.getElementById("tanabeSelect").checked){
        settings.algorithm = 0;
    }
    else if(document.getElementById("mastersVQuerySelect").checked){
        settings.algorithm = 1;
    }
    else if(document.getElementById("mastersVReferenceSelect").checked){
        settings.algorithm = 2;
    }
    
    if(document.getElementById("includeAmelogeninInput").checked){
        settings.amelogenin = true;
    }
    else{
        settings.amelogenin = false;
    }
    return settings;
}
