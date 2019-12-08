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
    function BPNode(type, name, x, y, id) {
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
    function BPEdge(source, target) {
        this.source = source;
        this.target = target;
    }
    return BPEdge;
}());
exports.BPEdge = BPEdge;
var BPGraph = /** @class */ (function () {
    function BPGraph(width, height) {
        var startx = (width || 800) / 2;
        var starty = 50;
        var endx = startx;
        var endy = (height || 400) - 45;
        this.nodes = [
            new BPNode(BPNodeType.Start, "start", startx, starty),
            new BPNode(BPNodeType.End, "end", endx, endy)
        ];
        this.edges = [];
    }
    BPGraph.prototype.deleteEdge = function (edge) {
        var idx = this.edges.indexOf(edge);
        this.edges.splice(idx, 1);
    };
    BPGraph.prototype.deleteNode = function (node) {
        var idx = this.nodes.indexOf(node);
        this.nodes.splice(idx, 1);
        var graph = this;
        this.edges.filter(function (e) { return e.source == node || e.target == node; })
            .forEach(function (e) { return graph.deleteEdge(e); });
    };
    return BPGraph;
}());
exports.BPGraph = BPGraph;
//# sourceMappingURL=model.js.map