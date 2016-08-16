

var http = require("http");
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");


__kernel_hash = null;
/*
 * js-sha3 v0.5.1
 * https://github.com/emn178/js-sha3
 *
 * Copyright 2015, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
;(function(root, undefined) {
	'use strict';
	var NODE_JS = typeof(module) != 'undefined';
	if(NODE_JS) {
		root = global;
	}
	var HEX_CHARS = '0123456789abcdef'.split('');
	var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
	var KECCAK_PADDING = [1, 256, 65536, 16777216];
	var PADDING = [6, 1536, 393216, 100663296];
	var SHIFT = [0, 8, 16, 24];
	var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
		0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 
		2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 
		2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
		2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
	var BITS = [224, 256, 384, 512];
	var SHAKE_BITS = [128, 256];
	var OUTPUT_TYPES = ['hex', 'buffer', 'array'];

	var createOutputMethod = function(bits, padding, outputType) {
		return function(message) {
			return new Keccak(bits, padding, bits).update(message)[outputType]();
		}
	};
	var createShakeOutputMethod = function(bits, padding, outputType) {
		return function(message, outputBits) {
			return new Keccak(bits, padding, outputBits).update(message)[outputType]();
		}
	};
	var createMethod = function(bits, padding) {
		var method = createOutputMethod(bits, padding, 'hex');
		method.create = function() {
			return new Keccak(bits, padding, bits);
		};
		method.update = function(message) {
			return method.create().update(message);
		};
		for(var i = 0;i < OUTPUT_TYPES.length;++i) {
			var type = OUTPUT_TYPES[i];
			method[type] = createOutputMethod(bits, padding, type);
		}
		return method;
	};

	var createShakeMethod = function(bits, padding) {
		var method = createShakeOutputMethod(bits, padding, 'hex');
		method.create = function(outputBits) {
			return new Keccak(bits, padding, outputBits);
		};
		method.update = function(message, outputBits) {
			return method.create(outputBits).update(message);
		};
		for(var i = 0;i < OUTPUT_TYPES.length;++i) {
			var type = OUTPUT_TYPES[i];
			method[type] = createShakeOutputMethod(bits, padding, type);
		}
		return method;
	};
	var algorithms = [
		{name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod},
		{name: 'sha3', padding: PADDING, bits: BITS, createMethod: createMethod},
		{name: 'shake', padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod}
	];
	var methods = {};
	for(var i = 0;i < algorithms.length;++i) {
		var algorithm = algorithms[i];
		var bits  = algorithm.bits;
		var createMethod = algorithm.createMethod;
		for(var j = 0;j < bits.length;++j) {
			var method = algorithm.createMethod(bits[j], algorithm.padding);
			methods[algorithm.name +'_' + bits[j]] = method;
		}
	}
	function Keccak(bits, padding, outputBits) {
		this.blocks = [];
		this.s = [];
		this.padding = padding;
		this.outputBits = outputBits;
		this.reset = true;
		this.block = 0;
		this.start = 0;
		this.blockCount = (1600 - (bits << 1)) >> 5;
		this.byteCount = this.blockCount << 2;
		this.outputBlocks = outputBits >> 5;
		this.extraBytes = (outputBits & 31) >> 3;
		for(var i = 0;i < 50;++i) {
			this.s[i] = 0;
		}
	};

	Keccak.prototype.update = function(message) {
		var notString = typeof(message) != 'string';
		if(notString && message.constructor == root.ArrayBuffer) {
			message = new Uint8Array(message);
		}
		var length = message.length, blocks = this.blocks, byteCount = this.byteCount, 
		blockCount = this.blockCount, index = 0, s = this.s, i, code;

		while(index < length) {
			if(this.reset) {
				this.reset = false;
				blocks[0] = this.block;
				for(i = 1;i < blockCount + 1;++i) {
					blocks[i] = 0;
				}
			}
			if(notString) {
				for (i = this.start;index < length && i < byteCount; ++index) {
					blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
				}
			} else {
				for (i = this.start;index < length && i < byteCount; ++index) {
					code = message.charCodeAt(index);
					if (code < 0x80) {
						blocks[i >> 2] |= code << SHIFT[i++ & 3];
					} else if (code < 0x800) {
						blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
						blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
					} else if (code < 0xd800 || code >= 0xe000) {
						blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
						blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
						blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
					} else {
						code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
						blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
						blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
						blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
						blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
					}
				}
			}
			this.lastByteIndex = i;
			if(i >= byteCount) {
				this.start = i - byteCount;
				this.block = blocks[blockCount];
				for(i = 0;i < blockCount;++i) {
					s[i] ^= blocks[i];
				}
				f(s);
				this.reset = true;
			} else {
				this.start = i;
			}
		}
		return this;
	};

	Keccak.prototype.finalize = function() {
		var blocks = this.blocks, i = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
		blocks[i >> 2] |= this.padding[i & 3];
		if(this.lastByteIndex == this.byteCount) {
			blocks[0] = blocks[blockCount];
			for(i = 1;i < blockCount + 1;++i) {
				blocks[i] = 0;
			}
		}
		blocks[blockCount - 1] |= 0x80000000;
		for(i = 0;i < blockCount;++i) {
			s[i] ^= blocks[i];
		}
		f(s);
	};

	Keccak.prototype.toString = Keccak.prototype.hex = function() {
		this.finalize();

		var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, 
		extraBytes = this.extraBytes, i = 0, j = 0;
		var hex = '', block;
		while(j < outputBlocks) {
			for(i = 0;i < blockCount && j < outputBlocks;++i, ++j) {
				block = s[i];
				hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F] +
				HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F] +
				HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F] +
				HEX_CHARS[(block >> 28) & 0x0F] + HEX_CHARS[(block >> 24) & 0x0F];
			}
			if(j % blockCount == 0) {
				f(s);
			}
		}
		if(extraBytes) {
			block = s[i];
			if(extraBytes > 0) {
				hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F];
			}
			if(extraBytes > 1) {
				hex += HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F];
			}
			if(extraBytes > 2) {
				hex += HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F];
			}
		}
		return hex;
	};

	Keccak.prototype.buffer = function() {
		this.finalize();

		var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, 
			extraBytes = this.extraBytes, i = 0, j = 0;
		var bytes = this.outputBits >> 3;
		var buffer;
		if(extraBytes) {
			buffer = new ArrayBuffer((outputBlocks + 1) << 2);
		} else {
			buffer = new ArrayBuffer(bytes);
		}
		var array = new Uint32Array(buffer);
		while(j < outputBlocks) {
			for(i = 0;i < blockCount && j < outputBlocks;++i, ++j) {
				array[j] = s[i];
			}
			if(j % blockCount == 0) {
				f(s);
			}
		}
		if(extraBytes) {
			array[i] = s[i];
			buffer = buffer.slice(0, bytes);
		}
		return buffer;
	};

	Keccak.prototype.digest = Keccak.prototype.array = function() {
		this.finalize();

		var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, 
		extraBytes = this.extraBytes, i = 0, j = 0;
		var array = [], offset, block;
		while(j < outputBlocks) {
			for(i = 0;i < blockCount && j < outputBlocks;++i, ++j) {
				offset = j << 2;
				block = s[i];
				array[offset] = block & 0xFF;
				array[offset + 1] = (block >> 8) & 0xFF;
				array[offset + 2] = (block >> 16) & 0xFF;
				array[offset + 3] = (block >> 24) & 0xFF;
			}
			if(j % blockCount == 0) {
				f(s);
			}
		}
		if(extraBytes) {
			offset = j << 2;
			block = s[i];
			if(extraBytes > 0) {
				array[offset] = block & 0xFF;
			}
			if(extraBytes > 1) {
				array[offset + 1] = (block >> 8) & 0xFF;
			}
			if(extraBytes > 2) {
				array[offset + 2] = (block >> 16) & 0xFF;
			}
		}
		return array;
	};

	var f = function(s) {
		var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, 
		b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, 
		b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, 
		b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
		for(n = 0; n < 48; n += 2) {
			c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
			c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
			c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
			c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
			c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
			c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
			c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
			c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
			c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
			c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

			h = c8 ^ ((c2 << 1) | (c3 >>> 31));
			l = c9 ^ ((c3 << 1) | (c2 >>> 31));
			s[0] ^= h;
			s[1] ^= l;
			s[10] ^= h;
			s[11] ^= l;
			s[20] ^= h;
			s[21] ^= l;
			s[30] ^= h;
			s[31] ^= l;
			s[40] ^= h;
			s[41] ^= l;
			h = c0 ^ ((c4 << 1) | (c5 >>> 31));
			l = c1 ^ ((c5 << 1) | (c4 >>> 31));
			s[2] ^= h;
			s[3] ^= l;
			s[12] ^= h;
			s[13] ^= l;
			s[22] ^= h;
			s[23] ^= l;
			s[32] ^= h;
			s[33] ^= l;
			s[42] ^= h;
			s[43] ^= l;
			h = c2 ^ ((c6 << 1) | (c7 >>> 31));
			l = c3 ^ ((c7 << 1) | (c6 >>> 31));
			s[4] ^= h;
			s[5] ^= l;
			s[14] ^= h;
			s[15] ^= l;
			s[24] ^= h;
			s[25] ^= l;
			s[34] ^= h;
			s[35] ^= l;
			s[44] ^= h;
			s[45] ^= l;
			h = c4 ^ ((c8 << 1) | (c9 >>> 31));
			l = c5 ^ ((c9 << 1) | (c8 >>> 31));
			s[6] ^= h;
			s[7] ^= l;
			s[16] ^= h;
			s[17] ^= l;
			s[26] ^= h;
			s[27] ^= l;
			s[36] ^= h;
			s[37] ^= l;
			s[46] ^= h;
			s[47] ^= l;
			h = c6 ^ ((c0 << 1) | (c1 >>> 31));
			l = c7 ^ ((c1 << 1) | (c0 >>> 31));
			s[8] ^= h;
			s[9] ^= l;
			s[18] ^= h;
			s[19] ^= l;
			s[28] ^= h;
			s[29] ^= l;
			s[38] ^= h;
			s[39] ^= l;
			s[48] ^= h;
			s[49] ^= l;

			b0 = s[0];
			b1 = s[1];
			b32 = (s[11] << 4) | (s[10] >>> 28);
			b33 = (s[10] << 4) | (s[11] >>> 28);
			b14 = (s[20] << 3) | (s[21] >>> 29);
			b15 = (s[21] << 3) | (s[20] >>> 29);
			b46 = (s[31] << 9) | (s[30] >>> 23);
			b47 = (s[30] << 9) | (s[31] >>> 23);
			b28 = (s[40] << 18) | (s[41] >>> 14);
			b29 = (s[41] << 18) | (s[40] >>> 14);
			b20 = (s[2] << 1) | (s[3] >>> 31);
			b21 = (s[3] << 1) | (s[2] >>> 31);
			b2 = (s[13] << 12) | (s[12] >>> 20);
			b3 = (s[12] << 12) | (s[13] >>> 20);
			b34 = (s[22] << 10) | (s[23] >>> 22);
			b35 = (s[23] << 10) | (s[22] >>> 22);
			b16 = (s[33] << 13) | (s[32] >>> 19);
			b17 = (s[32] << 13) | (s[33] >>> 19);
			b48 = (s[42] << 2) | (s[43] >>> 30);
			b49 = (s[43] << 2) | (s[42] >>> 30);
			b40 = (s[5] << 30) | (s[4] >>> 2);
			b41 = (s[4] << 30) | (s[5] >>> 2);
			b22 = (s[14] << 6) | (s[15] >>> 26);
			b23 = (s[15] << 6) | (s[14] >>> 26);
			b4 = (s[25] << 11) | (s[24] >>> 21);
			b5 = (s[24] << 11) | (s[25] >>> 21);
			b36 = (s[34] << 15) | (s[35] >>> 17);
			b37 = (s[35] << 15) | (s[34] >>> 17);
			b18 = (s[45] << 29) | (s[44] >>> 3);
			b19 = (s[44] << 29) | (s[45] >>> 3);
			b10 = (s[6] << 28) | (s[7] >>> 4);
			b11 = (s[7] << 28) | (s[6] >>> 4);
			b42 = (s[17] << 23) | (s[16] >>> 9);
			b43 = (s[16] << 23) | (s[17] >>> 9);
			b24 = (s[26] << 25) | (s[27] >>> 7);
			b25 = (s[27] << 25) | (s[26] >>> 7);
			b6 = (s[36] << 21) | (s[37] >>> 11);
			b7 = (s[37] << 21) | (s[36] >>> 11);
			b38 = (s[47] << 24) | (s[46] >>> 8);
			b39 = (s[46] << 24) | (s[47] >>> 8);
			b30 = (s[8] << 27) | (s[9] >>> 5);
			b31 = (s[9] << 27) | (s[8] >>> 5);
			b12 = (s[18] << 20) | (s[19] >>> 12);
			b13 = (s[19] << 20) | (s[18] >>> 12);
			b44 = (s[29] << 7) | (s[28] >>> 25);
			b45 = (s[28] << 7) | (s[29] >>> 25);
			b26 = (s[38] << 8) | (s[39] >>> 24);
			b27 = (s[39] << 8) | (s[38] >>> 24);
			b8 = (s[48] << 14) | (s[49] >>> 18);
			b9 = (s[49] << 14) | (s[48] >>> 18);

			s[0] = b0 ^ (~b2 & b4);
			s[1] = b1 ^ (~b3 & b5);
			s[10] = b10 ^ (~b12 & b14);
			s[11] = b11 ^ (~b13 & b15);
			s[20] = b20 ^ (~b22 & b24);
			s[21] = b21 ^ (~b23 & b25);
			s[30] = b30 ^ (~b32 & b34);
			s[31] = b31 ^ (~b33 & b35);
			s[40] = b40 ^ (~b42 & b44);
			s[41] = b41 ^ (~b43 & b45);
			s[2] = b2 ^ (~b4 & b6);
			s[3] = b3 ^ (~b5 & b7);
			s[12] = b12 ^ (~b14 & b16);
			s[13] = b13 ^ (~b15 & b17);
			s[22] = b22 ^ (~b24 & b26);
			s[23] = b23 ^ (~b25 & b27);
			s[32] = b32 ^ (~b34 & b36);
			s[33] = b33 ^ (~b35 & b37);
			s[42] = b42 ^ (~b44 & b46);
			s[43] = b43 ^ (~b45 & b47);
			s[4] = b4 ^ (~b6 & b8);
			s[5] = b5 ^ (~b7 & b9);
			s[14] = b14 ^ (~b16 & b18);
			s[15] = b15 ^ (~b17 & b19);
			s[24] = b24 ^ (~b26 & b28);
			s[25] = b25 ^ (~b27 & b29);
			s[34] = b34 ^ (~b36 & b38);
			s[35] = b35 ^ (~b37 & b39);
			s[44] = b44 ^ (~b46 & b48);
			s[45] = b45 ^ (~b47 & b49);
			s[6] = b6 ^ (~b8 & b0);
			s[7] = b7 ^ (~b9 & b1);
			s[16] = b16 ^ (~b18 & b10);
			s[17] = b17 ^ (~b19 & b11);
			s[26] = b26 ^ (~b28 & b20);
			s[27] = b27 ^ (~b29 & b21);
			s[36] = b36 ^ (~b38 & b30);
			s[37] = b37 ^ (~b39 & b31);
			s[46] = b46 ^ (~b48 & b40);
			s[47] = b47 ^ (~b49 & b41);
			s[8] = b8 ^ (~b0 & b2);
			s[9] = b9 ^ (~b1 & b3);
			s[18] = b18 ^ (~b10 & b12);
			s[19] = b19 ^ (~b11 & b13);
			s[28] = b28 ^ (~b20 & b22);
			s[29] = b29 ^ (~b21 & b23);
			s[38] = b38 ^ (~b30 & b32);
			s[39] = b39 ^ (~b31 & b33);
			s[48] = b48 ^ (~b40 & b42);
			s[49] = b49 ^ (~b41 & b43);

			s[0] ^= RC[n];
			s[1] ^= RC[n + 1];
		}
	}

	//if(!root.JS_SHA3_TEST && NODE_JS) {
	//	module.exports = methods;
	//} else if(root) {
		for(var key in methods) {
			root[key] = methods[key];
		}
	//}
}(global));

Hash = {
	sha3_512_start : function() {
		__kernel_hash = global.sha3_512.create();
		return { result : true };
	}
	, sha3_512_iter : function(data) {
		var msg = [];
		for(var i = 0;i < data.length;++i)
			msg.push(data.charCodeAt(i));
		__kernel_hash.update(msg);
		return { result : true, data : __kernel_hash.hex() };
	}
}


/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = { // not default 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._$",
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = Base64._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = Base64._utf8_decode(output);
		return output;
	},
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}

function guid() {
	function s4() {
		return Math.floor(Math.random()*0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function generateTokens(n) {

	if(!fs.existsSync("users")) fs.mkdirSync("users");
	if(!fs.existsSync("users"+path.sep+"info.json")) fs.writeFileSync("users"+path.sep+"info.json","{}");
	var users_info = fs.readFileSync("users"+path.sep+"info.json");
	
	var list = {};
	for(var x = 0; x < n;x++) {
		var id = guid();
		while(id in list) id = guid();
		var next = false;
		for(var username in users_info) {
			if(id == users_info[username].token) {
				next = true;
				break;
			}
		}
		if(next) {
			x--;
			continue;
		}
		list[id] = {};
	}
	fs.writeFileSync("tokens.json",JSON.stringify(list));
}
generateTokens(64);

function createUserList() {
	fs.writeFileSync("users.json",JSON.stringify({}));
}
function createSessionFile() {
}
function createUser() {
}
function createUserFolder() {
}
function createUserInfoFile() {
}

function Server(port,host,timeout) {
	this.port = port;
	this.host = host;
	this.debugFlag = false;
	this.timer = new Date();
	this.timeout = timeout;
	this.running = true;
	var self = this;
	self.sessionLastSave = 0;
	self.sessionCount = 0;
	self.sessionCache = null;
	function processing(request,response,container) {
		if(self.running) {
			if(self.sessionCache == null) {
				self.sessionCache = fs.existsSync("session.json") ? JSON.parse( fs.readFileSync("session.json") ) : {};
			} else {
				self.sessionCount += 1;
			}
			if(container.path=="/") {
				var data = child_process.spawn("arp",["-a"]);
				var buffer = [];
				data.stdout.on('data', function(data) { buffer.push(data); });
				data.stderr.on('data', function (data) { console.log(`stderr: ${data}`); });
				data.on('close', function(code) {
					response.writeHead(200, {"content-type": "text/html","connection":"close"});
					var data1 = /Interface: \d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}/.exec( buffer.join(" ") );
					// buffer.join(" ");//
					response.write(
						"<!doctype html><html>"+
						"<head>"+
						"<script>"+
						fs.readFileSync("./client/0x01.js")+"\r\n"+
						fs.readFileSync("./client/0x02.js")+"\r\n"+
						fs.readFileSync("./client/0x03.js")+"\r\n"+
						fs.readFileSync("./client/0x04.js")+"\r\n"+
						fs.readFileSync("./client/0x05.js")+"\r\n"+
						fs.readFileSync("./client/0x06.js")+"\r\n"+
						fs.readFileSync("./client/0x07.js")+"\r\n"+
						fs.readFileSync("./client/0x08.js")+"\r\n"+
						fs.readFileSync("./client/0x09.js")+"\r\n"+
						fs.readFileSync("./client/0x0A.js")+"\r\n"+
						//fs.readFileSync("./client/0x00.js")+"\r\n"+
						"</script>"+
						"</head><body>"+
						
						// ip interface
						"<div style=\"position:absolute;left:10px;top:10px;border:solid 1px #000;\">"+
						container.clientIp+
						//"<br/>"+data1[0].substring("Interface: ".length)+
						"</div>"+
						
						
						// start panel
						"<div id=\"panelLogin\" style=\"position:absolute;left:10px;top:40px;border:solid 1px #000;padding:10px;background-color:#ec3;\">"+
							// login interface
							"<table>"+
								"<tr><td align=\"right\" valign=\"top\">usuario : </td><td valign=\"top\"><input id=\"login_username\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td align=\"right\" valign=\"top\">senha : </td><td valign=\"top\"><input id=\"login_password\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/><br/><a style=\"font-size:13px;\">esqueceu a senha?</a></td></tr>"+
								"<tr><td></td><td id=\"login_btn\" style=\"text-align:center;\">acessar</td></tr>"+
							"</table>"+
							// register interface
							"<table>"+
								"<tr><td align=\"right\">usuario : </td><td><input id=\"register_username\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td align=\"right\">senha : </td><td><input id=\"register_password1\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td align=\"right\">senha : </td><td><input id=\"register_password2\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td align=\"right\">token : </td><td><input id=\"register_token\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td></td><td id=\"register_btn\" style=\"text-align:center;\">registrar</td></tr>"+
							"</table>"+
							"<div id=\"lblErrorMessage\" style=\"border:solid 1px #f00;background-color:#fff;color:#000;display:none;padding:5px;\"></div>"+
						"</div>"+
						
						
						// logout interface
						"<div id=\"btnLogout\" style=\"position:absolute;top:10px;\">"+
						"logout"+
						"</div>"+
						
						// terminal interface
						"<div id=\"terminal\" style=\"display:none;position:absolute;left:10px;top:40px;padding:10px;\">"+
							"<div id=\"frameContacts\" style=\"position:absolute;\">"+
								"<div>contatos</div>"+
								"<div id=\"lstContacts\"></div>"+
							"</div>"+
							"<div style=\"position:relative;width:780px;height:30px;border:solid 1px #000;padding:5px;background-color:#eee;\">"+
								"<input id=\"txtCommand\" type=\"text\" style=\"width:755px;height:25px;border:solid 1px #000;outline:0px;padding-left:10px;padding-right:10px;\"/>"+
							"</div>"+
							"<div id=\"lstThreads\" style=\"position:absolute;left:10px;top:52px;border:solid 1px #000;\"></div>"+
						"</div>"+
						
						// [system]
						
							// add user user2 ( adicionar contato )
						
							// find user where word + exists
							// find user where sentence add user exists
							
							// remove user ( remover contato )
						
							// enviar mensage para contato
						
							// use user user1
						
												
						// add word ( adicionar topico )
						
						// list words ( listar topicos )
						
						//	list instance of word ( listar items usando pesquisa )
						
						// remove word ( remover topicos )
						
						// add instance of word ( adicionar item ao topico ) -> json :: drawing, point, message, number, audio, video
						
						// find instance of word ( procurar items usando topico )
						
						// 	remove instance of word ( remover items usando pesquisa )
						
						// add sentence ( adicionar mote )
						
						// find senteces ( procurar mote )
						
						// 	remove sentence ( remove mote )
						
						// add instance of sentence ( adicionar conjunto de items dos topicos do mote )
						
						// find instances of sentence ( procurar items dos topicos do mote )
						
						// 	remove instances of sentence ( remover conjunto de items dos topicos do mote )
						
						// 	refine search of instances of sentence ( especificar mote )
						
						
						"</body></html>"
					);
					response.end();
					console.log(`child process exited with code ${code}`);
				});
			} else if(container.path == "/json.login") {
				response.writeHead(200, {"content-type": "application/json","connection":"close"});
				if(!fs.existsSync("users")) {
					response.write("{\"result\":false}");
					fs.mkdirSync("users");
					fs.writeFileSync("users"+path.sep+"info.json","{}");
				} 
				
				if("username" in container.get && "password" in container.get) { // relogin (new session)
					// get users/info.json
					var users = JSON.parse( fs.readFileSync("users"+path.sep + "info.json", "utf8") );
					var a = users[ container.get.username ].password;
					Hash.sha3_512_start();
					var b = Hash.sha3_512_iter( container.get.password ).data;
					console.log("users[ container.get.username ].password",a);
					console.log("container.get.password",container.get.password,b);
					if( container.get.username in users && a == b ) {
						var id = guid();
						var hash = self.sessionCache;
						if(id in hash) while(id in hash) id = guid();
						hash[id] = {csrf:id,username:container.get.username,log:[["in",new Date()]]}
						if(self.sessionCount % 10 == 0) fs.writeFileSync("session.json",JSON.stringify(hash));
						response.write("{\"result\":true,\"csrf_cookie\":\""+id+"\"}");
					} else {
						response.write("{\"result\":false,\"message\":\"incorrect username or password.\"}");
					}
					
				} else if("csrf_cookie" in container.get) { // auto relogin (reuse session)
					// relogin
					
					var hash = self.sessionCache;
					if(hash==null) {
						response.write("{\"result\":false,\"message\":\"server internal error(2).\"}");
					} else {
						if(container.get.csrf_cookie in hash) {
							hash[ container.get.csrf_cookie ].log.push(["rein",new Date()]);
							response.write("{\"result\":true}");
							if(self.sessionCount % 10 == 0) fs.writeFileSync("session.json",JSON.stringify(hash));
						} else {
							response.write("{\"result\":false}");
						}
					}
				}
				response.end();
			} else if(container.path == "/json.logout") {
				if("csrf_cookie" in container.get) {
					// csrf_cookie -> username -> log out
					var hash = self.sessionCache;
					if(hash==null) {
						response.writeHead(200, {"content-type": "application/json","connection":"close"});
						response.write("{\"result\":false,\"message\":\"server internal error(1).\"}");
						response.end();
					} else {
						var logout_date = new Date();
						if(container.get.csrf_cookie in hash) {
							hash[ container.get.csrf_cookie ].log.push(["out",logout_date]);
						}
						// transfer log from session to history in user, using logout date
						console.log("HASH:" + JSON.stringify(hash) + " || " + container.get.csrf_cookie );
						if(fs.existsSync(
							"users"+path.sep
							+hash[container.get.csrf_cookie ].username+path.sep
							+"history.json"
						)) {
							var history = JSON.parse( fs.readFileSync("users"+path.sep+hash[container.get.csrf_cookie ].username+path.sep+"history.json") );
							history[ logout_date.valueOf() ] = hash[ container.get.csrf_cookie ].log;
							fs.writeFileSync("users"+path.sep+hash[container.get.csrf_cookie ].username+path.sep+"history.json",JSON.stringify(history));
						}
						// remove session
						delete hash[container.get.csrf_cookie];
						if(self.sessionCount % 10 == 0)  fs.writeFileSync("session.json",JSON.stringify(hash));
						
						response.writeHead(200, {"content-type": "application/json","connection":"close"});
						response.write("{\"result\":true}");
						response.end();
						
					}
				} else {
					response.writeHead(200, {"content-type": "application/json","connection":"close"});
					response.write("{\"result\":false,\"message\":\"wrong cookie.\"}");
					response.end();
				}
			} else if(container.path == "/json.register") {
				console.log(JSON.stringify(container.get));
				response.writeHead(200, {"content-type": "application/json","connection":"close"});
				// format accepted for json.register
				if("username" in container.get && "password" in container.get && "token" in container.get) {
					console.log("FIND FOR ",container.get.token);
					var tokens = JSON.parse( fs.readFileSync("tokens.json") );
					var check = false;
					if(container.get.token in tokens) check = true;
					if(check) {
						console.log("FOUND TOKEN");
						
						if(!fs.existsSync("users")) fs.mkdirSync("users");
						if(!fs.existsSync("users"+path.sep+"info.json")) fs.writeFileSync("users"+path.sep+"info.json","{}");
						
						var info = JSON.parse( fs.readFileSync("users"+path.sep+"info.json") );
						
						// recheck of token reuse, do not allow duplicates
						var check = false;
						for(var username in info) {
							if(info[username].token == container.get.token) {
								check = true;
								console.log("TOKEN HAS ALREADY BEEM USED.");
								response.write("{\"result\":false,\"message\":\"token has already been used.\"}");
								response.end();
								delete tokens[ container.get.token ];
								fs.writeFileSync("tokens.json",JSON.stringify(tokens));
								return;
							}
						}
						
						if(!check && container.get.username in info) {
							console.log("USERNAME HAS ALREADY BEEN TAKEN.");
							response.write("{\"result\":false,\"message\":\"username has already been taken.\"}");
						} else {
							var id = guid();
							var hash = self.sessionCache;
							if(id in hash) while(id in hash) id = guid();
							hash[id] = {csrf:id,username:container.get.username,log:[["in",new Date()]]};
							if(self.sessionCount % 10 == 0) fs.writeFileSync("session.json",JSON.stringify(hash));
							Hash.sha3_512_start();
							info[container.get.username] = { 
								token : container.get.token,
								password : Hash.sha3_512_iter(container.get.password).data
							};
							console.log("A0",container.get.password,info[container.get.username].password);
							fs.writeFileSync("users"+path.sep+"info.json",JSON.stringify(info));
							console.log("REGISTERED AND LOGGED AS " + id);
							if(!fs.existsSync("users"+path.sep+container.get.username)) fs.mkdirSync("users"+path.sep+container.get.username);
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"history.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"history.json","{}");
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"parser.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"parser.json",
								"{"+
									"\"main\" : \"main\","+
									"\"stack\" : [{\"main\":[[[1,\"OK\"]]}]"+
								"}"
							);
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"words.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"base.json","{}");
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"words.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"words.json","{}");
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"sentences.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"sentences.json","{}");
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"texts.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"texts.json","{}");
							response.write("{\"result\":true,\"csrf_cookie\":\""+id+"\"}");
						}
						
						response.end();
						delete tokens[ container.get.token ];
						fs.writeFileSync("tokens.json",JSON.stringify(tokens));
						
						return;
						
					} else {
						console.log("TOKEN NOT FOUND");
						response.write("{\"result\":false,\"message\":\"token not found.\"}");
						response.end();
						return;
					}
				} else {
					console.log("INVALID ARGUMENTS TO REGISTER");
					response.write("{\"result\":false,\"message\":\"invalid arguments to register a username.\"}");
					response.end();
					return;
				}
			} else if(container.path == "/json.login_remember") {
			
			} else if(container.path == "/json.parser") {
				response.writeHead(200, {"content-type": "application/json","connection":"close"});
				if( "query" in container.get && "csrf_cookie" in container.get) {
					
					var shell = require("./webshell.js");
					var results = {
						code : 0,
						data : null
					};
					var error = false;
					var error_message = "";
					try {
						
						console.log(">> call to webshell");
						var username = self.sessionCache[container.get.csrf_cookie ].username;
						var options  = {
							run : true,
							doc : unescape(container.get.query),
							username : username,
							start : "main",
							events : {
								"SystemAddBegin" : function(ctx,index,data) {
									if(!("flags" in ctx)) ctx.flags = {};
									if(!("storage" in ctx)) ctx.storage = {};
									ctx.storage.add = [];
									ctx.storage.addType = [];
									ctx.flags.add = true;
									console.log("!C");
								},
								"SystemAddEnd" : function(ctx,index,data) {
									console.log(ctx.storage.add);
									results.code = 1; // add topic
									results.data = ctx.storage.add;
									ctx.flags = false;
									console.log("!D");
								},
								"SyntaxCustomWords" : function(ctx,index,data) {
									if("flags" in ctx && "add" in ctx.flags && ctx.flags.add) {
										console.log("!B");
										ctx.storage.add.push(data[0]);
										ctx.storage.addType.push(0);
										//console.log("{{ " + data + " }}");
									}
								},
								"TypeName" : function(ctx,index,data) {
									console.log("!A");
									if("flags" in ctx && "add" in ctx.flags && ctx.flags.add) {
										console.log("!B");
										ctx.storage.add.push(data[0]);
										ctx.storage.addType.push(1); // not found word
									}
								},
								"AddUser" : function(ctx,index,data) {
									console.log("<<<",data,">>>");
									// check if user exists
									var info = fs.existsSync("users" + path.sep + "info.json") ? JSON.parse(fs.readFileSync("users" + path.sep + "info.json")) : null;
									if(info!=null) {
										if(username in info && data[4] in info) {
											var parser = fs.existsSync("users" + path.sep + username + path.sep + "parser.json") ? JSON.parse(fs.readFileSync("users" + path.sep + username + path.sep + "parser.json","utf8")) : null;
											parser.stack[0]._Contacts.push(data[4]);
											fs.writeFileSync("users" + path.sep + username + path.sep + "parser.json",JSON.stringify(parser));
											console.log("add user " + data[4] + " to " + username + " contact list.");
										} else {
											if(!(username in info)) {
												console.log(username + " not found.(critical)");
											}
											if(!(data[4] in info)) {
												console.log(data[4] + " not found.(critical)");
											}
										}
									} else {
										console.log("users list not found.");
									}
								}
							}
						};
						var r = shell.parse(options);
						if(r.result) {
							console.log(r.code);
						}
						//console.log(JSON.stringify(r));
						console.log(">> end of call to webshell");
					} catch(e) {
						console.log(
							"[error]",
							JSON.stringify(e),
							e.message,
							e.stack
						);
						error_message = e.message;
						error = true;
					}
					
					if(!error) {
						if(results.code == 0) {
							response.write("{\"result\":true,\"code\":0}");
							response.end();
						} else if(results.code == 1) {
							response.write("{\"result\":true,\"code\":1,\"data\":"+JSON.stringify(results.data)+"}");
							response.end();
						}
						
					} else {
						response.write("{\"result\":false,\"message\":\"parser error:"+error_message+"\"}");
						response.end();
					}
				} else {
					response.write("{\"result\":false,\"message\":\"invalid arguments to parse command.\"}");
					response.end();
				}
				
			}
		} else {
			response.writeHead(500, {"content-type": "text/html","connection":"close"});
			response.write("<!doctype html><html><body>500</body></html>");
			response.end();
			self.stop();
		}
	}
	
	function handler(request,response) {
		if(self.running) {
			var container = {};
			var arr_url = request.url.split('?');
			var base_url = arr_url[0]; // without arguments and hashes
			arr_url.shift(); // remove base_url
			var args = arr_url.join("").split("&");
			var queryString = {};
			
			container.cookies = {};
			container.post = {};
			container.get = {};
			container.path = base_url;
			container.clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
			if("cookie" in request.headers) {
				var full_cookie = request.headers["cookie"];
				cookie_vars = full_cookie.split(";");
				for(var c in cookie_vars) { var item = cookie_vars[c].split("="); container.cookies[ item[0].trim() ] = item[1]; }
			}
			if (request.method == 'POST') {
				container.method = "post";
				var cbuffer = [];
				request.on('data', function(chunk) {
					cbuffer.push( chunk.toString());
				});
				request.on('end', function() {
					for(var x = 0; x < args.length;x++) { 
						var tmp_obj = args[x].split('='); 
						container.get[ tmp_obj[0] ] = tmp_obj[1];
					}
					var arr = cbuffer.join("").split("&");
					for(var x = 0; x < arr.length;x++) {
						var obj = arr[x].split("=");
						container.post[obj[0]] = obj[1];
					}
					if(self.debugFlag) {
						var message = "request [ method : " + container.method + ", url: \"" + base_url + "\", get: "+JSON.stringify(container.get)+", post: "+JSON.stringify(container.post)+" ]"
						if(self.debugFlag) console.log("[system] " + message);
						fs.appendFileSync("log.txt","[i] " + self.host + ":" + self.port + " -> " + message+"\r\n");
					}
					processing(request,response,"post",base_url,qs);
				});
			} else if(request.method == 'GET') {
				container.method = "get";
				for(var x = 0; x < args.length;x++) { 
					var tmp_obj = args[x].split('='); 
					container.get[ tmp_obj[0] ] = tmp_obj[1]; 
				}
				if(self.debugFlag) {
					var message = "request [ method : " + container.method + ", url: \"" + base_url + "\", get: "+JSON.stringify(container.get)+"]";
					if(self.debugFlag) console.log("[system] " + message);
					fs.appendFileSync("log.txt","[i] " + self.host + ":" + self.port + " -> " + message+"\r\n");
				}
				processing(request,response,container);
			}
		} else {
			response.writeHead(500, {"content-type": "text/html","connection":"close"});
			response.write("<!doctype html><html><body>500</body></html>");
			response.end();
			self.stop();
		}
	}
	process.on('SIGINT', function() {
		fs.appendFileSync("log.txt","[-] " + self.host + ":" + self.port + " -> " + new Date().toISOString() +"\r\n");
	    	process.exit();
	});
	this.server = http.createServer(handler);
	self.sessionCache = fs.existsSync("session.json") ? JSON.parse( fs.readFileSync("session.json") ) : {};
	this.server.on("error",function(err) {
		console.log("err:",err);
	});
	this.services = setInterval(function() {
		if(self.timeout>0) {
			if( (new Date()).valueOf() > (self.timer.valueOf() + self.timeout) ) {
				self.stop();
			}
		}
		fs.writeFileSync("session.json",JSON.stringify(self.sessionCache)); // every 10sec backup sessionCache.
		
	},10000);
}

Server.prototype.debug = function(flag) {
	this.debugFlag = !!flag;
}

Server.prototype.start = function() {
	if(this.debugFlag) console.log("[system] server " + this.host + " started at port " + this.port + ".");
	this.server.listen(this.port, this.host);
	fs.appendFileSync("log.txt","[+] " + this.host + ":" + this.port + " -> " + new Date().toISOString() +"\r\n");
}
Server.prototype.stop = function() {
	var self = this;
	this.server.close(function() {
		if(self.debugFlag) console.log("[system] server " + self.host + " at port " + self.port + " stoped.");
	});
	clearInterval(this.services);
	fs.appendFileSync("log.txt","[-] " + this.host + ":" + this.port + " -> " + new Date().toISOString() +"\r\n");
}

var server = new Server(80,"0.0.0.0",-1);
server.debug(true);
server.start();
