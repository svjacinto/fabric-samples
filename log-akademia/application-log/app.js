/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const mspOrg1 = 'Org1MSP';

const channelName = 'mychannel';
const chaincodeName = 'basic';
const org1UserId = 'appUser';
const walletPath = path.join(__dirname, 'wallet');

// load the common connection configuration file
const ccpPath = path.resolve(__dirname, 'connection-org1.json');
const fileExists = fs.existsSync(ccpPath);
if (!fileExists) {
	throw new Error(`no such file or directory: ${ccpPath}`);
}
const contents = fs.readFileSync(ccpPath, 'utf8');

// functions
function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
	try {
		const ccp = JSON.parse(contents);

		const wallet = await Wallets.newFileSystemWallet(walletPath);
		
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		await enrollAdmin(caClient, wallet, mspOrg1);

		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract(chaincodeName);

			let result = await contract.evaluateTransaction('GetAllLogs');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();

