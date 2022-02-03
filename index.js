const axios= require('axios');
const { google } = require('googleapis');
const { get } = require('http');
const { config } = require('process');
const Config = require('./config');

const Client = new google.auth.JWT(
    Config.client_email, null, Config.private_key, Config.scopes
);
const sheets = google.sheets({ version: 'v4', auth: Client });

Client.authorize(function (err, _tokens) {
    if (err) {
        console.log(err)
        return;
    }
    console.log("Successfully connected!");

    setInterval(function () {
        console.log('\n\x1b[34mUpdating whitelist... \x1b[0m');
        getSheet(Config.sheetId, "B3:E").then(function (responseData) {
            let data = responseData.map(function (row) {
                return {
                    statusIgnored: row[0],
                    nickname: row[1],
                    expired: new Date(row[2]),
                    statusWhitelist: row[3]
                }
            });
            whitelistPlayer(data);
        });
    }, 10000);
})

function whitelistPlayer(whitelistData) {
    let updating = 0;
    for (let key in whitelistData) {
        let data = whitelistData[key];
        let rangeId = 3 + parseInt(key);

        //Checking expired date
        let date = new Date();
        
        if(data.statusIgnored == 0){            
            if (data.expired > date) {
                if(data.statusWhitelist != "Active"){            
                    serverWhitelist("add", data.nickname);
                    console.log(`Whitelist player: ${data.nickname}`);
                    updateSheet(Config.sheetId, "E" + rangeId, [["Active"]])          
                    updating++;  
                }            
            }else{
                if(data.statusWhitelist == "Active" || data.statusWhitelist == null){
                    serverWhitelist("remove", data.nickname);
                    console.log(`Removing player: ${data.nickname}`);                
                    updateSheet(Config.sheetId, "E" + rangeId, [["Expired"]])
                    updating++;
                }
            }   
        }            
    }
    if(updating!=0){
        console.log(`\x1b[32mSuccessfully updated ${updating} whitelist\x1b[0m`)
        return;
    }
    console.log("\x1b[31mThere is no updated whitelist \x1b[0m")
}

//Google Sheets API
async function getSheet(sheetId, range) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
    });
    return response.data.values;
}

async function updateSheet(sheetId, range, values) {
    const response = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: values }
    });
    return response;
}

function serverWhitelist(command, nickname) {
    let data = JSON.stringify({
        "command": `wl ${command} ${nickname}`
    });

    var config = {
        method: 'post',
        url: Config.apiUrl,
        headers: {
            'Authorization': Config.apiAuthorization,
            'Content-Type': 'application/json'
        },
        data: data
    };
    
    axios(config).then(function (response) {        
        return response.status;
    }).catch(function (error) {
        console.log(error);
    });    
}