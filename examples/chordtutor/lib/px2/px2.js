Array.prototype.remove = function (thing) {
    var i = 0;
    for (var x = null, _js_idx1 = 0; _js_idx1 < this.length; _js_idx1 += 1) {
        x = this[_js_idx1];
        if (x === thing) {
            this.splice(i, 1);
            return true;
        };
        ++i;
    };
    return null;
};
function Event(target, value) {
    this.target = target;
    this.value = value;
    return this;
};
function magic(options, args) {
    this._parents = [];
    this._members = {  };
    this._actions = {  };
    this._storage = [];
    if (options && options.defaults) {
        for (var def in options.defaults) {
            this.create(def, options.defaults[def]);
        };
    };
    for (var k in options) {
        this[k] = options[k];
    };
    this.length = 0;
    this._cursor = 0;
    this.options = options;
    if (this.init) {
        this.init.apply(this, args);
    };
    return this;
};
function Model(options) {
    var fun = function () {
        return magic.call(this, options, arguments);
    };
    fun.prototype = Object.create(Model.prototype);
    fun.prototype.constructor = Model;
    return fun;
};
function Modelp(value) {
    return typeof value === 'object' && Array.isArray(value._storage) && Array.isArray(value._parents);
};
function addParent(child, parent, name) {
    if (Modelp(child)) {
        var alreadyChild = null;
        child._parents.forEach(function (p) {
            return alreadyChild = alreadyChild || parent === p;
        });
        if (!alreadyChild) {
            child._parents.push(parent);
            if (name) {
                return parent.once('change' + ':' + name, function (e) {
                    return child._parents.remove(e.target);
                });
            } else {
                return parent.on('remove', function (e) {
                    return e.target === child ? child._parents.remove(e.target) : null;
                });
            };
        };
    };
};
Model.prototype.copy = function () {
    var cls = Model(this.options);
    var obj = new cls();
    for (var prop in this._members) {
        obj.destroy(prop, true);
        var thisProp = this._members[prop];
        if (Modelp(thisProp)) {
            obj.create(prop, this._members[prop].copy());
        } else {
            obj.create(prop, Array.isArray(thisProp) || typeof thisProp === 'object' ? JSON.parse(JSON.stringify(thisProp)) : thisProp);
        };
    };
    obj._actions = {  };
    for (var action in this._actions) {
        var oldActions = this._actions[action];
        var newActions = [];
        for (var oldAction = null, _js_idx2 = 0; _js_idx2 < oldActions.length; _js_idx2 += 1) {
            oldAction = oldActions[_js_idx2];
            if (oldAction.self === this) {
                newActions.push({ 'message' : oldAction.message,
                                  'fun' : oldAction.fun,
                                  'self' : obj
                                });
            } else {
                newActions.push({ 'message' : oldAction.message,
                                  'fun' : oldAction.fun,
                                  'self' : oldAction.self
                                });
            };
        };
        obj._actions[action] = newActions;
    };
    var newStorage = this.map(function (e) {
        return Modelp(e) ? e.copy() : JSON.parse(JSON.stringify(e));
    });
    obj.clear(true);
    newStorage.forEach(function (e) {
        return obj.push(e, true);
    });
    return obj;
};
Model.prototype.get = function (name, loud) {
    if (!this._members.hasOwnProperty(name)) {
        throw new Error('Attempt to get a property ' + name + ' that does not exist.');
    };
    if (loud) {
        this.trigger('get', this[name]);
        this.trigger('get' + ':' + name, this[name]);
    };
    return this._members[name];
};
function getset(name, value, silent) {
    return arguments.length === 1 ? this.get(name) : this.set(name, value, silent);
};
Model.prototype.create = function (name, value, silent) {
    if (this._members.hasOwnProperty(name)) {
        throw new Error('Attempt to create property ' + name + ' that already exists.');
    };
    this._members[name] = value;
    this[name] = getset.bind(this, name);
    addParent(value, this, name);
    if (!silent) {
        this.trigger('create', value);
        this.trigger('create' + ':' + name, value);
    };
    return value;
};
Model.prototype.set = function (name, value, silent) {
    if (!this._members.hasOwnProperty(name)) {
        throw new Error('Attempt to set a property ' + name + ' that does not exist.');
    };
    var oldValue = this._members[name];
    this._members[name] = value;
    if (!silent) {
        this.trigger('change', oldValue);
        this.trigger('change' + ':' + name, oldValue);
    };
    addParent(value, this, name);
    return value;
};
Model.prototype.destroy = function (name) {
    var value = this._members[name];
    delete this._members[name];
    delete this._actions['change' + ':' + name];
    delete this[name];
    return this.trigger('destroy', value);
};
Model.prototype.trigger = function (message, value, target) {
    var actions = this._actions[message];
    var triggerParents = null;
    if (actions) {
        var event = new Event(target || this, value);
        var toRemove = [];
        for (var action = null, _js_idx2 = 0; _js_idx2 < actions.length; _js_idx2 += 1) {
            action = actions[_js_idx2];
            if (action.fun.call(action.self, event) === true) {
                triggerParents = true;
            };
            if (action.once) {
                toRemove.push(action);
            };
        };
        for (var action = null, _js_idx3 = 0; _js_idx3 < toRemove.length; _js_idx3 += 1) {
            action = toRemove[_js_idx3];
            actions.remove(action);
        };
    } else {
        triggerParents = true;
    };
    if (triggerParents) {
        for (var parent = null, _js_arrvar7 = this._parents, _js_idx6 = 0; _js_idx6 < _js_arrvar7.length; _js_idx6 += 1) {
            parent = _js_arrvar7[_js_idx6];
            if (parent !== target) {
                this.trigger.call(parent, message, value, target || this);
            };
        };
    };
};
Model.prototype.on = function (message, fun, self) {
    var action = { 'message' : message,
                   'fun' : fun,
                   'self' : self || this
                 };
    if (!this._actions[message]) {
        this._actions[message] = [action];
    } else {
        this._actions[message].push(action);
    };
    return action;
};
Model.prototype.once = function (message, fun, self) {
    var action = { 'message' : message,
                   'fun' : fun,
                   'self' : self || this,
                   'once' : true
                 };
    if (!this._actions[message]) {
        this._actions[message] = [action];
    } else {
        this._actions[message].push(action);
    };
    return action;
};
Model.prototype.push = function (obj, silent) {
    if (this.contains && obj.type !== this.contains) {
        throw new Error('Attempt to push ' + obj.type + 'into container for ' + this.contains);
    };
    addParent(obj, this);
    this._storage.push(obj);
    this.length = this._storage.length;
    if (!silent) {
        this.trigger('add', obj);
        this.trigger('modified', [obj]);
    };
    return obj;
};
Model.prototype.add = function (obj, silent) {
    if (this.contains && obj.type !== this.contains) {
        throw new Error('Attempt to push ' + obj.type + 'into container for ' + this.contains);
    };
    if (!this.find(obj)) {
        this.push(obj, silent);
    };
    return obj;
};
Model.prototype.insertAt = function (i, obj, silent) {
    this._storage.splice(i, 0, obj);
    ++this.length;
    addParent(obj, this);
    if (!silent) {
        this.trigger('add', obj);
        this.trigger('modified', [obj]);
    };
    return obj;
};
Model.prototype.swap = function (i, j, silent) {
    var a = this.at(i);
    var b = this.at(j);
    this._storage[i] = b;
    this._storage[j] = a;
    if (!silent) {
        this.trigger('modified', [a, b]);
    };
    return true;
};
Model.prototype.remove = function (obj, silent) {
    var retval = this._storage.remove(obj);
    if (retval) {
        --this.length;
        if (Modelp(obj)) {
            obj._parents.remove(this);
        };
        if (!silent) {
            this.trigger('remove', obj);
            this.trigger('modified', [obj]);
        };
    };
    return retval;
};
Model.prototype.clear = function (silent) {
    var oldStorage = this._storage;
    this._storage = [];
    this.length = 0;
    for (var thing = null, _js_idx8 = 0; _js_idx8 < oldStorage.length; _js_idx8 += 1) {
        thing = oldStorage[_js_idx8];
        if (Modelp(thing)) {
            thing._parents.remove(this);
        };
    };
    if (!silent) {
        this.trigger('clear', this);
        return this.trigger('modified', oldStorage);
    };
};
Model.prototype.at = function (index) {
    if (index >= this.length) {
        throw new Error('attempt to index (' + index + ') out of range of object (' + this.length + ')');
    };
    return this._storage[index];
};
Model.prototype.current = function (objornumber, silent) {
    if (objornumber !== undefined) {
        var prevValue = this.at(this._current);
        if (!silent) {
            this.trigger('change', prevValue);
            this.trigger('change:current', prevValue);
        };
        return typeof objornumber === 'object' ? this.at(this._current = this.indexOf(objornumber)) : this.at(this._current = objornumber);
    } else {
        return this.at(this._current);
    };
};
Model.prototype.start = function (silent) {
    return this.current(0, silent);
};
Model.prototype.end = function (silent) {
    return this.current(this.length - 1, silent);
};
Model.prototype.next = function (loop, silent) {
    if (loop) {
        return this.current((this._current + 1) % this.length, silent);
    } else {
        return this._current < this.length - 1 ? this.current(this._current + 1, silent) : undefined;
    };
};
Model.prototype.prev = function (loop, silent) {
    if (loop) {
        return this._current === 0 ? this.current(this.length - 1, silent) : this.current(this._current - 1, silent);
    } else {
        return this._current > 0 ? this.current(this._current - 1, silent) : undefined;
    };
};
Model.prototype.indexOf = function (obj) {
    var i = -1;
    return this.find(function (it) {
        ++i;
        return it === obj;
    }) && i;
};
Model.prototype.each = function (fun, self) {
    var self9 = self || this;
    for (var item = null, _js_arrvar11 = this._storage, _js_idx10 = 0; _js_idx10 < _js_arrvar11.length; _js_idx10 += 1) {
        item = _js_arrvar11[_js_idx10];
        fun.call(self9, item);
    };
};
Model.prototype.forIn = function (fun, self) {
    var self12 = self || this;
    for (var k in this._members) {
        fun.call(self12, k, this._members[k]);
    };
};
Model.prototype.map = function (fun, self) {
    var result = [];
    var self13 = self || this;
    for (var item = null, _js_arrvar15 = this._storage, _js_idx14 = 0; _js_idx14 < _js_arrvar15.length; _js_idx14 += 1) {
        item = _js_arrvar15[_js_idx14];
        result.push(fun.call(self13, item));
    };
    return result;
};
Model.prototype.filter = function (fun, self) {
    var result = [];
    var self16 = self || this;
    for (var item = null, _js_arrvar18 = this._storage, _js_idx17 = 0; _js_idx17 < _js_arrvar18.length; _js_idx17 += 1) {
        item = _js_arrvar18[_js_idx17];
        if (fun.call(self16, item)) {
            result.push(item);
        };
    };
    return result;
};
Model.prototype.find = function (funOrObj, self) {
    if (typeof funOrObj === 'function') {
        for (var item = null, _js_arrvar22 = this._storage, _js_idx21 = 0; _js_idx21 < _js_arrvar22.length; _js_idx21 += 1) {
            item = _js_arrvar22[_js_idx21];
            if (funOrObj.call(self || this, item)) {
                return item;
            };
        };
    } else {
        for (var item = null, _js_arrvar24 = this._storage, _js_idx23 = 0; _js_idx23 < _js_arrvar24.length; _js_idx23 += 1) {
            item = _js_arrvar24[_js_idx23];
            if (funOrObj === item) {
                return item;
            };
        };
    };
};
Model.prototype.sort = function (fun, silent) {
    this._storage.sort(fun);
    if (!silent) {
        this.trigger('modified', this._storage);
    };
    return this;
};
function View(options) {
    var fun = function (model) {
        this.model = model;
        this.$el = $('<div>');
        if (options) {
            if (options.tagName) {
                this.$el = $('<' + options.tagName + '>');
            };
            if (options.style) {
                this.$el.css(options.style);
            };
            if (options.model) {
                this[options.model] = model;
            };
            this.$el.attr('class', options.className || options.type);
            if (!options.render) {
                if (options.renderAugmented) {
                    this.render = options.renderAugmented;
                } else {
                    this.render = function () {
                        return this.$el;
                    };
                };
            };
            if (options.render) {
                if (!options.renderAugmented) {
                    this.render = function () {
                        this.$el.children().detach();
                        return options.originalRender.call(this);
                    };
                    options.renderAugmented = this.render;
                    options.originalRender = options.render;
                    delete options.render;
                };
            };
            if (!options.init) {
                if (options.initAugmented) {
                    this.init = options.initAugmented;
                } else {
                    this.init = function () {
                        return this.render();
                    };
                };
            };
            if (options.init) {
                if (!options.initAugmented) {
                    this.init = function () {
                        options.originalInit.apply(this, arguments);
                        return this.render();
                    };
                    options.initAugmented = this.init;
                    options.originalInit = options.init;
                    delete options.init;
                };
            };
            if (options.events) {
                for (var event in options.events) {
                    this.$el.on(event, options.events[event].bind(this));
                };
            };
            magic.call(this, options, arguments);
            return this;
        };
    };
    fun.prototype = Object.create(Model.prototype);
    fun.prototype.constructor = View;
    return fun;
};
if (typeof module !== 'undefined') {
    module.exports.Model = Model;
};
if (typeof module !== 'undefined') {
    module.exports.View = View;
};
