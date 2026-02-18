import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from '../storage';

describe('Storage', () => {
    let storage: Storage;

    beforeEach(() => {
        storage = new Storage();
    });

    describe('get', () => {
        it('should retrieve stored value', async () => {
            await storage.set('testKey', 'testValue');
            const value = await storage.get<string>('testKey');
            expect(value).toBe('testValue');
        });

        it('should return null for non-existent key', async () => {
            const value = await storage.get('nonExistent');
            expect(value).toBeNull();
        });

        it('should handle complex objects', async () => {
            const obj = { a: 1, b: { c: 2 } };
            await storage.set('complexKey', obj);
            const value = await storage.get<typeof obj>('complexKey');
            expect(value).toEqual(obj);
        });
    });

    describe('set', () => {
        it('should store a value', async () => {
            await storage.set('key1', 'value1');
            const value = await storage.get('key1');
            expect(value).toBe('value1');
        });

        it('should overwrite existing value', async () => {
            await storage.set('key2', 'oldValue');
            await storage.set('key2', 'newValue');
            const value = await storage.get('key2');
            expect(value).toBe('newValue');
        });

        it('should store arrays', async () => {
            const arr = [1, 2, 3];
            await storage.set('arrayKey', arr);
            const value = await storage.get<number[]>('arrayKey');
            expect(value).toEqual(arr);
        });
    });

    describe('remove', () => {
        it('should remove a key', async () => {
            await storage.set('removeKey', 'value');
            await storage.remove('removeKey');
            const value = await storage.get('removeKey');
            expect(value).toBeNull();
        });

        it('should not error when removing non-existent key', async () => {
            await expect(storage.remove('nonExistent')).resolves.not.toThrow();
        });
    });

    describe('clear', () => {
        it('should clear all storage', async () => {
            await storage.set('key1', 'value1');
            await storage.set('key2', 'value2');
            await storage.clear();

            const value1 = await storage.get('key1');
            const value2 = await storage.get('key2');

            expect(value1).toBeNull();
            expect(value2).toBeNull();
        });
    });

    describe('getAll', () => {
        it('should retrieve all stored data', async () => {
            await storage.set('key1', 'value1');
            await storage.set('key2', 'value2');

            const all = await storage.getAll();

            expect(all).toEqual({
                key1: 'value1',
                key2: 'value2',
            });
        });

        it('should return empty object when storage is empty', async () => {
            const all = await storage.getAll();
            expect(all).toEqual({});
        });
    });
});
