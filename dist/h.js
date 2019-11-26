"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function isVNode(type) {
    return type != null && '_vnode' in type;
}
exports.isVNode = isVNode;
function h(type, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    var copy = props ? __assign({}, props) : utils_1.EMPTY_OBJECT;
    copy.children = children;
    return {
        type: type,
        props: copy,
    };
}
exports.h = h;
