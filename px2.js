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
             (SETF THIS.LENGTH 0) (SETF THIS.OPTIONS OPTIONS)
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
    this.length = 0;
    this.options = options;
    if (this.init) {
        var args = Array.prototype.slice.call(arguments, 1);
        this.init.apply(this, args);
    };
    return this;
};
/* (DEFUN *CLASSP (VALUE)
     (AND (= (TYPEOF VALUE) OBJECT) ((@ *ARRAY IS-ARRAY) (@ VALUE _STORAGE))
          ((@ *ARRAY IS-ARRAY) (@ VALUE _PARENTS)))) */
function Classp(value) {
    return typeof value === 'object' && Array.isArray(value._storage) && Array.isArray(value._parents);
};
/* (DEFUN ADD-PARENT (CHILD PARENT NAME)
     (WHEN (*CLASSP CHILD)
       (LET (ALREADY-CHILD)
         ((@ (@ CHILD _PARENTS) FOR-EACH)
          (LAMBDA (P) (SETF ALREADY-CHILD (OR ALREADY-CHILD (= PARENT P)))))
         (UNLESS ALREADY-CHILD
           ((@ CHILD _PARENTS PUSH) PARENT)
           (IF NAME
               ((@ PARENT ONCE) (+ CHANGE : NAME)
                (LAMBDA (E) ((@ CHILD _PARENTS REMOVE) (@ E TARGET))))
               ((@ PARENT ON) (+ REMOVE)
                (LAMBDA (E)
                  (IF (= E.TARGET OBJ)
                      ((@ CHILD _PARENTS REMOVE) (@ E TARGET)))))))))) */
function addParent(child, parent, name) {
    if (Classp(child)) {
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
                return parent.on(+'remove', function (e) {
                    return e.target === obj ? child._parents.remove(e.target) : null;
                });
            };
        };
    };
};
/* (DEFMETHOD *CLASS COPY ()
     (LET ((OBJ (NEW (*CLASS THIS.OPTIONS))))
       (FOR-IN (PROP THIS._PROPS) (OBJ.DESTROY PROP T)
               (LET ((THIS-PROP (GETPROP THIS '_PROPS PROP)))
                 (IF (*CLASSP THIS-PROP)
                     (OBJ.CREATE PROP ((@ (GETPROP THIS '_PROPS PROP) COPY)))
                     (OBJ.CREATE PROP
                      (IF (OR ((@ *ARRAY IS-ARRAY) THIS-PROP)
                              (= (TYPEOF THIS-PROP) 'OBJECT))
                          ((@ *JSON* PARSE) ((@ *JSON* STRINGIFY) THIS-PROP))
                          THIS-PROP)))))
       (SETF (@ OBJ _ACTIONS) (CREATE))
       (FOR-IN (ACTION (@ THIS _ACTIONS))
               (LET ((OLD-ACTIONS (GETPROP THIS '_ACTIONS ACTION))
                     (NEW-ACTIONS (ARRAY)))
                 (DOLIST (OLD-ACTION OLD-ACTIONS)
                   (IF (= (@ OLD-ACTION SELF) THIS)
                       ((@ NEW-ACTIONS PUSH)
                        (CREATE MESSAGE (@ OLD-ACTION MESSAGE) FUN
                         (@ OLD-ACTION FUN) SELF OBJ))
                       ((@ NEW-ACTIONS PUSH)
                        (CREATE MESSAGE (@ OLD-ACTION MESSAGE) FUN
                         (@ OLD-ACTION FUN) SELF (@ OLD-ACTION SELF)))))
                 (SETF (GETPROP OBJ '_ACTIONS ACTION) NEW-ACTIONS)))
       (LET ((NEW-STORAGE
              (THIS.MAP
               (LAMBDA (E)
                 (IF (*CLASSP E)
                     ((@ E COPY))
                     ((@ *JSON* PARSE) ((@ *JSON* STRINGIFY) E)))))))
         (OBJ.CLEAR T)
         ((@ NEW-STORAGE FOR-EACH) (LAMBDA (E) (OBJ.PUSH E T))))
       OBJ)) */
Class.prototype.copy = function () {
    var obj = new Class(this.options);
    for (var prop in this._props) {
        obj.destroy(prop, true);
        var thisProp = this._props[prop];
        if (Classp(thisProp)) {
            obj.create(prop, this._props[prop].copy());
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
        return Classp(e) ? e.copy() : JSON.parse(JSON.stringify(e));
    });
    obj.clear(true);
    newStorage.forEach(function (e) {
        return obj.push(e, true);
    });
    return obj;
};
/* (DEFMETHOD *CLASS GET (NAME SILENT)
     (IF (NOT ((@ THIS _PROPS HAS-OWN-PROPERTY) NAME))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to get a property  NAME  that does not exist.)))))
     (UNLESS SILENT (TRIGGER THIS GET THIS[NAME] (+ GET : NAME) THIS[NAME]))
     (GETPROP THIS '_PROPS NAME)) */
Class.prototype.get = function (name, silent) {
    if (!this._props.hasOwnProperty(name)) {
        throw new Error('Attempt to get a property ' + name + ' that does not exist.');
    };
    if (!silent) {
        this.trigger('get', this[name]);
        this.trigger('get' + ':' + name, this[name]);
    };
    return this._props[name];
};
/* (DEFUN GETSET (NAME VALUE SILENT)
     (IF (= (@ ARGUMENTS LENGTH) 1)
         ((@ THIS GET) NAME)
         ((@ THIS SET) NAME VALUE SILENT))) */
function getset(name, value, silent) {
    return arguments.length === 1 ? this.get(name) : this.set(name, value, silent);
};
/* (DEFMETHOD *CLASS CREATE (NAME VALUE SILENT)
     (IF ((@ THIS _PROPS HAS-OWN-PROPERTY) NAME)
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to create property  NAME  that already exists.)))))
     (SETF (GETPROP THIS '_PROPS NAME) VALUE
           (GETPROP THIS NAME) ((@ GETSET BIND) THIS NAME))
     (ADD-PARENT VALUE THIS NAME)
     (UNLESS SILENT (TRIGGER THIS CREATE VALUE (+ CREATE : NAME) VALUE))
     VALUE) */
Class.prototype.create = function (name, value, silent) {
    if (this._props.hasOwnProperty(name)) {
        throw new Error('Attempt to create property ' + name + ' that already exists.');
    };
    this._props[name] = value;
    this[name] = getset.bind(this, name);
    addParent(value, this, name);
    if (!silent) {
        this.trigger('create', value);
        this.trigger('create' + ':' + name, value);
    };
    return value;
};
/* (DEFMETHOD *CLASS SET (NAME VALUE SILENT)
     (IF (NOT ((@ THIS _PROPS HAS-OWN-PROPERTY) NAME))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to set a property  NAME  that does not exist.)))))
     (LET ((OLD-VALUE (GETPROP THIS '_PROPS NAME)))
       (SETF (GETPROP THIS '_PROPS NAME) VALUE)
       (UNLESS SILENT
         (TRIGGER THIS CHANGE OLD-VALUE (+ CHANGE : NAME) OLD-VALUE))
       (ADD-PARENT VALUE THIS NAME))) */
Class.prototype.set = function (name, value, silent) {
    if (!this._props.hasOwnProperty(name)) {
        throw new Error('Attempt to set a property ' + name + ' that does not exist.');
    };
    var oldValue = this._props[name];
    this._props[name] = value;
    if (!silent) {
        this.trigger('change', oldValue);
        this.trigger('change' + ':' + name, oldValue);
    };
    return addParent(value, this, name);
};
/* (DEFMETHOD *CLASS DESTROY (NAME)
     (LET ((VALUE (GETPROP THIS '_PROPS NAME)))
       (DELETE (GETPROP THIS '_PROPS NAME))
       (DELETE (GETPROP THIS '_ACTIONS (+ CHANGE : NAME)))
       (DELETE (GETPROP THIS NAME))
       (TRIGGER THIS DESTROY VALUE))) */
Class.prototype.destroy = function (name) {
    var value = this._props[name];
    delete this._props[name];
    delete this._actions['change' + ':' + name];
    delete this[name];
    return this.trigger('destroy', value);
};
/* (DEFMETHOD *CLASS TRIGGER (MESSAGE VALUE TARGET)
     (LET ((ACTIONS (GETPROP THIS '_ACTIONS MESSAGE)) TRIGGER-PARENTS)
       (IF ACTIONS
           (LET ((EVENT (NEW (*EVENT (OR TARGET THIS) VALUE)))
                 (TO-REMOVE (ARRAY)))
             (DOLIST (ACTION ACTIONS)
               (WHEN (= ((@ ACTION FUN CALL) (@ ACTION SELF) EVENT) T)
                 (SETF TRIGGER-PARENTS T))
               (IF (@ ACTION ONCE)
                   ((@ TO-REMOVE PUSH) ACTION)))
             (DOLIST (ACTION TO-REMOVE) ((@ ACTIONS REMOVE) ACTION)))
           (SETF TRIGGER-PARENTS T))
       (WHEN TRIGGER-PARENTS
         (DOLIST (PARENT (@ THIS _PARENTS))
           (UNLESS (= PARENT TARGET)
             ((@ THIS TRIGGER CALL) PARENT MESSAGE VALUE (OR TARGET THIS))))))) */
Class.prototype.trigger = function (message, value, target) {
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
/* (DEFMETHOD *CLASS PUSH (OBJ SILENT)
     (IF (AND (@ THIS CONTAINS) (NOT (= (@ OBJ TYPE) (@ THIS CONTAINS))))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to push  (@ OBJ TYPE) into container for
                  (@ THIS CONTAINS))))))
     (ADD-PARENT OBJ THIS)
     ((@ THIS _STORAGE PUSH) OBJ)
     (SETF (@ THIS LENGTH) (@ THIS _STORAGE LENGTH))
     (UNLESS SILENT (TRIGGER THIS ADD OBJ MODIFIED (ARRAY OBJ)))
     OBJ) */
Class.prototype.push = function (obj, silent) {
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
/* (DEFMETHOD *CLASS ADD (OBJ SILENT)
     (IF (AND (@ THIS CONTAINS) (NOT (= (@ OBJ TYPE) (@ THIS CONTAINS))))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to push  (@ OBJ TYPE) into container for
                  (@ THIS CONTAINS))))))
     (WHEN (NOT ((@ THIS FIND) OBJ)) ((@ THIS PUSH) OBJ SILENT))
     OBJ) */
Class.prototype.add = function (obj, silent) {
    if (this.contains && obj.type !== this.contains) {
        throw new Error('Attempt to push ' + obj.type + 'into container for ' + this.contains);
    };
    if (!this.find(obj)) {
        this.push(obj, silent);
    };
    return obj;
};
/* (DEFMETHOD *CLASS INSERT-AT (I OBJ SILENT)
     ((@ (@ THIS _STORAGE) SPLICE) I 0 OBJ)
     (INCF THIS.LENGTH)
     (ADD-PARENT OBJ THIS)
     (UNLESS SILENT (TRIGGER THIS ADD OBJ MODIFIED (ARRAY OBJ)))
     OBJ) */
Class.prototype.insertAt = function (i, obj, silent) {
    this._storage.splice(i, 0, obj);
    ++this.length;
    addParent(obj, this);
    if (!silent) {
        this.trigger('add', obj);
        this.trigger('modified', [obj]);
    };
    return obj;
};
/* (DEFMETHOD *CLASS SWAP (I J SILENT)
     (LET ((A (THIS.AT I)) (B (THIS.AT J)))
       (SETF THIS._STORAGE[I] B
             THIS._STORAGE[J] A)
       (UNLESS SILENT (TRIGGER THIS MODIFIED (ARRAY A B)))
       T)) */
Class.prototype.swap = function (i, j, silent) {
    var a = this.at(i);
    var b = this.at(j);
    this._storage[i] = b;
    this._storage[j] = a;
    if (!silent) {
        this.trigger('modified', [a, b]);
    };
    return true;
};
/* (DEFMETHOD *CLASS REMOVE (OBJ SILENT)
     (LET ((RETVAL ((@ THIS _STORAGE REMOVE) OBJ)))
       (WHEN RETVAL
         (DECF (@ THIS LENGTH))
         (WHEN (*CLASSP OBJ) ((@ OBJ _PARENTS REMOVE) THIS))
         (UNLESS SILENT (TRIGGER THIS REMOVE OBJ MODIFIED (ARRAY OBJ))))
       RETVAL)) */
Class.prototype.remove = function (obj, silent) {
    var retval = this._storage.remove(obj);
    if (retval) {
        --this.length;
        if (Classp(obj)) {
            obj._parents.remove(this);
        };
        if (!silent) {
            this.trigger('remove', obj);
            this.trigger('modified', [obj]);
        };
    };
    return retval;
};
/* (DEFMETHOD *CLASS CLEAR (SILENT)
     (LET ((OLD-STORAGE (@ THIS _STORAGE)))
       (SETF (@ THIS _STORAGE) (ARRAY)
             (@ THIS LENGTH) 0)
       (DOLIST (THING OLD-STORAGE)
         (WHEN (*CLASSP THING) ((@ THING _PARENTS REMOVE) THIS)))
       (UNLESS SILENT (TRIGGER THIS CLEAR THIS MODIFIED OLD-STORAGE)))) */
Class.prototype.clear = function (silent) {
    var oldStorage = this._storage;
    this._storage = [];
    this.length = 0;
    for (var thing = null, _js_idx8 = 0; _js_idx8 < oldStorage.length; _js_idx8 += 1) {
        thing = oldStorage[_js_idx8];
        if (Classp(thing)) {
            thing._parents.remove(this);
        };
    };
    if (!silent) {
        this.trigger('clear', this);
        return this.trigger('modified', oldStorage);
    };
};
/* (DEFMETHOD *CLASS AT (INDEX)
     (WHEN (>= INDEX (@ THIS LENGTH))
       (THROW
           (NEW
            (*ERROR
             (+ attempt to index ( INDEX ) out of range of object (
                (@ THIS LENGTH) ))))))
     (AREF (@ THIS _STORAGE) INDEX)) */
Class.prototype.at = function (index) {
    if (index >= this.length) {
        throw new Error('attempt to index (' + index + ') out of range of object (' + this.length + ')');
    };
    return this._storage[index];
};
/* (DEFMETHOD *CLASS INDEX-OF (OBJ)
     (LET ((I -1))
       (AND (THIS.FIND (LAMBDA (IT) (INCF I) (= IT OBJ))) I))) */
Class.prototype.indexOf = function (obj) {
    var i = -1;
    return this.find(function (it) {
        ++i;
        return it === obj;
    }) && i;
};
/* (DEFMETHOD *CLASS EACH (FUN SELF)
     (LET ((SELF (OR SELF THIS)))
       (DOLIST (ITEM (@ THIS _STORAGE)) ((@ FUN CALL) SELF ITEM)))) */
Class.prototype.each = function (fun, self) {
    var self9 = self || this;
    for (var item = null, _js_arrvar11 = this._storage, _js_idx10 = 0; _js_idx10 < _js_arrvar11.length; _js_idx10 += 1) {
        item = _js_arrvar11[_js_idx10];
        fun.call(self9, item);
    };
};
/* (DEFMETHOD *CLASS MAP (FUN SELF)
     (LET ((RESULT 'NIL) (SELF (OR SELF THIS)))
       (DOLIST (ITEM (@ THIS _STORAGE))
         ((@ RESULT PUSH) ((@ FUN CALL) SELF ITEM)))
       RESULT)) */
Class.prototype.map = function (fun, self) {
    var result = [];
    var self12 = self || this;
    for (var item = null, _js_arrvar14 = this._storage, _js_idx13 = 0; _js_idx13 < _js_arrvar14.length; _js_idx13 += 1) {
        item = _js_arrvar14[_js_idx13];
        result.push(fun.call(self12, item));
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
    var self15 = self || this;
    for (var item = null, _js_arrvar17 = this._storage, _js_idx16 = 0; _js_idx16 < _js_arrvar17.length; _js_idx16 += 1) {
        item = _js_arrvar17[_js_idx16];
        if (fun.call(self15, item)) {
            result.push(item);
        };
    };
    return result;
};
/* (DEFMETHOD *CLASS FIND (FUN-OR-OBJ SELF)
     (IF (= (TYPEOF FUN-OR-OBJ) FUNCTION)
         (DOLIST (ITEM (@ THIS _STORAGE))
           (WHEN ((@ FUN-OR-OBJ CALL) (OR SELF THIS) ITEM)
             (RETURN-FROM FIND ITEM)))
         (DOLIST (ITEM (@ THIS _STORAGE))
           (WHEN (= FUN-OR-OBJ ITEM) (RETURN-FROM FIND ITEM))))) */
Class.prototype.find = function (funOrObj, self) {
    if (typeof funOrObj === 'function') {
        for (var item = null, _js_arrvar21 = this._storage, _js_idx20 = 0; _js_idx20 < _js_arrvar21.length; _js_idx20 += 1) {
            item = _js_arrvar21[_js_idx20];
            if (funOrObj.call(self || this, item)) {
                return item;
            };
        };
    } else {
        for (var item = null, _js_arrvar23 = this._storage, _js_idx22 = 0; _js_idx22 < _js_arrvar23.length; _js_idx22 += 1) {
            item = _js_arrvar23[_js_idx22];
            if (funOrObj === item) {
                return item;
            };
        };
    };
};
/* (DEFMETHOD *CLASS SORT (FUN SILENT)
     ((@ THIS _STORAGE SORT) FUN)
     (UNLESS SILENT (TRIGGER THIS MODIFIED (@ THIS _STORAGE)))
     THIS) */
Class.prototype.sort = function (fun, silent) {
    this._storage.sort(fun);
    if (!silent) {
        this.trigger('modified', this._storage);
    };
    return this;
};
/* (DEFCLASS *VIEW (*CLASS) (OPTIONS MODEL)
             (SETF (@ THIS MODEL) MODEL
                   (@ THIS $EL) ($ <DIV>))
             (WHEN OPTIONS
               (WHEN (@ OPTIONS TAG-NAME)
                 (SETF (@ THIS $EL) ($ (+ < (@ OPTIONS TAG-NAME) >))))
               (WHEN (@ OPTIONS STYLE) ((@ THIS $EL CSS) (@ OPTIONS STYLE)))
               (WHEN (@ OPTIONS MODEL)
                 (SETF (GETPROP THIS (@ OPTIONS MODEL)) MODEL))
               ((@ THIS $EL ATTR) CLASS
                (OR (@ OPTIONS CLASS-NAME) (@ OPTIONS TYPE)))
               (UNLESS (@ OPTIONS RENDER)
                 (IF (@ OPTIONS RENDER-AUGMENTED)
                     (SETF (@ THIS RENDER) (@ OPTIONS RENDER-AUGMENTED))
                     (SETF (@ THIS RENDER) (LAMBDA () (@ THIS $EL)))))
               (WHEN (@ OPTIONS RENDER)
                 (UNLESS (@ OPTIONS RENDER-AUGMENTED)
                   (PROGN
                    (SETF (@ THIS RENDER)
                            (LAMBDA ()
                              ((@ ((@ THIS $EL CHILDREN)) DETACH))
                              ((@ (@ OPTIONS ORIGINAL-RENDER) CALL) THIS)))
                    (SETF (@ OPTIONS RENDER-AUGMENTED) (@ THIS RENDER))
                    (SETF (@ OPTIONS ORIGINAL-RENDER) (@ OPTIONS RENDER))
                    (DELETE (@ OPTIONS RENDER)))))
               (UNLESS (@ OPTIONS INIT)
                 (IF (@ OPTIONS INIT-AUGMENTED)
                     (SETF (@ THIS INIT) (@ OPTIONS INIT-AUGMENTED))
                     (SETF (@ THIS INIT) (LAMBDA () (THIS.RENDER)))))
               (WHEN (@ OPTIONS INIT)
                 (UNLESS (@ OPTIONS INIT-AUGMENTED)
                   (PROGN
                    (SETF (@ THIS INIT)
                            (LAMBDA ()
                              ((@ (@ OPTIONS ORIGINAL-INIT) APPLY) THIS
                               ARGUMENTS)
                              ((@ THIS RENDER))))
                    (SETF (@ OPTIONS INIT-AUGMENTED) (@ THIS INIT))
                    (SETF (@ OPTIONS ORIGINAL-INIT) (@ OPTIONS INIT))
                    (DELETE (@ OPTIONS INIT)))))
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
    };
    Class.apply(this, arguments);
    return this;
};
View.prototype = Object.create(Class.prototype);
View.prototype.constructor = View;
/* (EXPORT *CLASS *VIEW) */
if (typeof module !== 'undefined') {
    module.exports.Class = Class;
};
if (typeof module !== 'undefined') {
    module.exports.View = View;
};
