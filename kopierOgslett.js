let filliste = [ '5312GN1017323FA30559386.pdf',
'5312GN1017323FA30560558.pdf',
'5312GN1017323FA30561446.pdf',
'5312GN1017323FA30562447.pdf',
'5312GN1017323FA30563249.pdf',
'5312GN1017323FA30564282.pdf',
'5312GN1017323FA30566619.pdf',
'5312GN1017323FA30568118.pdf',
'5312GN1017323FA30569108.pdf',
'5312GN1017323FA30570299.pdf',
'5312GN1017323FA30572257.pdf',
'5312GN1017323FA30573398.pdf',
'5312GN1017323FA30576608.pdf',
'5312GN1017323FA30577475.pdf',
'5312GN1017323FA30577909.pdf' ];
const path = require("path");
const fs = require('fs-extra'); //requires npm i fs-extra

let arkivsti = "\\\\stranda\\e$\\MailVedlegg\\SendSamletEpost\\arkiv\\";
let samlenotadir = "\\\\stranda\\e$\\MailVedlegg\\SendSamletEpost\\";

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