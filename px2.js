/* (LOAD macros.ps) */
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
/* (DEFCLASS *EVENT NIL (TARGET VALUE)
             (SETF (@ THIS TARGET) TARGET
                   (@ THIS VALUE) VALUE)) */
function Event(target, value) {
    this.target = target;
    this.value = value;
    return this;
};
/* (DEFCLASS *CLASS NIL (OPTIONS)
             (SETF (@ THIS _PARENTS) (ARRAY)
                   (@ THIS _PROPS) (CREATE)
                   (@ THIS _ACTIONS) (CREATE)
                   (@ THIS _STORAGE) (ARRAY))
             (IF (AND OPTIONS (@ OPTIONS DEFAULTS))
                 (FOR-IN (DEF (@ OPTIONS DEFAULTS))
                         ((@ THIS CREATE) DEF
                          (GETPROP OPTIONS 'DEFAULTS DEF))))
             (FOR-IN (K OPTIONS) (SETF (GETPROP THIS K) (GETPROP OPTIONS K)))
             (IF (@ THIS INIT)
                 (LET ((ARGS ((@ *ARRAY PROTOTYPE SLICE CALL) ARGUMENTS 1)))
                   ((@ THIS INIT APPLY) THIS ARGS)))) */
function Class(options) {
    this._parents = [];
    this._props = {  };
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
    if (this.init) {
        var args = Array.prototype.slice.call(arguments, 1);
        this.init.apply(this, args);
    };
    return this;
};
/* (DEFUN *CLASSP (VALUE)
     (AND (= (TYPEOF VALUE) OBJECT) ((@ *ARRAY IS-ARRAY) (@ VALUE _PARENTS)))) */
function Classp(value) {
    return typeof value === 'object' && Array.isArray(value._parents);
};
/* (DEFUN ADD-PARENT (CHILD PARENT NAME)
     (WHEN (*CLASSP CHILD)
       ((@ CHILD _PARENTS PUSH) PARENT)
       ((@ PARENT ONCE) (+ CHANGE : NAME)
        (LAMBDA (E) ((@ CHILD _PARENTS REMOVE) (@ E TARGET)))))) */
function addParent(child, parent, name) {
    if (Classp(child)) {
        child._parents.push(parent);
        return parent.once('change' + ':' + name, function (e) {
            return child._parents.remove(e.target);
        });
    };
};
/* (DEFMETHOD *CLASS GET (NAME) (GETPROP THIS '_PROPS NAME)) */
Class.prototype.get = function (name) {
    return this._props[name];
};
/* (DEFUN GETSET (NAME)
     (IF (= (@ ARGUMENTS LENGTH) 1)
         ((@ THIS GET) NAME)
         ((@ THIS SET) NAME (AREF ARGUMENTS 1)))) */
function getset(name) {
    return arguments.length === 1 ? this.get(name) : this.set(name, arguments[1]);
};
/* (DEFMETHOD *CLASS CREATE (NAME VALUE)
     (IF ((@ THIS _PROPS HAS-OWN-PROPERTY) NAME)
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to create property  NAME  that already exists.)))))
     (SETF (GETPROP THIS '_PROPS NAME) VALUE
           (GETPROP THIS NAME) ((@ GETSET BIND) THIS NAME))
     (ADD-PARENT VALUE THIS NAME)
     (TRIGGER THIS CREATE VALUE (+ CREATE : NAME) VALUE)
     VALUE) */
Class.prototype.create = function (name, value) {
    if (this._props.hasOwnProperty(name)) {
        throw new Error('Attempt to create property ' + name + ' that already exists.');
    };
    this._props[name] = value;
    this[name] = getset.bind(this, name);
    addParent(value, this, name);
    this.trigger('create', value);
    this.trigger('create' + ':' + name, value);
    return value;
};
/* (DEFMETHOD *CLASS SET (NAME VALUE)
     (IF (NOT ((@ THIS _PROPS HAS-OWN-PROPERTY) NAME))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to set a property  NAME  that does not exist.)))))
     (TRIGGER THIS CHANGE VALUE (+ CHANGE : NAME) VALUE)
     (ADD-PARENT VALUE THIS NAME)
     (SETF (GETPROP THIS '_PROPS NAME) VALUE)) */
Class.prototype.set = function (name, value) {
    if (!this._props.hasOwnProperty(name)) {
        throw new Error('Attempt to set a property ' + name + ' that does not exist.');
    };
    this.trigger('change', value);
    this.trigger('change' + ':' + name, value);
    addParent(value, this, name);
    return this._props[name] = value;
};
/* (DEFMETHOD *CLASS DESTROY (NAME)
     (DELETE (GETPROP THIS '_PROPS NAME))
     (TRIGGER THIS DESTROY (GETPROP THIS '_PROPS NAME))) */
Class.prototype.destroy = function (name) {
    delete this._props[name];
    return this.trigger('destroy', this._props[name]);
};
/* (DEFMETHOD *CLASS TRIGGER (MESSAGE VALUE TARGET)
     (LET ((ACTIONS (GETPROP THIS '_ACTIONS MESSAGE)))
       (IF ACTIONS
           (LET ((EVENT (NEW (*EVENT (OR TARGET THIS) VALUE)))
                 (TO-REMOVE (ARRAY)))
             (DOLIST (ACTION ACTIONS)
               ((@ ACTION FUN CALL) (@ ACTION SELF) EVENT)
               (IF (@ ACTION ONCE)
                   ((@ TO-REMOVE PUSH) ACTION))
               (DOLIST (ACTION TO-REMOVE) ((@ TO-REMOVE REMOVE) ACTION)))))
       (DOLIST (PARENT (@ THIS _PARENTS))
         (UNLESS (= PARENT TARGET)
           ((@ THIS TRIGGER CALL) PARENT MESSAGE VALUE (OR TARGET THIS)))))) */
Class.prototype.trigger = function (message, value, target) {
    var actions = this._actions[message];
    if (actions) {
        var event = new Event(target || this, value);
        var toRemove = [];
        for (var action = null, _js_idx2 = 0; _js_idx2 < actions.length; _js_idx2 += 1) {
            action = actions[_js_idx2];
            action.fun.call(action.self, event);
            if (action.once) {
                toRemove.push(action);
            };
            for (var action = null, _js_idx3 = 0; _js_idx3 < toRemove.length; _js_idx3 += 1) {
                action = toRemove[_js_idx3];
                toRemove.remove(action);
            };
        };
    };
    for (var parent = null, _js_arrvar4 = this._parents, _js_idx3 = 0; _js_idx3 < _js_arrvar4.length; _js_idx3 += 1) {
        parent = _js_arrvar4[_js_idx3];
        if (parent !== target) {
            this.trigger.call(parent, message, value, target || this);
        };
    };
};
/* (DEFMETHOD *CLASS ON (MESSAGE FUN SELF)
     (LET ((ACTION (CREATE MESSAGE MESSAGE FUN FUN SELF (OR SELF THIS))))
       (IF (NOT (GETPROP THIS '_ACTIONS MESSAGE))
           (SETF (GETPROP THIS '_ACTIONS MESSAGE) (ARRAY ACTION))
           ((GETPROP THIS '_ACTIONS MESSAGE 'PUSH) ACTION))
       ACTION)) */
Class.prototype.on = function (message, fun, self) {
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
/* (DEFMETHOD *CLASS ONCE (MESSAGE FUN SELF)
     (LET ((ACTION (CREATE MESSAGE MESSAGE FUN FUN SELF (OR SELF THIS) ONCE T)))
       (IF (NOT (GETPROP THIS '_ACTIONS MESSAGE))
           (SETF (GETPROP THIS '_ACTIONS MESSAGE) (ARRAY ACTION))
           ((GETPROP THIS '_ACTIONS MESSAGE 'PUSH) ACTION))
       ACTION)) */
Class.prototype.once = function (message, fun, self) {
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
/* (DEFMETHOD *CLASS PUSH (OBJ)
     (IF (AND (@ THIS CONTAINS) (NOT (= (@ OBJ TYPE) (@ THIS CONTAINS))))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to push  (@ OBJ TYPE) into container for
                  (@ THIS CONTAINS))))))
     (WHEN (*CLASSP OBJ) ((@ OBJ _PARENTS PUSH) THIS))
     ((@ THIS _STORAGE PUSH) OBJ)
     (SETF (@ THIS LENGTH) (@ THIS _STORAGE LENGTH))
     (TRIGGER THIS ADD OBJ CHANGE OBJ)
     OBJ) */
Class.prototype.push = function (obj) {
    if (this.contains && obj.type !== this.contains) {
        throw new Error('Attempt to push ' + obj.type + 'into container for ' + this.contains);
    };
    if (Classp(obj)) {
        obj._parents.push(this);
    };
    this._storage.push(obj);
    this.length = this._storage.length;
    this.trigger('add', obj);
    this.trigger('change', obj);
    return obj;
};
/* (DEFMETHOD *CLASS ADD (OBJ)
     (IF (AND (@ THIS CONTAINS) (NOT (= (@ OBJ TYPE) (@ THIS CONTAINS))))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to push  (@ OBJ TYPE) into container for
                  (@ THIS CONTAINS))))))
     (WHEN (NOT ((@ THIS FIND) OBJ)) ((@ THIS PUSH) OBJ))
     OBJ) */
Class.prototype.add = function (obj) {
    if (this.contains && obj.type !== this.contains) {
        throw new Error('Attempt to push ' + obj.type + 'into container for ' + this.contains);
    };
    if (!this.find(obj)) {
        this.push(obj);
    };
    return obj;
};
/* (DEFMETHOD *CLASS REMOVE (OBJ)
     (LET ((RETVAL ((@ THIS _STORAGE REMOVE) OBJ)))
       (WHEN RETVAL
         (TRIGGER THIS REMOVE OBJ CHANGE OBJ)
         (DECF (@ THIS LENGTH)))
       RETVAL)) */
Class.prototype.remove = function (obj) {
    var retval = this._storage.remove(obj);
    if (retval) {
        this.trigger('remove', obj);
        this.trigger('change', obj);
        --this.length;
    };
    return retval;
};
/* (DEFMETHOD *CLASS CLEAR ()
     (SETF (@ THIS _STORAGE) (ARRAY)
           (@ THIS LENGTH) 0)
     (TRIGGER THIS CHANGE)) */
Class.prototype.clear = function () {
    this._storage = [];
    this.length = 0;
    return this.trigger('change', null);
};
/* (DEFMETHOD *CLASS AT (INDEX) (AREF (@ THIS _STORAGE) INDEX)) */
Class.prototype.at = function (index) {
    return this._storage[index];
};
/* (DEFMETHOD *CLASS EACH (FUN SELF)
     (LET ((SELF (OR SELF THIS)))
       (DOLIST (ITEM (@ THIS _STORAGE)) ((@ FUN CALL) SELF ITEM)))) */
Class.prototype.each = function (fun, self) {
    var self5 = self || this;
    for (var item = null, _js_arrvar7 = this._storage, _js_idx6 = 0; _js_idx6 < _js_arrvar7.length; _js_idx6 += 1) {
        item = _js_arrvar7[_js_idx6];
        fun.call(self5, item);
    };
};
/* (DEFMETHOD *CLASS MAP (FUN SELF)
     (LET ((RESULT 'NIL) (SELF (OR SELF THIS)))
       (DOLIST (ITEM (@ THIS _STORAGE))
         ((@ RESULT PUSH) ((@ FUN CALL) SELF ITEM)))
       RESULT)) */
Class.prototype.map = function (fun, self) {
    var result = [];
    var self8 = self || this;
    for (var item = null, _js_arrvar10 = this._storage, _js_idx9 = 0; _js_idx9 < _js_arrvar10.length; _js_idx9 += 1) {
        item = _js_arrvar10[_js_idx9];
        result.push(fun.call(self8, item));
    };
    return result;
};
/* (DEFMETHOD *CLASS FILTER (FUN SELF)
     (LET ((RESULT 'NIL) (SELF (OR SELF THIS)))
       (DOLIST (ITEM (@ THIS _STORAGE))
         (WHEN ((@ FUN CALL) SELF ITEM) ((@ RESULT PUSH) ITEM)))
       RESULT)) */
Class.prototype.filter = function (fun, self) {
    var result = [];
    var self11 = self || this;
    for (var item = null, _js_arrvar13 = this._storage, _js_idx12 = 0; _js_idx12 < _js_arrvar13.length; _js_idx12 += 1) {
        item = _js_arrvar13[_js_idx12];
        if (fun.call(self11, item)) {
            result.push(item);
        };
    };
    return result;
};
/* (DEFMETHOD *CLASS FIND (FUN-OR-OBJ)
     (IF (= (TYPEOF FUN-OR-OBJ) FUNCTION)
         (DOLIST (ITEM (@ THIS _STORAGE))
           (WHEN (FUN-OR-OBJ ITEM) (RETURN-FROM FIND ITEM)))
         (DOLIST (ITEM (@ THIS _STORAGE))
           (WHEN (= FUN-OR-OBJ ITEM) (RETURN-FROM FIND ITEM))))) */
Class.prototype.find = function (funOrObj) {
    if (typeof funOrObj === 'function') {
        for (var item = null, _js_arrvar17 = this._storage, _js_idx16 = 0; _js_idx16 < _js_arrvar17.length; _js_idx16 += 1) {
            item = _js_arrvar17[_js_idx16];
            if (funOrObj(item)) {
                return item;
            };
        };
    } else {
        for (var item = null, _js_arrvar19 = this._storage, _js_idx18 = 0; _js_idx18 < _js_arrvar19.length; _js_idx18 += 1) {
            item = _js_arrvar19[_js_idx18];
            if (funOrObj === item) {
                return item;
            };
        };
    };
};
/* (DEFCLASS *VIEW (*CLASS) (OPTIONS MODEL)
             (SETF (@ THIS MODEL) MODEL
                   (@ THIS $EL) ($ <DIV>))
             (WHEN OPTIONS
               (WHEN (@ OPTIONS TAG-NAME)
                 (SETF (@ THIS $EL) ($ (+ < (@ OPTIONS TAG-NAME) >))))
               (WHEN (@ OPTIONS STYLE) ((@ THIS $EL CSS) (@ OPTIONS STYLE)))
               (WHEN (@ OPTIONS MODEL)
                 (SETF (@ THIS MODEL) (@ OPTIONS MODEL))
                 (DELETE (@ OPTIONS MODEL)))
               ((@ THIS $EL ATTR) CLASS
                (OR (@ OPTIONS CLASS-NAME) (@ OPTIONS TYPE)))
               (WHEN (@ OPTIONS EVENTS)
                 (FOR-IN (EVENT (@ OPTIONS EVENTS))
                         ((@ THIS $EL ON) EVENT
                          ((GETPROP OPTIONS 'EVENTS EVENT 'BIND) THIS)))))) */
function View(options, model) {
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
            this.model = options.model;
            delete options.model;
        };
        this.$el.attr('class', options.className || options.type);
        if (options.events) {
            for (var event in options.events) {
                this.$el.on(event, options.events[event].bind(this));
            };
        };
    };
    Class.apply(this, arguments);
    return this;
};
View.prototype = Object.create(Class.prototype);
View.prototype.constructor = View;
/* (EXPORT *CLASS *VIEW) */
if (module) {
    module.exports.Class = Class;
};
if (module) {
    module.exports.View = View;
};
