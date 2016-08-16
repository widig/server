

/*
	0x08.js
	WithEvents
	WithArray
	WithAlias
	
*/


Class.define("WithEvents",{
	ctor : function() {
		// default struct constructor
		var self = this;
		this.internal.WithEvents.data = {};
		this.internal.WithEvents.dials = {};
		this.internal.WithEvents.dialCounter = 0;
		this.internal.WithEvents.preCheck = function(event,callback,capture) {
			// self filter
			var mode = capture ? "capture" : "bubble";
			//console.log("precheck",event);
			if("on" in self.internal.WithEvents.data) {
				for(var x = 0; x < self.internal.WithEvents.data.on[mode].length;x++) {
					if(!self.internal.WithEvents.data.on[mode][x]( event, callback )) {
						console.log("event blocked");
						return false;
					}
				}
			}
			if(event in self.internal.WithEvents.data) {
				//console.log("search");
				// only one event per callback, otherwise use another queue
				for(var x = 0; x < self.internal.WithEvents.data[event][mode].length;x++) {
					if( self.internal.WithEvents.data[event][mode][x] == callback ) {
						console.log("found same event pointer");
						return false;
					}
				}
				//console.log("not found");
			} else {
				// init this event
				self.internal.WithEvents.data[event] = {
					capture : [],
					bubble : []
				};
				//console.log("init");
			}
			
			return true;
		}
		this.addEventListener = function(a,b,c) {
			return this.on(a,b,c);
		}
		this.removeEventListener = function(a,b,c) {
			return this.off(a,b,c);
		}
	}
	, proto : {
		on : function(event, callback,capture) {
			
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			//console.log("INTERNAL",i);
			if(!i.preCheck.apply(this,[event,callback,capture])) return false;
			i.data[event][mode].push(callback);
			return true;
		},
		pattern : function(pattern, callback, capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			
			// parse language
			throw "not implemented.";
		},
		onQueue : function(event,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback,capture])) return false;
			i.data[event][mode].unshift(callback);
			return true;
		},
		onPush : function(event,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback,capture])) return false;
			if(capture) {
				i.data[event][mode].push(callback);
			} else {
				i.data[event][mode].unshift(callback);
			}
			return true;
		},
		onAfter : function(event,callback_reference,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback,capture])) return false;
			// find it
			var check = false;
			if(capture) {
				for(var x = 0; x < i.data[event][mode].length;x++) {
					if(i.data[event][mode][x] == callback_reference) {
						// insert after
						check = true;
						i.data[event][mode].splice(x+1,0,callback);
						break;
					}
				}
			} else {
				for(var x = i.data[event][mode].length;x>=0;x--) {
					if(i.data[event][mode][x] == callback_reference) {
						check = true;
						i.data[event][mode].splice(x,0,callback);
						break;
					}
				}
			}
			return check;
		},
		onBefore : function(event,callback_reference,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if(!i.preCheck.apply(this,[event,callback])) return false;
			
			// find it
			var check = false;
			if(capture) {
				for(var x = 0; x < i.data[event][mode].length;x++) {
					if(i.data[event][mode][x] == callback_reference) {
						// insert after
						check = true;
						i.data[event].splice(x,0,callback);
						break;
					}
				}
			} else {
				for(var x = i.data[event][mode].length-1;x>=0;x--) {
					if(i.data[event][mode][x] == callback_reference) {
						// insert after
						check = true;
						i.data[event].splice(x+1,0,callback);
						break;
					}
				}
			}
			return check;
		},
		off : function(event,callback,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if("off" in i.data) {
				for(var x = 0; x < i.data.off[mode].length;x++) {
					if(!i.data.off[mode][x]( event, callback )) {
						return false;
					}
				}
			}
			if(!(event in i.data)) {
				return true;
			}
			for(var x = 0; x < i.data[event][mode].length;x++) {
				if( i.data[event][mode][x] == callback ) {
					i.data[event][mode].splice(x,1);
					return true;
				}
			}
			return false;
		},
		clearEvents : function(event,capture) {
			capture = capture || true;
			var mode = !!capture ? "capture" : "bubble";
			var i = this.internal["WithEvents"];
			if("off" in i.data) {
				for(var x = 0; x < i.data.off[mode].length;x++) {
					if(!i.data.off[mode][x]( event, callback )) {
						return false;
					}
				}
			}
			if(!(event in i.data)) {
				return true;
			}
			i.data[event][mode].splice(0,i.data[event][mode].length);
			return true;
		},
		emit : function(event, args) {
			//console.log("emit0",this);
			//console.log("emit",event,args);
			
			var i = this.internal["WithEvents"];
			//console.log(i.data);
			if(event in i.data) {
				for(var x = 0; x < i.data[event].capture.length;x++) {
					if(Object.prototype.toString.apply(i.data[event].capture[x]) != "[object Function]") {
						console.log(i.data[event].capture[x]);
					}
					if(!i.data[event].capture[x].apply(this,args)) {
						return false;
					}
				}
			}
			// emit bottomHit
			if(("bottomHit"+event) in i.data) {
				for(var x = 0; x < i.data["bottomHit"+event].capture.length;x++) {
					if(!i.data["bottomHit"+event].capture[x].apply(this,args)) {
						return false;
					}
				}
				for(var x = i.data["bottomHit"+event].bubble.length-1;x>=0;x--) {
					if(!i.data["bottomHit"+event].bubble[x].apply(this,args)) {
						return false;
					}
				}
			}
			if(event in i.data) {
				for(var x = i.data[event].bubble.length-1;x>=0;x--) {
					if(!i.data[event].bubble[x].apply(this,args)) {
						return false;
					}
				}
			}
			return true;
		},
		tryCall : function(confirm, event, args, expire) {
			//console.log("first DIAL");
			var i = this.internal.WithEvents;
			var check = false;
			if(event in i.data) {
				var result = "";
				for(var x = 0; x < i.data[event].capture.length;x++) {
					result = i.data[event].capture[x].apply(this,args);
					if( confirm( result, expire ) ) {
						check = true;
						break;
					}
				}
				for(var x = i.data[event].bubble.length;x>=0;x--) {
					result = i.data[event].bubble[x].apply(this,args);
					if(confirm(result,expire) ) {
						check = true;
						break;
					}
				}
				return {
					result : true,
					value : result
				}
			}
			if(!check) {
				var self = this.internal.WithEvents;
				self.dialCounter += 1;
				self.dials[ self.dialCounter ] = {
					id : self.dialCounter,
					confirm : confirm, 
					event : event, 
					args : args,
					expire : expire,
					tries : 1
				}
				return {
					result : false,
					value : self.dialCounter
				}
			}
		},
		cancelCall : function(id) { // byId
			var self = this.internal.WithEvents;
			if(id in self.dials) {
				self.dials[id] = null;
				delete self.dials[id];
			}
		},
		// cancel call by event
		// cancel call by number of tries
		cancelAllCalls : function() {
			var self = this.internal.WithEvents;
			var rm = [];
			for(var key in self.dials)
				rm.push(key);
			for(var x = 0; x < rm.length;x++) {
				self.dials[ rm[x] ] = null;
				delete self.dials[ rm[x] ];
			}
		},
		
		checkDialingState : function(id) {
			var self = this.internal.WithEvents;
			if(id in self.dials) return self.dials[id];
			return null;
		},
		
		reDial : function() {
			
			var self = this.internal.WithEvents;
			var rm = [];
			var c = 0;
			var check = false;
			var dial = null;
			var x = 0;
			var result = 0;
			var key = "";
			for(key in self.dials) {
				dial = self.dials[key];
				check = false;
				if(dial.event in self.data) {
					//console.log("REDIAL",self.data[dial.event].length,self.dialCounter2);
					for(var x = 0; x < i.data[event].capture.length;x++) {
						result = i.data[event].capture[x].apply(this,args);
						if( confirm( result, expire ) ) {
							check = true;
							break;
						}
					}
					for(var x = i.data[event].bubble.length;x>=0;x--) {
						result = i.data[event].bubble[x].apply(this,args);
						if(confirm(result,expire) ) {
							check = true;
							break;
						}
					}
					if(!check) {
						dial.tries += 1;
						if(dial.tries > 1) {
							//console.log("cancel redial");
							rm.push(key);
						}
					} else {
						rm.push(key);
						break;
					}
				} else {
					rm.push(key);
				}
				c += 1;
			}
			for(x = 0; x < rm.length;x++) {
				self.dials[ rm[x] ] = null;
				delete self.dials[ rm[x] ];
				c -= 1;
			}
			if(c==0) {
				self.dialCounter = 0;
			}
		}
	}
});

Class.define("WithArray",{ 
	ctor : function() {
		this.internal.WithArray.data = [];
	}
	, from :["WithEvents"]
	, proto: {
		itemPush : function(item) {
			var last = this.internal.WithArray.data.length;
			if(!this.emit("itemInputFilter",[last,null,item])) return false;
			this.internal.WithArray.data.push(item);
			this.emit("itemInsert",[last]);
			return true;
		}
		, itemPop : function() {
			if(this.internal.WithArray.data.length>0) {
				var last = this.internal.WithArray.data.length-1;
				if(!this.emit("itemOutputFilter",[last,this.internal.WithArray.data[last]])) return null;
				var ret = this.internal.WithArray.data.pop();
				this.emit("itemRemove",[last]);
				return ret;
			}
			return null;
		}
		, itemUnshift : function(item) {
			if(!this.emit("itemInputFilter",[0,null,item])) return false;
			this.internal.WithArray.data.unshift(item);
			this.emit("itemInsert",[0]);
			return true;
		}
		, itemShift : function() {
			if(this.internal.WithArray.data.length>0) {
				if(!this.emit("itemOutputFilter",[0,this.internal.WithArray.data[0]])) return null;
				var ret = this.internal.WithArray.data.shift();
				this.emit("itemRemove",[0]);
				return ret;
			}
			return null;
		}
		, itemPeekTop : function() {
			if(this.internal.WithArray.data.length>0) return this.internal.WithArray.data[this.internal.WithArray.data.length-1];
			return null;
		}
		, itemPeekFirst : function() {
			if(this.internal.WithArray.data.length>0) return this.internal.WithArray.data[0];
			return null;
		}
		, itemRemove : function(item) {
			for(var x = 0; x < this.internal.WithArray.data.length;x++) {
				if(this.internal.WithArray.data[x]==item) {
					if(!this.emit("itemOutputFilter",[x,this.internal.WithArray.data[x]])) return null;
					var ret = this.internal.WithArray.data.splice(x,1);
					this.emit("itemRemove",[x]);
					return ret;
				}
			}
			return null;
		}
		, itemRemoveComplex : function(callback) {
			for(var x = 0; x < this.internal.WithArray.data.length;x++) {
				if(callback(x,this.internal.WithArray.data[x])) {
					if(!this.emit("itemOutputFilter",[x,this.internal.WithArray.data[x]])) return null;
					var ret = this.internal.WithArray.data.splice(x,1);
					this.emit("itemRemove",[x]);
					return ret;
				}
			}
			return null;
		}
		, itemRemoveAll : function(item) {
			var check1 = false;
			var check2 = false;
			var mark = [];
			while(true) {
				for(var x = 0; x < this.internal.WithArray.data.length;x++) {
					if(this.internal.WithArray.data[x]==item) {
						if(!this.emit("itemOutputFilter",[x,this.internal.WithArray.data[x]])) return null;
						mark.push(x);
						check1 = true;
						check2 = true;
						break;
					}
				}
				if(!check1) break;
				check1 = false;
			}
			if(check2) {
				var ret = [];
				for(var x = mark.length-1; x >= 0;x--) {
					ret = ret.concat(this.internal.WithArray.data.splice(mark[x],1));
					this.emit("itemRemove",[mark[x]]);
				}
				return ret;
			}
			return false;
		}
		, itemRemoveAllComplex : function(callback) {
			
			var check1 = false;
			var check2 = false;
			
			var mark = [];
			while(true) {
				for(var x = 0; x < this.internal.WithArray.data.length;x++) {
					if(callback(x,this.internal.WithArray.data[x])) {
						if(!this.emit("itemOutputFilter",[x,this.internal.WithArray.data[x]])) return null;
						mark.push(x);
						check1 = true;
						check2 = true;
						break;
					}
				}
				if(!check1) break;
				check1 = false;
			}
			if(check2) {
				var ret = [];
				for(var x = mark.length-1;x>=0;x--) {
					ret.concat(this.internal.WithArray.data.splice(mark[x],1));
					this.emit("itemRemove",[mark[x]]);
				}
				return ret;
			}
			return false;
			
		}
		, itemFindFirstIndex : function(start,item) {
			for(var x = start; x < this.internal.WithArray.data.length;x++) {
				if(this.internal.WithArray.data[x]==item)
					return x;
			}
			return -1;
		}
		// callback(index,value)
		, itemFindFirstIndexComplex : function(start,callback) {
			for(var x = start; x < this.internal.WithArray.data.length;x++) {
				if(callback(x,this.internal.WithArray.data[x])) {
					return x;
				}
			}
			return -1;
		}
		// for replaceAllComplex, use itemMap
		, itemReplaceAll : function(item,replacement) { // commit style
			var check1 = false;
			var check2 = false;
			var mark = [];
			while(true) {
				for(var x = 0; x < this.internal.WithArray.data.length;x++) {
					if(this.internal.WithArray.data[x]==item) {
						if(!this.emit("itemInputFilter",[x,this.internal.WithArray.data[x],replacement])) return false;
						mark.push(x);
						check1 = true;
						check2 = true;
						break;
					}
				}
				if(!check1) break;
				check1 = false;
			}
			if(check2) {
				for(var x = 0; x < mark.length;x++) {
					var oldvalue = this.internal.WithArray.data[mark[x]];
					var newvalue = this.internal.WithArray.data[mark[x]] = replacement;
					this.emit("itemChange",[mark[x],oldvalue,newvalue]);
				}
				return true;
			}
			return false;
		}
		, itemReplaceAllComplex : function(callback) { // commit style
			var check1 = false;
			var check2 = false;
			var mark = [];
			while(true) {
				for(var x = 0; x < this.internal.WithArray.data.length;x++) {
					var oldvalue = this.internal.WithArray.data[x];
					throw "do not return new value?";
					var r = callback(this.internal.WithArray.data[x]);
					if(r==null) {
						if(!this.emit("itemInputFilter",[x,oldvalue,r])) return false;
						mark.push([x,r]); // here using null
						check1 = true;
						check2 = true;
						break;
					}
				}
				if(!check1) break;
				check1 = false;
			}
			if(check2) {
				for(var x = mark.length-1;x>=0;x--) {
					var oldvalue = this.internal.WithArray.data[ mark[x][0] ];
					var newvalue = this.internal.WithArray.data[ mark[x][0] ] = mark[x][1];
					this.emit("itemChange",[mark[x],oldvalue,newvalue]);
				}
				return true;
			}
			return false;
		}
		, itemReplaceAt : function(index,value) {
			if(index >=0 && index < this.internal.WithArray.data.length) {
				if(!this.emit("itemInputFilter",[index,this.internal.WithArray.data[index],value])) return false;
				var oldvalue = this.internal.WithArray.data[index]
				this.internal.WithArray.data[index] = value;
				this.emit("itemChange",[index,oldvalue,value]);
			} else {
				throw "WithArray.itemAt index out of bounds.";
			}
		}
		, itemGetAt : function(index) {
			if(index >=0 && index < this.internal.WithArray.data.length) {
				return this.internal.WithArray.data[index];
			} else {
				throw "WithArray.itemAt index out of bounds.";
			}
		}
		, itemRemoveAt : function(index) {
			if(index >=0 && index < this.internal.WithArray.data.length) {
				if(!this.emit("itemOutputFilter",[index,this.internal.WithArray.data[index]])) return null;
				var r = this.internal.WithArray.data.splice(index);
				this.emit("itemRemove",[index]);
				return r;
			} else {
				throw "WithArray.itemRemoveAt index out of bounds.";
			}
		}
		, itemFindValue : function(callback) {
			for(var x = 0; x < this.internal.WithArray.data.length;x++) {
				if( callback(x,this.internal.WithArray.data[x]) ) {
					return this.internal.WithArray.data[x];
				}
			}
			return null;
		}
		, itemMap : function(callback) { // commit style
			var mark = [];
			for(var x = 0; x < this.internal.WithArray.data.length;x++) {
				var nvalue = callback(x,this.internal.WithArray.data[x]);
				if(!this.emit("itemInputFilter",[x,this.internal.WithArray.data[x],nvalue])) return false;
				mark.push([x,nvalue]);
			}
			for(var x = 0; x < mark.length;x++) {
				var oldvalue = this.internal.WithArray.data[ mark[x][0] ];
				var newvalue = this.internal.WithArray.data[ mark[x][0] ] = mark[x][1];
				this.emit("itemChange",[mark[x][0],oldvalue,newvalue]);
			}
			return false;
		}
		, itemClear : function() { // remove all no check except for output_filter, commit style
			
			for(var y = 0; y < this.internal.WithArray.data.length;y++) {
				//console.log("remove",this.internal.WithArray.data[y]);
				if(!this.emit("itemOutputFilter",[y,this.internal.WithArray.data[y]])) return false;
			}
			var ret = [];
			while(this.internal.WithArray.data.length>0) {
				ret.push( this.internal.WithArray.data.shift() );
				var i = this.internal.WithArray.data.length;
				this.emit("itemRemove",[i]);
			}
			return ret;
		}
		, itemAmount : function() {
			return this.internal.WithArray.data.length;
		}
		, itemSplice : function() {
			return this.internal.WithArray.data.splice.apply( this.internal.WithArray.data, Array.prototype.slice(arguments,0) );
		}
	}
});

Class.define("WithAlias",{
	from : ["WithEvents"]
	, ctor :function() { // map reduce requires event tracking, so this is alpha
		this.internal.WithAlias.data = {};
	}
	, proto : {
		varEach : function(map) {
			for(var key in this.internal.WithAlias.data) {
				this.internal.WithAlias.data[key] = map(key,this.internal.WithAlias.data[key]);
			}
		},
		varKeys : function(map) {
			for(var key in this.internal.WithAlias.data) {
				map(key);
			}
		},
		varValues : function(map) {
			for(var key in this.internal.WithAlias.data) {
				map(this.internal.WithAlias.data[key]);
			}
		},
		varSet : function(key,value) {
			this.internal.WithAlias.data[key] = value;
		},
		varExists : function(key) {
			if( key in this.internal.WithAlias.data ) return true;
			return false;
		},
		varGet : function(key) {
			if( key in this.internal.WithAlias.data ) {
				return this.internal.WithAlias.data[key];
			} else {
				return null;
			}
		},
		varRename : function(oldkey,newkey) {
			if( oldkey in this.internal.WithAlias.data ) {
				if( newkey in this.internal.WithAlias.data ) {
					return false;
				} else {
					this.internal.WithAlias.data[newkey] = this.internal.WithAlias.data[oldkey];
					this.varUnset(oldkey);
					this.emit("varRename",[oldkey,newkey]);
					return true;
				}
			} else {
				return false;
			}
		},
		varUnset : function(key) {
			if( key in this.internal.WithAlias.data) {
				this.internal.WithAlias.data[key] = null;
				delete this.internal.WithAlias.data[key];
			}
		},
		varClear : function() {
			var keys = [];
			for(var key in this.internal.WithAlias.data)
				keys.push(key);
			while(keys.length>0) {
				var key = keys.pop();
				this.internal.WithAlias.data[key] = null;
				delete this.internal.WithAlias.data[key];
			}
			
		}
	}
});