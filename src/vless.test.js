import test from 'node:test';
import assert from 'node:assert/strict';
import {uuidBytes, parseVlessRequest, DEFAULT_UUID} from './vless.js';

test('default UUID is valid', () => assert.equal(uuidBytes(DEFAULT_UUID).length, 16));
test('IPv4 TCP VLESS handshake parses', () => {
 const head=Buffer.concat([Buffer.from([0]), uuidBytes(DEFAULT_UUID), Buffer.from([0, 1, 0, 80, 1, 1, 2, 3, 4]), Buffer.from('hello')]);
 const result=parseVlessRequest(head,uuidBytes(DEFAULT_UUID));
 assert.equal(result.host,'1.2.3.4'); assert.equal(result.port,80); assert.equal(result.payload.toString(),'hello');
});
test('partial VLESS handshake waits', () => assert.equal(parseVlessRequest(Buffer.alloc(4),uuidBytes(DEFAULT_UUID)),null));
test('bad UUID rejected', () => assert.throws(() => uuidBytes('invalid')));
