// Krever at mailData.json er requires, normalt satt i hovedskriptet.
sendFeilMelding = function(melding) {
    const ERRnodemailer = require("nodemailer");
    const mailServerData = require("./settings/mailData.json"); //For sikkerheten er alle mail-credentials i egen fil

    let ErrorTransporter = ERRnodemailer.createTransport({
        host: mailServerData.serverData.host,
        auth: {
            user: mailServerData.serverData.auth.user,
            pass: mailServerData.serverData.auth.pass
        },
        secure: false,
        tls: {rejectUnauthorized: false},
        debug: true
    });
    let ErrormailOptions = {
        from: "smtp@sd.no",
        to: 'jojo@sd.no',
        subject : '😱 Feil ved sending av flere samlenotaer i en og samme epost',
        text: melding,
        generateTextFromHTML: true,
        html: melding
    };
    ErrorTransporter.verify((error, success) =>{
        console.log("verifying");
        if(error) console.log("Feilmelding ikke sendt! Ikke verifisert mailkontobruker. ", error);
    });
    ErrorTransporter.sendMail(ErrormailOptions, (error, info) => {
        if (error) {
            return console.log("Det ble ikke sent feilmelding på epost: ",error);
        }
        console.log("Feilmelding sendt ", info);
        });
    ErrorTransporter = undefined;
    
}
ERRnodemailer = undefined;
module.exports = sendFeilMelding;