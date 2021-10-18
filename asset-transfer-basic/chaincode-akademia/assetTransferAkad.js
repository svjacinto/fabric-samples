opyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-TransacIdentifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                TransacId: '01',
                OldBalance: 5000,
                Amount: 5000,
                TransacOwner: 'ibsaberon',
                NewBalance: 0,
                Fingerprint: 'a1',
            },
            {
                TransacId: '02',
                OldBalance: 10000,
                Amount: 5000,
                TransacOwner: 'ibsaberon',
                NewBalance: 5000,
                Fingerprint: 'a2',
            },
            {
                TransacId: '03',
                oldBalance: 5000,
                Amount: 2500,
                TransacOwner: 'msjohnson',
                NewBalance: 2500,
                Fingerprint: 'a3',
            },
            {
                TransacId: '04',
                OldBalance: 2500,
                Amount: 2500,
                TransacOwner: 'kbernard',
                NewBalance: 0,
                Fingerprint: 'a4',
            },
            {
                TransacId: '05',
                OldBalance: 10000,
                Amount: 10000,
                TransacOwner: 'alsalvador',
                NewBalance: 0,
                Fingerprint: 'a5',
            },
            {
                TransacId: '06',
                OldBalance: 15000,
                Amount: 10000,
                TransacOwner: 'ibsaberon',
                NewBalance: 5000,
                Fingerprint: 'a6',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.TransacId, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.TransacId} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, transacId, TransacOwner, oldBalance, amount, newBalance, fingerprint) {
        const asset = {
            TransacId: transacTransacId,
            TransacOwner: TransacOwner,
            OldBalance: oldBalance,
            Amount: amount,
            NewBalance: newBalance,
            Fingerprint: fingerprint
        };
        ctx.stub.putState(transacId, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given TransacId.
    async ReadAsset(ctx, TransacId) {
        const assetJSON = await ctx.stub.getState(TransacId); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${TransacId} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provTransacIded parameters.
    async UpdateAsset(ctx, transacId, TransacOwner, oldBalance, amount, newBalance, fingerprint) {
        const exists = await this.AssetExists(ctx, TransacId);
        if (!exists) {
            throw new Error(`The asset ${TransacId} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            TransacId: transacId,
            TransacOwner: TransacOwner,
            OldBalance: oldBalance,
            Amount: amount,
            NewBalance: newBalance,
            Fingerprint: fingerprint
        };
        return ctx.stub.putState(transacId, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, transacId) {
        const exists = await this.AssetExists(ctx, transacId);
        if (!exists) {
            throw new Error(`The asset ${transacId} does not exist`);
        }
        return ctx.stub.deleteState(transacId);
    }

    // AssetExists returns true when asset with given TransacId exists in world state.
    async AssetExists(ctx, transacId) {
        const assetJSON = await ctx.stub.getState(transacId);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the TransacOwner field of asset with given TransacId in the world state.
    async TransferAsset(ctx, transacId, newTransacOwner) {
        const assetString = await this.ReadAsset(ctx, transacId);
        const asset = JSON.parse(assetString);
        asset.TransacOwner = newTransacOwner;
        return ctx.stub.putState(transacId, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
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


}

module.exports = AssetTransfer;



