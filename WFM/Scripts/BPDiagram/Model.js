"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var guid_typescript_1 = require("guid-typescript");
var BPNodeType;
(function (BPNodeType) {
    BPNodeType[BPNodeType["Start"] = 0] = "Start";
    BPNodeType[BPNodeType["Event"] = 1] = "Event";
    BPNodeType[BPNodeType["Action"] = 2] = "Action";
    BPNodeType[BPNodeType["End"] = 3] = "End";
})(BPNodeType = exports.BPNodeType || (exports.BPNodeType = {}));
;
var BPNode = /** @class */ (function () {
    function BPNode(type, name, id, x, y) {
        this.id = id || guid_typescript_1.Guid.create();
        this.x = x || 0;
        this.y = y || 0;
        this.name = name;
        this.type = type;
    }
    return BPNode;
}());
exports.BPNode = BPNode;
;
var BPEdge = /** @class */ (function () {
    function BPEdge() {
    }
    return BPEdge;
}());
exports.BPEdge = BPEdge;
var BPGraph = /** @class */ (function () {
    function BPGraph() {
        this.nodes = [
            new BPNode(BPNodeType.Start, "start"),
            new BPNode(BPNodeType.End, "end")
        ];
        this.edges = [];
    }
    return BPGraph;
}());
exports.BPGraph = BPGraph;
//# sourceMappingURL=model.js.map