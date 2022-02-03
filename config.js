const keys = require("./configuration/app-keys")

module.exports = {
	client_email: keys.client_email,
	private_key: keys.private_key,
    sheetId : keys.sheetId,
    scopes : ["https://www.googleapis.com/auth/spreadsheets"],
    apiUrl : keys.apiUrl,
    apiAuthorization : keys.apiAuthorization
};