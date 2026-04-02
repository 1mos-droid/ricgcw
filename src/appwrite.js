import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69bd9a9000090f983d70');

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases, ID };
export default client;
