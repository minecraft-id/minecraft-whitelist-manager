const {google} = require('googleapis');
const { get } = require('http');
const Config = require('./config');

const Client = new google.auth.JWT(
    Config.client_email, null, Config.private_key, Config.scopes
);

Client.authorize(function(err, _tokens) {
    if(err){
        console.log(err) 
        return;
    }    
    console.log("Successfully connected!");
    
    getSheet(Config.sheetId, "B3:E").then(function(responseData){
        let data = responseData.map(function(row){
            return {
                statusIgnored: row[0],
                nickname: row[1],
                expired: new Date(row[2]),
                status: row[3]    
            }
        });
        console.log(data);
    })
})

async function getSheet(sheetId, range){
    const sheets = google.sheets({version: 'v4', auth: Client});
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
    });    
    return response.data.values;
}