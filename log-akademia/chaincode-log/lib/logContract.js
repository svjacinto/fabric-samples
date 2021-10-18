/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class LogContract extends Contract {

    async InitLedger(ctx) {
        const logs = [
            {
                ID: 'akademia-2021-08-01.log',
                HashValue: 'hash value one',
                Signature: 'signature one',
            },
            {
                ID: 'akademia-2021-08-02.log',
                HashValue: 'hash value two',
                Signature: 'signature two',
            },
            {
                ID: 'akademia-2021-08-03.log',
                HashValue: 'hash value three',
                Signature: 'signature three',
            },
            {
                ID: 'akademia-2021-08-04.log',
                HashValue: 'hash value four',
                Signature: 'signature four',
            },
        ];

        for (const log of logs) {
            log.docType = 'log';
            await ctx.stub.putState(log.ID, Buffer.from(JSON.stringify(log)));
            console.info(`Log file ${log.ID} initialized`);
        }
    }

    // CreateLog issues a new log to the world state with given details.
    async CreateLog(ctx, id, hashValue, signature) {
        const log = {
            ID: id,
            HashValue: hashValue,
            Signature: signature,
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(log)));
        return JSON.stringify(log);
    }

    // ReadLog returns the log stored in the world state with given id.
    async ReadLog(ctx, id) {
        const logJSON = await ctx.stub.getState(id); // get the log from chaincode state
        if (!logJSON || logJSON.length === 0) {
            throw new Error(`The log file ${id} does not exist`);
        }
        return logJSON.toString();
    }

    // UpdateLog updates an existing log in the world state with provided parameters.
    async UpdateLog(ctx, id, hashValue, signature) {
        const exists = await this.LogExists(ctx, id);
        if (!exists) {
            throw new Error(`The log file ${id} does not exist`);
        }

        // overwriting original log with new log
        const updatedLog = {
            ID: id,
            HashValue: hashValue,
            Signature: signature,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedLog)));
    }

    // DeleteLog deletes an given log from the world state.
    async DeleteLog(ctx, id) {
        const exists = await this.LogExists(ctx, id);
        if (!exists) {
            throw new Error(`The log file ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // LogExists returns true when log with given ID exists in world state.
    async LogExists(ctx, id) {
        const logJSON = await ctx.stub.getState(id);
        return logJSON && logJSON.length > 0;
    }

    // GetAllLogs returns all logs found in the world state.
    async GetAllLogs(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all logs in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    async RetrieveLogHistory(ctx, key) {
        const allResults = [];
        const iterator = await ctx.stub.getHistoryForKey(key);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);

    }
}

module.exports = LogContract;

