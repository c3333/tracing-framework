/**
 * Copyright 2012 Google, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

/**
 * @fileoverview Memory-buffered local-file write stream.
 *
 * @author benvanik@google.com (Ben Vanik)
 */

goog.provide('wtf.io.LocalFileWriteStream');

goog.require('wtf.io');
goog.require('wtf.io.WriteStream');
goog.require('wtf.pal');
goog.require('wtf.timing');



/**
 * Memory-buffered local-file write stream.
 * Clones all buffers and keeps them around until closed.
 *
 * @param {string} filename Filename.
 * @constructor
 * @extends {wtf.io.WriteStream}
 */
wtf.io.LocalFileWriteStream = function(filename) {
  goog.base(this);

  /**
   * Filename used when saving.
   * @type {string}
   * @private
   */
  this.filename_ = filename;

  /**
   * Cloned memory buffers.
   * @type {!Array.<!wtf.io.ByteArray>}
   * @private
   */
  this.bufferDatas_ = [];
};
goog.inherits(wtf.io.LocalFileWriteStream, wtf.io.WriteStream);


/**
 * @override
 */
wtf.io.LocalFileWriteStream.prototype.disposeInternal = function() {
  var platform = wtf.pal.getPlatform();
  if (this.bufferDatas_.length == 1) {
    platform.writeBinaryFile(this.filename_, this.bufferDatas_[0]);
  } else {
    var combinedBuffers = wtf.io.combineByteArrays(this.bufferDatas_);
    platform.writeBinaryFile(this.filename_, combinedBuffers);
  }
  this.bufferDatas_.length = 0;

  goog.base(this, 'disposeInternal');
};


/**
 * @override
 */
wtf.io.LocalFileWriteStream.prototype.write = function(
    buffer, returnBufferCallback, opt_selfObj) {
  var newBuffer = buffer.clone();
  this.bufferDatas_.push(newBuffer.data);
  wtf.timing.setTimeout(0, function() {
    returnBufferCallback.call(opt_selfObj, buffer);
  });
};


/**
 * @override
 */
wtf.io.LocalFileWriteStream.prototype.flush = function() {
};
