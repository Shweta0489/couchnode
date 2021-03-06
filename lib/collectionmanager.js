const PromiseHelper = require('./promisehelper');
const HttpExecutor = require('./httpexecutor');
const qs = require('querystring');
const errors = require('./errors');

/**
 * CollectionManager allows the management of collections within a Bucket.
 *
 * @category Management
 */
class CollectionManager {
  /**
   * @hideconstructor
   */
  constructor(bucket) {
    this._bucket = bucket;
  }

  get _http() {
    return new HttpExecutor(this._bucket._conn);
  }

  /**
   * @typedef {function(Error)} CreateCollectionCallback
   */
  /**
   * createCollection creates a collection within a scope in a bucket.
   *
   * @param {string} collectionName The name of the collection to create.
   * @param {string} scopeName The name of the scope to contain the new collection.
   * @param {*} [options]
   * @param {Number} [options.timeout] Timeout for the operation in milliseconds.
   * @param {CreateCollectionCallback} [callback]
   * @returns {Promise<boolean>}
   *
   * @throws {ScopeNotFoundError}
   * @throws {CollectionExistsError}
   * @throws {CouchbaseError}
   */
  async createCollection(collectionName, scopeName, options, callback) {
    if (options instanceof Function) {
      callback = arguments[2];
      options = undefined;
    }
    if (!options) {
      options = {};
    }

    return PromiseHelper.wrapAsync(async () => {
      var bucketName = this._bucket.name;

      var res = await this._http.request({
        type: 'MGMT',
        method: 'POST',
        path: `/pools/default/buckets/${bucketName}/collections/${scopeName}`,
        contentType: 'application/x-www-form-urlencoded',
        body: qs.stringify({
          name: collectionName,
        }),
        timeout: options.timeout,
      });

      if (res.statusCode !== 200) {
        var baseerr = errors.makeHttpError(res);
        var errtext = res.body.toString().toLowerCase();

        if (errtext.includes('already exists') &&
          errtext.includes('collection')) {
          throw new errors.CollectionExistsError(baseerr);
        }

        if (errtext.includes('not found') &&
          errtext.includes('scope')) {
          throw new errors.ScopeNotFoundError(baseerr);
        }

        throw new errors.CouchbaseError('failed to create collection', baseerr);
      }

      return true;
    }, callback);
  }

  /**
   * @typedef {function(Error)} DropCollectionCallback
   */
  /**
   * dropCollection drops a collection from a scope in a bucket.
   *
   * @param {string} collectionName The name of the collection to drop.
   * @param {string} scopeName The name of the scope containing the collection to drop.
   * @param {*} [options]
   * @param {Number} [options.timeout] Timeout for the operation in milliseconds.
   * @param {DropCollectionCallback} [callback]
   * @returns {Promise<boolean>}
   *
   * @throws {CollectionNotFoundError}
   * @throws {CouchbaseError}
   */
  async dropCollection(collectionName, scopeName, options, callback) {
    if (options instanceof Function) {
      callback = arguments[2];
      options = undefined;
    }
    if (!options) {
      options = {};
    }

    return PromiseHelper.wrapAsync(async () => {
      var bucketName = this._bucket.name;

      var res = await this._http.request({
        type: 'MGMT',
        method: 'DELETE',
        path: `/pools/default/buckets/${bucketName}/collections/${scopeName}/${collectionName}`,
        timeout: options.timeout,
      });

      if (res.statusCode !== 200) {
        var baseerr = errors.makeHttpError(res);
        var errtext = res.body.toString().toLowerCase();

        if (errtext.includes('not found') &&
          errtext.includes('collection')) {
          throw new errors.CollectionNotFoundError(baseerr);
        }

        throw new errors.CouchbaseError('failed to drop collection', baseerr);
      }

      return true;
    }, callback);
  }

  /**
   * @typedef {function(Error)} CreateScopeCallback
   */
  /**
   * createScope creates a scope within a bucket.
   *
   * @param {string} scopeName The name of the scope to create.
   * @param {*} [options]
   * @param {Number} [options.timeout] Timeout for the operation in milliseconds.
   * @param {CreateScopeCallback} [callback]
   * @returns {Promise<boolean>}
   *
   * @throws {CouchbaseError}
   */
  async createScope(scopeName, options, callback) {
    if (options instanceof Function) {
      callback = arguments[1];
      options = undefined;
    }
    if (!options) {
      options = {};
    }

    return PromiseHelper.wrapAsync(async () => {
      var bucketName = this._bucket.name;

      var res = await this._http.request({
        type: 'MGMT',
        method: 'POST',
        path: `/pools/default/buckets/${bucketName}/collections`,
        contentType: 'application/x-www-form-urlencoded',
        body: qs.stringify({
          name: scopeName,
        }),
        timeout: options.timeout,
      });

      if (res.statusCode !== 200) {
        var baseerr = errors.makeHttpError(res);
        var errtext = res.body.toString().toLowerCase();

        if (errtext.includes('already exists') &&
          errtext.includes('scope')) {
          throw new errors.ScopeExistsError(baseerr);
        }

        throw new errors.CouchbaseError('failed to create scope', baseerr);
      }

      return true;
    }, callback);
  }

  /**
   * @typedef {function(Error)} DropScopeCallback
   */
  /**
   * dropScope drops a scope from a bucket.
   *
   * @param {string} scopeName The name of the scope to drop.
   * @param {*} [options]
   * @param {Number} [options.timeout] Timeout for the operation in milliseconds.
   * @param {DropScopeCallback} [callback]
   * @returns {Promise<boolean>}
   *
   * @throws {ScopeNotFoundError}
   * @throws {CouchbaseError}
   */
  async dropScope(scopeName, options, callback) {
    if (options instanceof Function) {
      callback = arguments[2];
      options = undefined;
    }
    if (!options) {
      options = {};
    }

    return PromiseHelper.wrapAsync(async () => {
      var bucketName = this._bucket.name;

      var res = await this._http.request({
        type: 'MGMT',
        method: 'DELETE',
        path: `/pools/default/buckets/${bucketName}/collections/${scopeName}`,
        timeout: options.timeout,
      });

      if (res.statusCode !== 200) {
        var baseerr = errors.makeHttpError(res);
        var errtext = res.body.toString().toLowerCase();

        if (errtext.includes('not found') &&
          errtext.includes('scope')) {
          throw new errors.ScopeNotFoundError(baseerr);
        }

        throw new errors.CouchbaseError('failed to drop scope', baseerr);
      }

      return true;
    }, callback);
  }

}
module.exports = CollectionManager;
