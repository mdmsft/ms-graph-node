require('isomorphic-fetch');
const { ClientSecretCredential } = require('@azure/identity');
const { setLogLevel } = require("@azure/logger");
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");

const graphBaseUrl = 'https://graph.microsoft.com/v1.0';

const credential = new ClientSecretCredential(process-env.TENANT_ID, process.env.CLIENT_ID, process.env.CLIENT_SECRET);

const authProvider = new TokenCredentialAuthenticationProvider(credential, { scopes: 'https://graph.microsoft.com/.default' });

const client = Client.initWithMiddleware({
	debugLogging: true,
	authProvider,
});

setLogLevel("verbose");

async function callApi(fn) {
    try {
        const data = await fn;
        return data.value;
    } catch (error) {
        throw error;
    }
}

/**
 * Creates new group
 * @param {string} name The name of the group to create
 */
async function createGroup(name) {
    console.log(`Checking if '${name}' group exists`);
    const groups = await callApi(client.api('/groups').filter(`displayName+eq+'${name}'`).select('id').get());
    if (groups.length > 0) {
        console.log(`'${name}' group already exists. Skipping`);
        console.log(groups[0].id);
    } else {
        console.log(`'${name}' group does not exists. Creating`);
        let payload = {
            displayName: name,
            mailEnabled: false,
            mailNickname: name,
            securityEnabled: true,
            isAssignableToRole: true
        }
        console.log(JSON.stringify(payload));
        const response = await callApi(client.api('/groups').post(payload));
        console.log(response.id);
    }
}

if (require.main === module) {
    createGroup(process.argv[2]).catch(err => { console.error(err); throw err; });
}