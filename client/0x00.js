
/*
	roteiro do sistema
		
		ajax to get answers
		then
		1)
		send login form
		then
		receive login form
		then
			update to command window in case of succed login
				send command form
					[ word (topico) | sentences (mote) | code(artigo) ]
					add word ( adicionar topico )
					list words ( listar topicos )
						list instance of word ( listar items usando pesquisa )
					remove word ( remover topicos )
					add instance of word ( adicionar item ao topico ) -> json :: drawing, point, message, number, audio, video
					find instance of word ( procurar items usando topico )
						remove instance of word ( remover items usando pesquisa )
					add sentence ( adicionar mote )
					find senteces ( procurar mote )
						remove sentence ( remove mote )
					add instance of sentence ( adicionar conjunto de items dos topicos do mote )
					find instances of sentence ( procurar items dos topicos do mote )
						remove instances of sentence ( remover conjunto de items dos topicos do mote )
						refine search of instances of sentence ( especificar mote )
					ask [interface] on sentence. ( adicionar eventos de mote )
					
			clear screen window in case of fail login
			
			// abstraction :
			//	word -> word instance -> sentence item reference
			//	word -> word instance
			4) log actions
		2) remember login
		3) create login (token)
		
*/
var __kernel_sha3 = {};
var __kernel_hash = null;



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

	if(!root.JS_SHA3_TEST && NODE_JS) {
		module.exports = methods;
	} else if(root) {
		for(var key in methods) {
			root[key] = methods[key];
		}
	}
}(__kernel_sha3));


Hash = {
	sha3_512_start : function() {
		__kernel_hash = __kernel_sha3.sha3_512.create();
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
console.log(" ok" );
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
function ImportInstanceHeader() {
	this.url = "";
	this.method = "get";
	this.data = {};
	this.json = false;
	this.headers = [];
};
ImportInstanceHeader.prototype.formatArguments = function() {
	var arr = [], str;
	for(var name in this.data) {
		arr.push(name + '=' + encodeURIComponent(this.data[name]));
	}
	str = arr.join('&');
	if(str != '') {
		return this.method == "get" ? 
			(this.url.indexOf('?') < 0 ? '?' + str : '&' + str) : 
			str;
	}
	return '';
}
function Import(opt) {
	if(!( this instanceof Import )) return new Import(opt);
	this.host = {};
	this.doneCallback = null;
	this.failCallback = null;
	this.xhr = null;
	this.info = new ImportInstanceHeader;
	if(Object.prototype.toString.apply(opt)=="[object String]") {
		this.info.url = opt;
	}
	if(Object.prototype.toString.apply(opt)=="[object Object]") {
		if("url" in opt) this.info.url = opt.url;
		if("method" in opt) this.info.method = opt.method;
		if("data" in opt) this.info.data = opt.data;
		if("json" in opt) this.info.json = opt.json;
	}
}
Import.prototype.done = function(callback) { this.doneCallback = callback; return this; };
Import.prototype.fail = function(callback) { this.failCallback = callback; return this; };
Import.prototype.always = function(callback) { this.alwaysCallback = callback; return this; };
Import.prototype.setHeaders = function(headers) {
	this.info.headers = headers;
	for(var name in this.info.headers) { this.xhr && this.xhr.setRequestHeader(name, this.info.headers[name]); }
	return this;
};
Import.prototype.send = function() {
	if(this.info.url.indexOf("localServer://")==0) {// mock server (GET)
		// find local servers
		
		// set callbacks for the request instance
		
		// set parameters of request
		
		// get localstorage data associated to url and send to worker, wait for response
		
		
	} else {
		var self = this;
		if(window.ActiveXObject) { 
			this.xhr = new ActiveXObject('Microsoft.XMLHTTP'); 
		} else if(window.XMLHttpRequest) { 
			this.xhr = new XMLHttpRequest();
		}
		if(!this.xhr) throw "xhr can't initiate.";
		this.xhr.onreadystatechange = function() {
			if(self.xhr.readyState == 4 && self.xhr.status == 200) {
				var result = self.xhr.responseText;
				if(self.info.json === true && typeof JSON != 'undefined') {
					result = JSON.parse(result);
				}
				self.doneCallback && self.doneCallback.apply(self.host, [result, self.info]);
			} else if(self.xhr.readyState == 4) {
				self.failCallback && self.failCallback.apply(self.host, [self.info]);
			}
			self.alwaysCallback && self.alwaysCallback.apply(self.host, [self.info]);
		}
		if(this.info.method == 'get') {
			this.xhr.open("GET", this.info.url + this.info.formatArguments(), true);
		} else if(this.info.method=="post"){
			this.xhr.open("POST", this.info.url, true);
			this.setHeaders({
				'X-Requested-With': 'XMLHttpRequest',
				'Content-type': 'application/x-www-form-urlencoded'
			});
		} else {
			this.xhr.open("GET", this.info.url + this.info.formatArguments(), true);
		}
		if(this.info.headers && typeof this.info.headers == 'object') {
			for(var name in this.info.headers) this.xhr && this.xhr.setRequestHeader(name, this.info.headers[name]);
		}
		if(this.info.method=="post") {
			self.xhr.send(this.info.formatArguments());
		} else {
			self.xhr.send();
		}
		return this;
	}
};
function ImportList(import_arr) {
	if(!( this instanceof ImportList )) return new ImportList(import_arr);
	this.fetch = import_arr;
	this.complete = false;
	this.data = [];
}
ImportList.prototype.done = function(callback) { this.doneCallback = callback; return this; };
ImportList.prototype.fail = function(callback) { this.failCallback = callback; return this; };
ImportList.prototype.always = function(callback) { this.alwaysCallback = callback; return this; };
ImportList.prototype.send = function() {
	
	//console.log("@@@@@@@@ IMPORT LIST SEND");
	var self = this;
	var _done = function(x,a,b) {
		//console.log("@@@@@@@@ IMPORT LIST RECEIVE");
		self.data[x].result = a;
		self.data[x].info = b;
		self.data[x].state |= 1;
		
		var check = false;
		var allok = true;
		var results = [];
		var infos = [];
		for(var _x = 0; _x < self.data.length; _x++) {
			//console.log("        x:",_x,self.data.length,self.data[_x].state);
			if( (self.data[_x].state & 0x1) == 0) {
				//console.log("break");
				check = true;
				break;
			} else {
				if( (self.data[_x].state & 0x2) != 0 ) {
					allok = false;
					results.push("");
					infos.push( self.data[_x].info );
				} else {
					results.push( self.data[_x].result );
					infos.push( self.data[_x].info );
				}
			}
			
		}
		
		if(!check) {
			if(allok) {
				self.doneCallback&&self.doneCallback.apply({},[results,infos]);
			} else {
				self.failCallback&&self.failCallback.apply({},[infos]);
			}
			self.alwaysCallback&&self.alwaysCallback.apply({},[infos]);
		}
		
	}
	var _fail = function(x,a) {
		//console.log("XHR FAIL:",a.url);
		self.data[x].info = a;
		self.data[x].state |= 2;
		
	}
	var _always = function(x,a) {
		
		self.data[x].info = a;
		self.data[x].state |= 4;
		//console.log("@@@@@@@@ IMPORT LIST ALWAYS",self.data[x].state);
		
			
	}
	
	var create_item = function(x,import_arr) {
		return { 
			state : 0,
			result : "",
			info : null,
			target : Import(import_arr[x])
				.done(function(a,b) {
					_done(x,a,b)
				})
				.fail(function(a,b) {
					_fail(x,a)
				})
				.always(function(a,b) {
					_always(x,a)
				})
		};
	}
	
	for(var x = 0; x < this.fetch.length;x++) {
		var item = create_item(x,this.fetch);
		if("headers" in this.fetch[x]) item.target.setHeaders(this.fetch[x].headers);
		this.data.push(item);
	}
	for(var x = 0; x < this.fetch.length;x++) {
		this.data[x].target.send();
	}
}
window.addEventListener("load",function() {
	// verify if localStorage has a crsf cookie -> try to auto login
	var logout = document.getElementById("btnLogout");
	logout.style.display = "none";
	logout.style.left = "800px";
	logout.style.padding = "10px";
	logout.style.cursor = "pointer";
	logout.addEventListener("mouseover",function() {
		logout.style.backgroundColor = "#000";
		logout.style.color = "#fff";
	});
	logout.addEventListener("mouseout",function() {
		logout.style.backgroundColor = "#fff";
		logout.style.color = "#000";
	});
	logout.addEventListener("mousedown",function() {
		var csrf_cookie = localStorage.getItem("csrf-cookie");
		var args = {csrf_cookie:csrf_cookie};
		Import({url:"/json.logout",method:"get",json:true,data:args})
			.done(function(data) {
				if(data.result) {
					localStorage.setItem("csrf-cookie",null);
					delete localStorage["csrf-cookie"];
					localStorage.setItem("username",null);
					document.getElementById("lblErrorMessage").style.display = "none";
					unload_logout();
				} else {
					var error = document.getElementById("lblErrorMessage");
					error.innerHTML = data.message;
					error.style.display = "";
				}
				logout.style.display = "none";
				console.log("logout");
				login_screen();
			})
			.fail(function(error) {
			})
			.send();
	});
	function unload_logout() {
		logout.style.display = "none";
		unload_terminal();
	}
	function load_terminal() {
		var terminal = document.getElementById("terminal");
		terminal.style.display = "";
		terminal.style.border = "1px solid #000";
		terminal.style.width = "800px";
		terminal.style.height = "640px";
	}
	function unload_terminal() {
		var terminal = document.getElementById("terminal");
		terminal.style.display = "none";
	}
	function login_screen() {
		document.getElementById("panelLogin").style.display = "";
		var login_username = document.getElementById("login_username");
		var login_password = document.getElementById("login_password");
		var login_btn =  document.getElementById("login_btn");
		login_btn.style.position = "relative";
		login_btn.style.cursor = "pointer";
		login_btn.style.border = "solid 1px #000";
		login_btn.style.borderTop = "solid 5px #000";
		login_btn.style.borderBottom = "solid 5px #000";
		
		login_btn.style.backgroundColor = "#000";
		login_btn.style.color = "#fff";
		
		login_username.value = "";
		login_password.value = "";
		function submit_login() {
			var username = login_username.value;
			
			Hash.sha3_512_start();
			var args = {
				username : login_username.value,
				password : Hash.sha3_512_iter(login_password.value).data
			};
			Import({url:"/json.login",method:"get",json:true,data:args})
				.done(function(data) {
					//alert(JSON.stringify(data));
					if(data.result) {
						localStorage.setItem("csrf-cookie",data.csrf_cookie);
						localStorage.setItem("username",username);
						document.getElementById("panelLogin").style.display = "none";
						document.getElementById("lblErrorMessage").style.display = "none";
						load_terminal();
						logout.style.display = "";
					} else {
						var error = document.getElementById("lblErrorMessage");
						error.innerHTML = data.message;
						error.style.display = "";
					}
					login_username.value = "";
					login_password.value = "";
				})
				.fail(function(error) {
					var error = document.getElementById("lblErrorMessage");
					error.innerHTML = error.message;
					error.style.display = "";
				})
				.send();
		}
		login_username.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_login(); }
		});
		login_password.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_login(); }
		});
		login_btn.addEventListener("mouseover",function() {
			login_btn.style.borderTop = "solid 5px #000";
			login_btn.style.borderBottom = "solid 5px #000";
			login_btn.style.backgroundColor = "#fff";
			login_btn.style.color = "#000";
		});
		login_btn.addEventListener("mouseout",function() {
			login_btn.style.borderTop = "solid 5px #000";
			login_btn.style.borderBottom = "solid 5px #000";
			login_btn.style.backgroundColor = "#000";
			login_btn.style.color = "#fff";
		});
		login_btn.addEventListener("click",function(e) {
			submit_login();
		});
		
		
		var register_username = document.getElementById("register_username");
		var register_password1 = document.getElementById("register_password1");
		var register_password2 = document.getElementById("register_password2");
		var register_token = document.getElementById("register_token");
		var register_btn = document.getElementById("register_btn");
		register_btn.style.cursor = "pointer";
		register_btn.style.border = "solid 1px #000";
		register_btn.style.borderTop = "solid 5px #000";
		register_btn.style.borderBottom = "solid 5px #000";
		register_btn.style.backgroundColor = "#000";
		register_btn.style.color = "#fff";
		function submit_register() {
			var username = register_username.value;
			if(register_password1.value == register_password2.value) {
				Hash.sha3_512_start();
				var args = {
					username : register_username.value,
					password : Hash.sha3_512_iter(register_password1.value).data,
					token : register_token.value
				};
				//console.log(JSON.stringify(args));
				Import({url:"/json.register",method:"get",json:true,data:args})
					.done(function(data) {
						if(data.result) {
							localStorage.setItem("csrf-cookie",data.csrf_cookie);
							localStorage.setItem("username",username);
							document.getElementById("panelLogin").style.display = "none";
							document.getElementById("lblErrorMessage").style.display = "none";
							logout.style.display = "";
							load_terminal();
						} else {
							var error = document.getElementById("lblErrorMessage");
							error.innerHTML = data.message;
							error.style.display = "";
						}
						register_username.value = "";
						register_password1.value = "";
						register_password2.value = "";
						register_token.value = "";
					})
					.fail(function(error) {
						var error = document.getElementById("lblErrorMessage");
						error.innerHTML = error.message;
						error.style.display = "";
					})
					.send();
			} else {
				var error = document.getElementById("lblErrorMessage");
				error.innerHTML = "please, retype password correctly.";
				error.style.display = "";
				register_password1.value = "";
				register_password2.value = "";
				//alert("please, retype password correctly.");
			}
		}
		
		register_username.value = "";
		register_password1.value = "";
		register_password2.value = "";
		register_token.value = "";
		register_username.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_register(); }
		});
		register_password1.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_register(); }
		});
		register_password2.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_register(); }
		});
		register_token.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_register(); }
		});
		register_btn.addEventListener("mouseover",function() {
			register_btn.style.borderTop = "solid 5px #000";
			register_btn.style.borderBottom = "solid 5px #000";
			register_btn.style.backgroundColor = "#fff";
			register_btn.style.color = "#000";
		});
		register_btn.addEventListener("mouseout",function() {
			register_btn.style.borderTop = "solid 5px #000";
			register_btn.style.borderBottom = "solid 5px #000";
			register_btn.style.backgroundColor = "#000";
			register_btn.style.color = "#fff";
		});
		register_btn.addEventListener("click",function() {
			submit_register();
		});
		
	}
	var csrf_cookie = localStorage.getItem("csrf-cookie");
	if(csrf_cookie == null || csrf_cookie == undefined || csrf_cookie == "undefined") {
		login_screen();
	} else {
		Import({url:"/json.login",method:"get",json:true,data:{csrf_cookie:csrf_cookie}})
			.done(function(data) {
				// if fail to authenticate then load login screen
				if(data.result) {
					document.getElementById("panelLogin").style.display = "none";
					load_terminal();
					logout.style.display = "";
				} else {
					login_screen();
				}
			})
			.fail(function(error) {
			})
			.send();
			
	}
});