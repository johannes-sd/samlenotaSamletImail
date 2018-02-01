//Program for å sende flere samlenotaer til en kunde i samme mail
//Har samme kunde flere kundenummer får de en mail per kundenummer
//Modul for å lese kundenummer og epost fra streamserve-tabell {hentKundeliste}:
//  Tabellen ligger pr.d.d. på "\\\\stranda\\c$\\k\\AxaptaPrint412\\export\\data\\tables\\"
//  Tabellen heter "samlenotaSpesial.tbl"
//  Dette er satt som variabel i dette programmet og må skiftes om kilden skiftes
//  Modulet bryr seg ikke om innslagene er laget med vanlige mellomrom eller tabulert mellomrom mellom nøkkel og verdi
//  Kommentarer med dobbellash blir oversett.
// Modul for å sende mail med vedlegg {sendSDmail} tar 2 argumenter som er kundenummer og epost (som kommer med {hentKundeliste})

// Importerer data fra settings-mappen (variable server og stidata)
const folderData = require("./settings/folders.json");
const mailData = require("./settings/mailData.json");
const path = require("path");
const fs = require("fs-extra");

const errorRapportering = require("./feilmeldingerPrEpost.js"); // Modul for å sende feilmeldinger per epost

function hentKundeliste (argument1, argument2, callback) {
    const fs = require("fs");
    const readline = require("readline");
    const nodemailer = require("nodemailer");
    const samlenotadir = folderData.samlenotadir;
    var path = argument1;
    var fileName = argument2;

    const rl = readline.createInterface({
    input: fs.createReadStream(path + fileName),
    crlfDelay: Infinity
    });
    var kunder = [];

    rl.on('line', (line) => {
    console.log(line);
    let sisteImellomrom;
    let mellomrom;
    let kunde = {};
        if(!line.trim().startsWith("//")) {
            mellomrom = line.indexOf("\t");
            if (mellomrom = -1) {
                mellomrom = line.indexOf(" ");
            }
            console.log("Tab eller mellomrom er på ", mellomrom);
            if (mellomrom > -1){
                sisteImellomrom = line.lastIndexOf(" ");
                console.log("Siste mellomrom er på ", sisteImellomrom);
                kunde.kundenummer = line.substring(0, mellomrom);
                kunde.fakturaEpost = line.substring(mellomrom + 1);
            }
            if (mellomrom <= -1) {
                //mellomrom.indexOf("\t");
                mellomrom = line.indexOf("\t");
                sisteImellomrom = line.lastIndexOf("\t");
                kunde.kundenummer = line.substring(0, mellomrom);
                kunde.fakturaEpost = line.substring(mellomrom + 1);
            }
        }
        if(Object.keys(kunde).length != 0){
            kunder.push(kunde);
        }

    }).on('close', () => {
    // HER GENERERES MAILEN
    console.log( "kunder ",kunder);
    kunder.forEach(function(element) {
        sendSDmail(element.kundenummer, element.fakturaEpost, samlenotadir, mailData);
    });
    rl.close();
    process.stdin.destroy();
    //process.exit(0);
    }); //}).on('close', () => { SLUTT

} //SLUTT hentKundeliste (argument1, argument2, callback) {

const tabellsti = folderData.tabellsti;
const tabellFilNavn = folderData.tabellFilNavn;

var kundedata = {};

kundedata = hentKundeliste(tabellsti, tabellFilNavn, (data) => {
});

function sendSDmail(kundenummer, kundeEpost, samlenotadir, mailData) {
    console.log("mailData i funksjonen sendMail ", mailData);
    const fs = require("fs");
    const nodemailer = require("nodemailer");
    console.log("kundenummer i sendSDmail ", kundenummer);
    console.log("Kundens epost i sendSDmail ", kundeEpost);

    let filerIdir = fs.readdirSync(samlenotadir, {ENCODING : "UTF-8"}, (error, data) => {
        if (error) {
            let feilmelding = "Feil ved lesing av samlenotafiler lager problemer\n";
            console.log("readdirSyncError ", error);
            feilmelding += error;
            errorRapportering(feilmelding); 
            return error;
        } else {
            data = data.filter(kundenummer).foreach((value) => {
              return value;
            });
        }
    } );
    
    let kundesFiler = [];
    filerIdir.forEach((data) => {
        if(data.indexOf(kundenummer + "GN") > -1) {
            kundesFiler.push(data);
        } 
        // else {

        // }
    });

    let sekundstyrtCid = "SDUNIKID" + Date.now().toString() + "@sd.no";
    var attachments = [];
    
    kundesFiler.forEach((data) => {
        attachments.push({path: samlenotadir + '/' + data});
    });

    let pathToSEDlogo = path.join(__dirname, '../');
    const embeddedLogo = {
        filename : "SDLogoMindre2.gif",
        path : pathToSEDlogo + "/SDLogoMindre2.gif",
        encoding: 'base64',
        cid: sekundstyrtCid
    };
    //attachments.push(embeddedLogo); //Legger logoen til sist i attachement-objektet.
    
    let transporter = nodemailer.createTransport({
        host: mailData.serverData.host,
        auth: {
            user: mailData.serverData.auth.user,
            pass: mailData.serverData.auth.pass
        },
        secure: false,
        tls: {rejectUnauthorized: false},
        debug: true
    });
    
    var htmlMail = require("./htmlMailBody.html");
    let delen = htmlMail.replace("unikCID", sekundstyrtCid);
    delen = "<p>" + "Kundenummer: " + kundenummer + "</p>" + delen;

    let mailOptions = {
        from: mailData.clientData.from,
        // to: kundeEpost, ved skarp
        to: kundeEpost,
        bcc: mailData.clientData.bcc,
        subject : 'Regnskap SD: Samlenota',
        text: '',
        generateTextFromHTML: true,
        html: delen,
        attachments
    };
    transporter.verify((error, success) =>{
        console.log("verifying");
        if(error) {
            console.log(error);
            let feilmelding = "Det oppsto en feil under verifisering av epostinnstillingene\n";
            feilmelding += "Dette krever manuell oppfølging\n";
            feilmelding += error;
            errorRapportering(feilmelding);
        }
        if(success) console.log(success);
    });

    // console.log("Vi har atachementslengde på: ", mailOptions.attachments.length);
    if(mailOptions.attachments.length > 0 ){

    transporter.sendMail(mailOptions, (error, info) => {
        console.log("Sendmail initiert");
        if (error) {
            return console.log(error);
        }
        console.log('Mail %s sendt %s', info.messageId, info.response);
        console.log("attachmenets frigjort? ", mailOptions.attachments);
        console.log("Kundens filer? ", kundesFiler);
        kundesFiler.forEach( (fil) =>{
            console.log("arkiverer ", fil);
            arkiverEnFil(fil, folderData.samlenotadir, folderData.arkivsti);
            console.log("Arkiverte filen", fil);
            });
        });

    } else {
        let errorMessage = "Det er ingen sendingsfeil, men det fantes ingen filer tilknyttet kontoen " + kundenummer + '.\n';
        errorMessage += "Krever manuell oppfølging/sjekk.";
        errorRapportering(errorMessage);
    }
    
    transporter = undefined;
    // 
 } //function sendSDmail() { SLUTT

 function arkiverEnFil(fil, framappe, tilmappe) {
    let sourcefile = path.join(framappe,fil);
    let destfile = path.join(tilmappe,fil);
    
    fs.move(String(sourcefile), String(destfile), (err)=> {
        if (err) {
            console.log("Kopierte ikke filen ", fil);
            let errorMessage = "Ingen sendingsfeil, men klarte ikke å arkivere PDF-fil " + fil + " \n";
            errorMessage += "Manuell sjekk på prosessene må gjennomføres!";
            errorRapportering(errorMessage);
        }
        console.log(`filen ${fil} ble kopiert til arkivet`);
    });

 } //SLUTT function arkiverEnFil(fil, framappe, tilmappe) {