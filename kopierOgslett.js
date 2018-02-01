let filliste = [  ];
const path = require("path");
const fs = require('fs-extra'); //requires npm i fs-extra

let arkivsti = "";
let samlenotadir = "";

filliste.forEach( (fil) =>{
    console.log("arkiverer ", fil);
    arkiverEnFil(fil, samlenotadir, arkivsti);
    console.log("Arkiverte filen", fil);
    });

function arkiverEnFil(fil, framappe, tilmappe) {
    
    let sourcefile = path.join(framappe,fil);
    let destfile = path.join(tilmappe,fil);
    console.log(sourcefile + " -> " + destfile);
    fs.move( String(sourcefile), String(destfile), (err) => {
        if (err) {
            console.log("Kopierte ikke filen ", fil);
            //Feilhåndtering tenkt en mail til itdrift som varsel
        }
        console.log(`filen ${sourcefile} er nå i ${destfile}`); 
        // fs.unlink(framappe + fil, (err)=> {
        //     if (err) console.log("Filen ble ikke slettet fra kildemappen");
        //     console.log(`Filen ${fil} er nå slettet fra kildemappen`);
        // });
    } );

 } //SLUTT function arkiverEnFil(fil, framappe, tilmappe) {
