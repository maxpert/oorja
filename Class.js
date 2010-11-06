/*
The MIT License

Copyright (c) 2010 Zohaib Sibt-e-Hassan(MaXPert)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
* Class function can be used two ways
*  1. Class(parent, object)
*  2. Class(object);
* Here object must have 
* Init (constructor function), 
* Public (public functions/properties), 
* and Private (private functions/properties accessible via public memebers of current class only).
*
* It should be noticed that only publics are inherited and they are bound to parent's scope (like in C++).
* So a eat method inherited in 'Mammal' class from 'Animal' class if not overridden will be bound to parent's scope 
* (i.e. this.whatEver property will result in accessing whatEver declared under Animal class)
*
*/

var Class = function(){
    var slice = Array.prototype.slice,
        args = slice.call(arguments),
        parent = null,
        defina = null,
        init = null,
        privates = null,
        publics = null;
        
    
    var merge = Class.mix;
    
    var glue = Class.glue;
	
	var bound = function(b, ob){
        var reta = {}; 
		merge(reta, b);
		for(var m in b) {
			if(b.hasOwnProperty(m) && typeof b[m] == 'function') {
				reta[m] = glue(b[m], ob);
			}
		}
		return reta;
    };
    
	
    if(args.length > 1){
        parent = args.shift();
		
    }
    
    defina = args.shift();
    publics = defina.Public || {};
    privates = defina.Private || {};
    init = defina.Init;
    
	
	//Assert checks
    if(typeof init != 'function'){
        throw 'Init constructor must be a function';
    }
	
	for(var m in publics){
		if(privates[m] !== undefined ){
			throw "Duplicate entry "+m+" in public and private member list";
		}
	}
    
    var klass = function(){
		var i;
		if(parent && parent.prototype){
			//Construct parent
			klass.prototype.$uper = {};
			merge(klass.prototype.$uper, parent.prototype);
			parent.apply(klass.prototype.$uper, arguments);
			
			//Inhert parent
			merge(this, klass.prototype.$uper);
			merge(this, bound(parent.prototype, klass.prototype.$uper));
			this.$uper = klass.prototype.$uper;
		}
		
		//Create a VTable including publics and privates
		var vis = {}, me = this;
	
		//Accept changes to this object
		var updateObj = function(){
			for(var p in vis){
				if(privates.hasOwnProperty(p) && vis.hasOwnProperty(p) && privates[p] !== vis[p]){
					privates[p] = vis[p];
				}else if(publics.hasOwnProperty(p) && me[p] !== vis[p]){
					me[p] = vis[p];
				}
			}
		};
		
		//Create VTable call for function
		var vtablize = function(func){
			return function(){
				//Call vtabled
				func.apply(vis, arguments);
				//Accept canges in VTable
				updateObj();
			};
		};
		
		//Overide inherted vtabled
		for(i in publics){
			if(publics.hasOwnProperty(i) && typeof publics[i] == 'function'){
				me[i] = vtablize(publics[i]);
			}else if(publics.hasOwnProperty(i)){
				me[i] = publics[i];
			}
		}
		
		//Make publics and privates part of vis
		merge(vis, privates);
		merge(vis, me);
		
		init.apply(vis, arguments);
		updateObj();
		
	};
    
    return klass;
};

/**
* Same as $.extend of jQuery but stripped version with array concatination support
*/
Class.mix = function(a, b){
	var i;
	if(b.length !== undefined && a.length !== undefined){
		a.concat(b);
	}else if(typeof a == 'object' && typeof b == 'object'){
		for(i in b){
			if(b.hasOwnProperty(i)){
				a[i]=b[i];
			}
		}
	}
};

/**
* Glue the scope of given function to given object with given arguments
* same as Function.prototype.bind in famous frameworks but not poluting namespace ;)
*/

Class.glue = function(){
	var oa = slice.call(arguments),
		func = oa.shift(),
		obj = oa.shift();
	return function(){
		var ia = slice.call(arguments),
			ar = [];
		Class.mix(ar, oa);
		Class.mix(ar, ia);
		func.apply(obj, ar);
	};
};