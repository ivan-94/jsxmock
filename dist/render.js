"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var h_1 = require("./h");
function render(vnode) {
    var _a;
    if (typeof vnode.type !== 'string') {
        // custom component
        var rtn = vnode.type(vnode.props);
        if (h_1.isVNode(rtn)) {
            return render(rtn);
        }
        return rtn;
    }
    // host component
    return {
        type: vnode.type,
        props: vnode.props,
        children: (_a = vnode.props.children) === null || _a === void 0 ? void 0 : _a.map(function (node) {
            if (h_1.isVNode(node)) {
                return render(node);
            }
            return node;
        }),
    };
}
exports.render = render;
