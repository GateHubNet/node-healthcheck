/*******************************************************************************
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

 // TODO: Rewrite

exports.before = function(target, meths, hookBefore) {
  if (!Array.isArray(meths)) {
    meths = [meths];
  }

  meths.forEach(function(methodName) {
    var existing = target[methodName];
    if (!existing) return;

    var newFunc = function() {
      var context = {};
      hookBefore(this, methodName, arguments, context);
      return existing.apply(this, arguments);
    };
    newFunc.prototype = existing.prototype;

    target[methodName] = newFunc;
  });
};

exports.around = function(target, meths, hookBefore, hookAfter) {
  if (!Array.isArray(meths)) {
    meths = [meths];
  }

  meths.forEach(function(methodName) {
    var existing = target[methodName];
    if (!existing) return;

    var newFunc = function() {
      var context = {};
      hookBefore(this, methodName, arguments, context);
      var ret = existing.apply(this, arguments);
      return hookAfter(this, methodName, arguments, context, ret);
    };
    newFunc.prototype = existing.prototype;

    target[methodName] = newFunc;
  });
};

exports.after = function(target, meths, context, hookAfter) {
  if (!Array.isArray(meths)) {
    meths = [meths];
  }

  meths.forEach(function(methodName) {
    var existing = target[methodName];
    if (!existing) return;

    var newFunc = function() {
      var ret = existing.apply(this, arguments);
      return hookAfter(this, methodName, arguments, context, ret);
    };
    newFunc.prototype = existing.prototype;

    target[methodName] = newFunc;
  });
};