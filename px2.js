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
/* (DEFUN MAGIC (OPTIONS ARGS)
     (SETF (@ THIS _PARENTS) (ARRAY)
           (@ THIS _MEMBERS) (CREATE)
           (@ THIS _ACTIONS) (CREATE)
           (@ THIS _STORAGE) (ARRAY))
     (IF (AND OPTIONS (@ OPTIONS DEFAULTS))
         (FOR-IN (DEF (@ OPTIONS DEFAULTS))
                 ((@ THIS CREATE) DEF (GETPROP OPTIONS 'DEFAULTS DEF))))
     (FOR-IN (K OPTIONS) (SETF (GETPROP THIS K) (GETPROP OPTIONS K)))
     (SETF THIS.LENGTH 0)
     (SETF THIS._CURSOR 0)
     (SETF THIS._OPTIONS OPTIONS)
     (IF (@ THIS INIT)
         ((@ THIS INIT APPLY) THIS ARGS))
     THIS) */
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
    this._options = options;
    if (this.init) {
        this.init.apply(this, args);
    };
    return this;
};
/* (DEFUN *MODEL (OPTIONS)
     (LET ((FUN (LAMBDA () ((@ MAGIC CALL) THIS OPTIONS ARGUMENTS))))
       (SETF (@ FUN PROTOTYPE) ((@ *OBJECT CREATE) (@ *MODEL PROTOTYPE)))
       (SETF (@ FUN PROTOTYPE CONSTRUCTOR) *MODEL)
       FUN)) */
function Model(options) {
    var fun = function () {
        return magic.call(this, options, arguments);
    };
    fun.prototype = Object.create(Model.prototype);
    fun.prototype.constructor = Model;
    return fun;
};
/* (DEFUN *MODELP (VALUE)
     (AND (= (TYPEOF VALUE) OBJECT) ((@ *ARRAY IS-ARRAY) (@ VALUE _STORAGE))
          ((@ *ARRAY IS-ARRAY) (@ VALUE _PARENTS)))) */
function Modelp(value) {
    return typeof value === 'object' && Array.isArray(value._storage) && Array.isArray(value._parents);
};
/* (DEFUN ADD-PARENT (CHILD PARENT NAME)
     (WHEN (*MODELP CHILD)
       (LET (ALREADY-CHILD)
         ((@ (@ CHILD _PARENTS) FOR-EACH)
          (LAMBDA (P) (SETF ALREADY-CHILD (OR ALREADY-CHILD (= PARENT P)))))
         (UNLESS ALREADY-CHILD
           ((@ CHILD _PARENTS PUSH) PARENT)
           (IF NAME
               ((@ PARENT ONCE) (+ CHANGE : NAME)
                (LAMBDA (E) ((@ CHILD _PARENTS REMOVE) (@ E TARGET))))
               ((@ PARENT ON) REMOVE
                (LAMBDA (E)
                  (IF (= E.TARGET CHILD)
                      ((@ CHILD _PARENTS REMOVE) (@ E TARGET)))))))))) */
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
/* (DEFMETHOD *MODEL COPY ()
     (LET* ((CLS (*MODEL THIS._OPTIONS)) (OBJ (NEW (CLS))))
       (FOR-IN (PROP THIS._MEMBERS) (OBJ.DESTROY PROP T)
               (LET ((THIS-PROP (GETPROP THIS '_MEMBERS PROP)))
                 (IF (*MODELP THIS-PROP)
                     (OBJ.CREATE PROP ((@ (GETPROP THIS '_MEMBERS PROP) COPY)))
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
                 (IF (*MODELP E)
                     ((@ E COPY))
                     ((@ *JSON* PARSE) ((@ *JSON* STRINGIFY) E)))))))
         (OBJ.CLEAR T)
         ((@ NEW-STORAGE FOR-EACH) (LAMBDA (E) (OBJ.PUSH E T))))
       OBJ)) */
Model.prototype.copy = function () {
    var cls = Model(this._options);
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
/* (DEFMETHOD *MODEL GET (NAME LOUD)
     (IF (NOT ((@ THIS _MEMBERS HAS-OWN-PROPERTY) NAME))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to get a property  NAME  that does not exist.)))))
     (WHEN LOUD (TRIGGER THIS GET THIS[NAME] (+ GET : NAME) THIS[NAME]))
     (GETPROP THIS '_MEMBERS NAME)) */
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
/* (DEFUN GETSET (NAME VALUE SILENT)
     (IF (= (@ ARGUMENTS LENGTH) 1)
         ((@ THIS GET) NAME)
         ((@ THIS SET) NAME VALUE SILENT))) */
function getset(name, value, silent) {
    return arguments.length === 1 ? this.get(name) : this.set(name, value, silent);
};
/* (DEFMETHOD *MODEL CREATE (NAME VALUE SILENT)
     (IF ((@ THIS _MEMBERS HAS-OWN-PROPERTY) NAME)
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to create property  NAME  that already exists.)))))
     (SETF (GETPROP THIS '_MEMBERS NAME) VALUE
           (GETPROP THIS NAME) ((@ GETSET BIND) THIS NAME))
     (ADD-PARENT VALUE THIS NAME)
     (UNLESS SILENT (TRIGGER THIS CREATE VALUE (+ CREATE : NAME) VALUE))
     VALUE) */
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
/* (DEFMETHOD *MODEL SET (NAME VALUE SILENT)
     (IF (NOT ((@ THIS _MEMBERS HAS-OWN-PROPERTY) NAME))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to set a property  NAME  that does not exist.)))))
     (LET ((OLD-VALUE (GETPROP THIS '_MEMBERS NAME)))
       (SETF (GETPROP THIS '_MEMBERS NAME) VALUE)
       (UNLESS SILENT
         (TRIGGER THIS CHANGE OLD-VALUE (+ CHANGE : NAME) OLD-VALUE))
       (ADD-PARENT VALUE THIS NAME))
     VALUE) */
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
/* (DEFMETHOD *MODEL DESTROY (NAME)
     (LET ((VALUE (GETPROP THIS '_MEMBERS NAME)))
       (DELETE (GETPROP THIS '_MEMBERS NAME))
       (DELETE (GETPROP THIS '_ACTIONS (+ CHANGE : NAME)))
       (DELETE (GETPROP THIS NAME))
       (TRIGGER THIS DESTROY VALUE))) */
Model.prototype.destroy = function (name) {
    var value = this._members[name];
    delete this._members[name];
    delete this._actions['change' + ':' + name];
    delete this[name];
    return this.trigger('destroy', value);
};
/* (DEFMETHOD *MODEL TRIGGER (MESSAGE VALUE TARGET)
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
/* (DEFMETHOD *MODEL ON (MESSAGE FUN SELF)
     (LET ((ACTION (CREATE MESSAGE MESSAGE FUN FUN SELF (OR SELF THIS))))
       (IF (NOT (GETPROP THIS '_ACTIONS MESSAGE))
           (SETF (GETPROP THIS '_ACTIONS MESSAGE) (ARRAY ACTION))
           ((GETPROP THIS '_ACTIONS MESSAGE 'PUSH) ACTION))
       ACTION)) */
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
/* (DEFMETHOD *MODEL ONCE (MESSAGE FUN SELF)
     (LET ((ACTION (CREATE MESSAGE MESSAGE FUN FUN SELF (OR SELF THIS) ONCE T)))
       (IF (NOT (GETPROP THIS '_ACTIONS MESSAGE))
           (SETF (GETPROP THIS '_ACTIONS MESSAGE) (ARRAY ACTION))
           ((GETPROP THIS '_ACTIONS MESSAGE 'PUSH) ACTION))
       ACTION)) */
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
/* (DEFMETHOD *MODEL PUSH (OBJ SILENT)
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
/* (DEFMETHOD *MODEL ADD (OBJ SILENT)
     (IF (AND (@ THIS CONTAINS) (NOT (= (@ OBJ TYPE) (@ THIS CONTAINS))))
         (THROW
             (NEW
              (*ERROR
               (+ Attempt to push  (@ OBJ TYPE) into container for
                  (@ THIS CONTAINS))))))
     (WHEN (NOT ((@ THIS FIND) OBJ)) ((@ THIS PUSH) OBJ SILENT))
     OBJ) */
Model.prototype.add = function (obj, silent) {
    if (this.contains && obj.type !== this.contains) {
        throw new Error('Attempt to push ' + obj.type + 'into container for ' + this.contains);
    };
    if (!this.find(obj)) {
        this.push(obj, silent);
    };
    return obj;
};
/* (DEFMETHOD *MODEL INSERT-AT (I OBJ SILENT)
     ((@ (@ THIS _STORAGE) SPLICE) I 0 OBJ)
     (INCF THIS.LENGTH)
     (ADD-PARENT OBJ THIS)
     (UNLESS SILENT (TRIGGER THIS ADD OBJ MODIFIED (ARRAY OBJ)))
     OBJ) */
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
/* (DEFMETHOD *MODEL SWAP (I J SILENT)
     (LET ((A (THIS.AT I)) (B (THIS.AT J)))
       (SETF THIS._STORAGE[I] B
             THIS._STORAGE[J] A)
       (UNLESS SILENT (TRIGGER THIS MODIFIED (ARRAY A B)))
       T)) */
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
/* (DEFMETHOD *MODEL REMOVE (OBJ SILENT)
     (LET ((RETVAL ((@ THIS _STORAGE REMOVE) OBJ)))
       (WHEN RETVAL
         (DECF (@ THIS LENGTH))
         (WHEN (*MODELP OBJ) ((@ OBJ _PARENTS REMOVE) THIS))
         (UNLESS SILENT (TRIGGER THIS REMOVE OBJ MODIFIED (ARRAY OBJ))))
       RETVAL)) */
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
/* (DEFMETHOD *MODEL CLEAR (SILENT)
     (LET ((OLD-STORAGE (@ THIS _STORAGE)))
       (SETF (@ THIS _STORAGE) (ARRAY)
             (@ THIS LENGTH) 0)
       (DOLIST (THING OLD-STORAGE)
         (WHEN (*MODELP THING) ((@ THING _PARENTS REMOVE) THIS)))
       (UNLESS SILENT (TRIGGER THIS CLEAR THIS MODIFIED OLD-STORAGE)))) */
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
/* (DEFMETHOD *MODEL AT (INDEX)
     (WHEN (>= INDEX (@ THIS LENGTH))
       (THROW
           (NEW
            (*ERROR
             (+ attempt to index ( INDEX ) out of range of object (
                (@ THIS LENGTH) ))))))
     (AREF (@ THIS _STORAGE) INDEX)) */
Model.prototype.at = function (index) {
    if (index >= this.length) {
        throw new Error('attempt to index (' + index + ') out of range of object (' + this.length + ')');
    };
    return this._storage[index];
};
/* (DEFMETHOD *MODEL CURRENT (OBJORNUMBER SILENT)
     (IF (NOT (= OBJORNUMBER UNDEFINED))
         (LET ((PREV-VALUE (THIS.AT THIS._CURRENT)) RETVAL)
           (SETF RETVAL
                   (IF (= (TYPEOF OBJORNUMBER) object)
                       (THIS.AT
                        (SETF THIS._CURRENT ((@ THIS INDEX-OF) OBJORNUMBER)))
                       (THIS.AT (SETF THIS._CURRENT OBJORNUMBER))))
           (UNLESS SILENT
             (TRIGGER THIS CHANGE PREV-VALUE change:current PREV-VALUE))
           RETVAL)
         (THIS.AT THIS._CURRENT))) */
Model.prototype.current = function (objornumber, silent) {
    if (objornumber !== undefined) {
        var prevValue = this.at(this._current);
        var retval = null;
        retval = typeof objornumber === 'object' ? this.at(this._current = this.indexOf(objornumber)) : this.at(this._current = objornumber);
        if (!silent) {
            this.trigger('change', prevValue);
            this.trigger('change:current', prevValue);
        };
        return retval;
    } else {
        return this.at(this._current);
    };
};
/* (DEFMETHOD *MODEL START (SILENT) ((@ THIS CURRENT) 0 SILENT)) */
Model.prototype.start = function (silent) {
    return this.current(0, silent);
};
/* (DEFMETHOD *MODEL END (SILENT) ((@ THIS CURRENT) (1- THIS.LENGTH) SILENT)) */
Model.prototype.end = function (silent) {
    return this.current(this.length - 1, silent);
};
/* (DEFMETHOD *MODEL NEXT (LOOP SILENT)
     (IF LOOP
         (THIS.CURRENT (REM (1+ THIS._CURRENT) THIS.LENGTH) SILENT)
         (IF (< THIS._CURRENT (- THIS.LENGTH 1))
             (THIS.CURRENT (1+ THIS._CURRENT) SILENT)
             UNDEFINED))) */
Model.prototype.next = function (loop, silent) {
    if (loop) {
        return this.current((this._current + 1) % this.length, silent);
    } else {
        return this._current < this.length - 1 ? this.current(this._current + 1, silent) : undefined;
    };
};
/* (DEFMETHOD *MODEL PREV (LOOP SILENT)
     (IF LOOP
         (IF (= THIS._CURRENT 0)
             (THIS.CURRENT (1- THIS.LENGTH) SILENT)
             (THIS.CURRENT (1- THIS._CURRENT) SILENT))
         (IF (> THIS._CURRENT 0)
             (THIS.CURRENT (1- THIS._CURRENT) SILENT)
             UNDEFINED))) */
Model.prototype.prev = function (loop, silent) {
    if (loop) {
        return this._current === 0 ? this.current(this.length - 1, silent) : this.current(this._current - 1, silent);
    } else {
        return this._current > 0 ? this.current(this._current - 1, silent) : undefined;
    };
};
/* (DEFMETHOD *MODEL INDEX-OF (OBJ)
     (LET ((I -1))
       (AND (THIS.FIND (LAMBDA (IT) (INCF I) (= IT OBJ))) I))) */
Model.prototype.indexOf = function (obj) {
    var i = -1;
    return this.find(function (it) {
        ++i;
        return it === obj;
    }) && i;
};
/* (DEFMETHOD *MODEL EACH (FUN SELF)
     (LET ((SELF (OR SELF THIS)))
       (DOLIST (ITEM (@ THIS _STORAGE)) ((@ FUN CALL) SELF ITEM)))) */
Model.prototype.each = function (fun, self) {
    var self9 = self || this;
    for (var item = null, _js_arrvar11 = this._storage, _js_idx10 = 0; _js_idx10 < _js_arrvar11.length; _js_idx10 += 1) {
        item = _js_arrvar11[_js_idx10];
        fun.call(self9, item);
    };
};
/* (DEFMETHOD *MODEL FOR-IN (FUN SELF)
     (LET ((SELF (OR SELF THIS)))
       (FOR-IN (K (@ THIS _MEMBERS))
               ((@ FUN CALL) SELF K (GETPROP THIS '_MEMBERS K))))) */
Model.prototype.forIn = function (fun, self) {
    var self12 = self || this;
    for (var k in this._members) {
        fun.call(self12, k, this._members[k]);
    };
};
/* (DEFMETHOD *MODEL MAP (FUN SELF)
     (LET ((RESULT 'NIL) (SELF (OR SELF THIS)))
       (DOLIST (ITEM (@ THIS _STORAGE))
         ((@ RESULT PUSH) ((@ FUN CALL) SELF ITEM)))
       RESULT)) */
Model.prototype.map = function (fun, self) {
    var result = [];
    var self13 = self || this;
    for (var item = null, _js_arrvar15 = this._storage, _js_idx14 = 0; _js_idx14 < _js_arrvar15.length; _js_idx14 += 1) {
        item = _js_arrvar15[_js_idx14];
        result.push(fun.call(self13, item));
    };
    return result;
};
/* (DEFMETHOD *MODEL FILTER (FUN SELF)
     (LET ((RESULT 'NIL) (SELF (OR SELF THIS)))
       (DOLIST (ITEM (@ THIS _STORAGE))
         (WHEN ((@ FUN CALL) SELF ITEM) ((@ RESULT PUSH) ITEM)))
       RESULT)) */
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
/* (DEFMETHOD *MODEL FIND (FUN-OR-OBJ SELF)
     (IF (= (TYPEOF FUN-OR-OBJ) FUNCTION)
         (DOLIST (ITEM (@ THIS _STORAGE))
           (WHEN ((@ FUN-OR-OBJ CALL) (OR SELF THIS) ITEM)
             (RETURN-FROM FIND ITEM)))
         (DOLIST (ITEM (@ THIS _STORAGE))
           (WHEN (= FUN-OR-OBJ ITEM) (RETURN-FROM FIND ITEM))))) */
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
/* (DEFMETHOD *MODEL SORT (FUN SILENT)
     ((@ THIS _STORAGE SORT) FUN)
     (UNLESS SILENT (TRIGGER THIS MODIFIED (@ THIS _STORAGE)))
     THIS) */
Model.prototype.sort = function (fun, silent) {
    this._storage.sort(fun);
    if (!silent) {
        this.trigger('modified', this._storage);
    };
    return this;
};
/* (DEFMETHOD *MODEL SERIALIZE ()
     (LET* ((MEMBERS (CREATE)) STORAGE (ACTIONS (ARRAY)) (OPTIONS (CREATE)))
       (FOR-IN (PROP THIS._MEMBERS)
               (SETF (GETPROP MEMBERS PROP)
                       (LET ((THIS-PROP (GETPROP THIS '_MEMBERS PROP)))
                         (IF (*MODELP THIS-PROP)
                             ((@ (GETPROP THIS '_MEMBERS PROP) SERIALIZE))
                             (IF (OR ((@ *ARRAY IS-ARRAY) THIS-PROP)
                                     (= (TYPEOF THIS-PROP) 'OBJECT))
                                 ((@ *JSON* STRINGIFY)
                                  ((@ *JSON* STRINGIFY) THIS-PROP))
                                 THIS-PROP)))))
       (SETF STORAGE
               (THIS.MAP
                (LAMBDA (E)
                  (IF (*MODELP E)
                      ((@ E SERIALIZE))
                      E))))
       (FLET ((OPTION-SERIALIZE (THING)
                (IF (= (TYPEOF THING) function)
                    (ARRAY FUNCTION (+ var x =  ((@ THING TO-STRING)) ;x))
                    (IF (= (TYPEOF THING) object)
                        (LET ((OBJ (CREATE)))
                          (FOR-IN (KEY THING)
                                  (SETF (GETPROP OBJ KEY)
                                          (OPTION-SERIALIZE
                                           (GETPROP THING KEY))))
                          (ARRAY OBJECT OBJ))
                        (ARRAY OTHER THING)))))
         (FOR-IN (OPTION THIS._OPTIONS)
                 (SETF (GETPROP OPTIONS OPTION)
                         (LET ((THING (GETPROP THIS._OPTIONS OPTION)))
                           (OPTION-SERIALIZE THING)))))
       (FOR-IN (ACTION THIS._ACTIONS)
               (LET ((THING (GETPROP THIS._ACTIONS ACTION)))
                 (DOLIST (X THING)
                   ((@ ACTIONS PUSH)
                    (CREATE MESSAGE (@ X MESSAGE) FUN
                     (+ var x =  ((@ X FUN TO-STRING)) ;x) SELF
                     (IF (= (@ X SELF) THIS)
                         THIS
                         (IF (*MODELP X)
                             ((@ X SERIALIZE))
                             X))
                     ONCE (@ X ONCE))))))
       (CREATE MEMBERS MEMBERS STORAGE STORAGE ACTIONS ACTIONS OPTIONS
        OPTIONS))) */
Model.prototype.serialize = function () {
    var thisProp;
    var thing;
    var members = {  };
    var storage = null;
    var actions = [];
    var options = {  };
    for (var prop in this._members) {
        members[prop] = (thisProp = this._members[prop], Modelp(thisProp) ? this._members[prop].serialize() : (Array.isArray(thisProp) || typeof thisProp === 'object' ? JSON.stringify(JSON.stringify(thisProp)) : thisProp));
    };
    storage = this.map(function (e) {
        return Modelp(e) ? e.serialize() : e;
    });
    var optionSerialize = function (thing) {
        if (typeof thing === 'function') {
            return ['function', 'var x = ' + thing.toString() + ';x'];
        } else {
            if (typeof thing === 'object') {
                var obj = {  };
                for (var key in thing) {
                    obj[key] = optionSerialize(thing[key]);
                };
                return ['object', obj];
            } else {
                return ['other', thing];
            };
        };
    };
    for (var option in this._options) {
        options[option] = (thing = this._options[option], optionSerialize(thing));
    };
    for (var action in this._actions) {
        var thing25 = this._actions[action];
        for (var x = null, _js_idx26 = 0; _js_idx26 < thing25.length; _js_idx26 += 1) {
            x = thing25[_js_idx26];
            actions.push({ message : x.message,
                           fun : 'var x = ' + x.fun.toString() + ';x',
                           self : x.self === this ? 'this' : (Modelp(x) ? x.serialize() : x),
                           once : x.once
                         });
        };
    };
    return { members : members,
             storage : storage,
             actions : actions,
             options : options
           };
};
/* (DEFMETHOD *MODEL LOAD (OBJ LOAD-ACTIONS)
     (FLET ((SERIALIZEDP (OBJ)
              (NOT
               (OR (= OBJ.MEMBERS UNDEFINED) (= OBJ.STORAGE UNDEFINED)
                   (= OBJ.ACTIONS UNDEFINED) (= OBJ.OPTIONS UNDEFINED))))
            (DESERIALIZE-OPTIONS (OPTIONS)
              (FOR-IN (OPTION OPTIONS)
                      (LET ((THING (GETPROP OPTIONS OPTION)))
                        (SETF (GETPROP OPTIONS OPTION)
                                (CASE (AREF THING 0)
                                  (FUNCTION
                                   ((@ (EVAL (AREF THING 1)) BIND) THIS))
                                  (OBJECT
                                   (FOR-IN (KEY THING)
                                           (SETF (GETPROP THING KEY)
                                                   (DESERIALIZE-OPTIONS
                                                    (GETPROP THING KEY))))
                                   THING)
                                  (OTHER THING)))))
              OPTIONS))
       (LET ((MEMBERS (@ OBJ MEMBERS))
             (STORAGE (@ OBJ STORAGE))
             (ACTIONS (@ OBJ ACTIONS))
             (OPTIONS (DESERIALIZE-OPTIONS (@ OBJ OPTIONS))))
         (IF (SERIALIZEDP OBJ)
             (FOR-IN (MEMBER MEMBERS)
                     (LET ((THING (GETPROP MEMBERS MEMBER)))
                       (IF (SERIALIZEDP THING)
                           (LET* ((MODEL (NEW (NEW (*MODEL THING.OPTIONS))))
                                  (DESERIALIZED-THING ((@ MODEL LOAD) THING)))
                             (IF (GETPROP THIS MEMBER)
                                 ((GETPROP THIS MEMBER) DESERIALIZED-THING)
                                 ((@ THIS CREATE) MEMBER DESERIALIZED-THING)))
                           (IF (GETPROP THIS MEMBER)
                               ((GETPROP THIS MEMBER) THING)
                               ((@ THIS CREATE) MEMBER THING))))))
         (THIS.CLEAR)
         (DOLIST (THING STORAGE)
           (THIS.ADD
            (IF (SERIALIZEDP THING)
                (LET* ((MODEL (NEW (NEW (*MODEL THING.OPTIONS))))
                       (DESERIALIZED-THING ((@ MODEL LOAD) THING)))
                  DESERIALIZED-THING)
                THING)
            T))
         (WHEN LOAD-ACTIONS
           (DOLIST (ACTION ACTIONS)
             ((@ THIS ON) ACTION.MESSAGE
              ((@ (EVAL ACTION.FUN) BIND) (WHEN (= ACTION.THIS THIS) THIS))
              ACTION.ONCE)))
         THIS))) */
Model.prototype.load = function (obj, loadActions) {
    var model30;
    var deserializedThing31;
    var serializedp = function (obj) {
        return !(obj.members === undefined || obj.storage === undefined || obj.actions === undefined || obj.options === undefined);
    };
    var deserializeOptions = function (options) {
        for (var option in options) {
            with ({ thing : null }) {
                var thing = options[option];
                options[option] = (function () {
                    switch (thing[0]) {
                    case 'function':
                        return eval(thing[1]).bind(this);
                    case 'object':
                        for (var key in thing) {
                            thing[key] = deserializeOptions(thing[key]);
                        };
                        return thing;
                    case 'other':
                        return thing;
                    };
                })();
            };
        };
        return options;
    };
    var members25 = obj.members;
    var storage26 = obj.storage;
    var actions27 = obj.actions;
    var options28 = deserializeOptions(obj.options);
    if (serializedp(obj)) {
        for (var member in members25) {
            var thing = members25[member];
            if (serializedp(thing)) {
                var model = new (new Model(thing.options));
                var deserializedThing = model.load(thing);
                if (this[member]) {
                    this[member](deserializedThing);
                } else {
                    this.create(member, deserializedThing);
                };
            } else {
                if (this[member]) {
                    this[member](thing);
                } else {
                    this.create(member, thing);
                };
            };
        };
    };
    this.clear();
    for (var thing = null, _js_idx29 = 0; _js_idx29 < storage26.length; _js_idx29 += 1) {
        thing = storage26[_js_idx29];
        this.add(serializedp(thing) ? (model30 = new (new Model(thing.options)), (deserializedThing31 = model30.load(thing), deserializedThing31)) : thing, true);
    };
    if (loadActions) {
        for (var action = null, _js_idx30 = 0; _js_idx30 < actions27.length; _js_idx30 += 1) {
            action = actions27[_js_idx30];
            this.on(action.message, eval(action.fun).bind(action.this === 'this' ? this : null), action.once);
        };
    };
    return this;
};
/* (DEFUN *VIEW (OPTIONS)
     (LET ((FUN
            (LAMBDA (MODEL)
              (SETF (@ THIS MODEL) MODEL
                    (@ THIS $EL) ($ <DIV>))
              (WHEN OPTIONS
                (WHEN (@ OPTIONS TAG-NAME)
                  (SETF (@ THIS $EL) ($ (+ < (@ OPTIONS TAG-NAME) >))))
                (WHEN (@ OPTIONS STYLE) ((@ THIS $EL CSS) (@ OPTIONS STYLE)))
                (WHEN (@ OPTIONS MODEL)
                  (SETF (GETPROP THIS (@ OPTIONS MODEL)) MODEL))
                ((@ THIS $EL ATTR) CLASS
                 (IF (AND (@ OPTIONS CLASS-NAME) (@ OPTIONS TYPE))
                     (IF (= ((@ (@ OPTIONS CLASS-NAME) INDEX-OF)  ) 0)
                         (+ (@ OPTIONS TYPE) (@ OPTIONS CLASS-NAME))
                         (@ OPTIONS CLASS-NAME))
                     (IF (@ OPTIONS CLASS-NAME)
                         (@ OPTIONS CLASS-NAME)
                         (@ OPTIONS TYPE))))
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
                           ((GETPROP OPTIONS 'EVENTS EVENT 'BIND) THIS))))
                ((@ MAGIC CALL) THIS OPTIONS ARGUMENTS)
                THIS))))
       (SETF (@ FUN PROTOTYPE) ((@ *OBJECT CREATE) (@ *MODEL PROTOTYPE)))
       (SETF (@ FUN PROTOTYPE CONSTRUCTOR) *VIEW)
       FUN)) */
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
            this.$el.attr('class', options.className && options.type ? (options.className.indexOf(' ') === 0 ? options.type + options.className : options.className) : (options.className ? options.className : options.type));
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
/* (EXPORT *MODEL *VIEW) */
if (typeof module !== 'undefined') {
    module.exports.Model = Model;
};
if (typeof module !== 'undefined') {
    module.exports.View = View;
};
