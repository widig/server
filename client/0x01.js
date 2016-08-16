


/*
	0x01.js
	KeyCode
*/
KeyCode = {
	// us keyboard (no layout)
	
	BACKSPACE : 8,
	TAB : 9,
	ENTER : 13,
	SPACE : 32,
	SHIFT : 16,
	CTRL : 17,
	CONTROL : 17,
	ALT : 18,
	CAPSLOCK : 20,
	ESCAPE : 27,
	SCROLLLOCK : 145,
	PAUSE : 19,
	
	
	UP : 38,
	DOWN : 40,
	LEFT : 37,
	RIGHT : 39,
	
	
	INSERT : 45,
	DELETE : 46,
	HOME: 36,
	END : 35,
	PAGEUP : 33,
	PAGEDOWN : 34,
	
	
	D0 : 48,
	D1 : 49,
	D2 : 50,
	D3 : 51,
	D4 : 52,
	D5 : 53,
	D6 : 54,
	D7 : 55,
	D8 : 56,
	D9 : 57,
	
	A : 65,
	B : 66,
	C : 67,
	D : 68,
	E : 69,
	F : 70,
	G : 71,
	H : 72,
	I : 73,
	J : 74,
	K : 75,
	L : 76,
	M : 77,
	N : 78,
	O : 79,
	P : 80,
	Q : 81,
	R : 82,
	S : 83,
	T : 84,
	U : 85,
	V : 86,
	W : 87,
	X : 88,
	Y : 89,
	Z : 90,
	
	
	
	
	BACKTICK : 192,
	SLASH : 191,
	BACKSLASH : 220,
	BRACKET_LEFT : 219,
	BRACKET_RIGHT : 221,
	SEMICOLON : 186,
	QUOTE : 222,
	COMMA : 188,
	PERIOD : 190,
	EQUAL : 187,
	DASH : 189,
	
	NUMPAD : 144,
	NUMPAD_0 : 96,
	NUMPAD_1 : 97,
	NUMPAD_2 : 98,
	NUMPAD_3 : 99,
	NUMPAD_4 : 100,
	NUMPAD_5 : 101,
	NUMPAD_6 : 102,
	NUMPAD_7 : 103,
	NUMPAD_8 : 104,
	NUMPAD_9 : 105,
	NUMPAD_DOT : 110,
	NUMPAD_MUL : 106,
	NUMPAD_ADD : 107,
	NUMPAD_SUB : 109,
	NUMPAD_MUL : 111,
	
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12:123
	
	
	// abnt2 keyboard (pt-br layout)
	
	
};

function StringTools() {}
StringTools.prototype.toHex = function(val) {
	var alpha = [
		"0","1","2","3",
		"4","5","6","7",
		"8","9","A","B",
		"C","D","E","F"
	];
	var sb = [];
	for(var x = 0; x < val.length;x++) {
		var c = (val.charCodeAt(x) >>>0)
		sb.push( alpha[ (c & 0xF0)>>4 ] + alpha[ ( c & 0xF ) ] );
	}
	return sb.join("");
}
StringTools.prototype.fromHex = function(val) {
	var alpha = {
		"0":0,"1":1,"2":2,"3":3,
		"4":4,"5":5,"6":6,"7":7,
		"8":8,"9":9,"A":10,"B":11,
		"C":12,"D":13,"E":14,"F":15
	};
	var sb = [];
	for(var x = 0; x < val.length;x+=2) {
		sb.push( String.fromCharCode( (alpha[ val.charAt(x) ] << 4 ) | alpha[ val.charAt(x+1) ] ) );
	}
	return sb.join("");
}
StringTools = new StringTools();
