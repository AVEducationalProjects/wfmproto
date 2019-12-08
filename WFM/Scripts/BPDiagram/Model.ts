import { Guid } from "guid-typescript";
export enum BPNodeType { Start, Event, Action, End };

export class BPNode {
    public id: Guid;
    public name: string;
    public type: BPNodeType;
    public duration: number;
    public skills: string;
    public x: number;
    public y: number;

    constructor(type: BPNodeType, name: string, duration?: number, skills?: string, x?: number, y?: number, id?: Guid) {
        this.id = id || Guid.create();
        this.x = x || 0;
        this.y = y || 0;

        this.name = name;
        this.duration = duration;
        this.type = type;
    }
};

export class BPEdge {
    public source: BPNode;
    public target: BPNode;
    public resolution: string;

    constructor(source?: BPNode, target?: BPNode, resolution?: string) {
        this.source = source;
        this.target = target;
        this.resolution = resolution;
    }
}

export class BPGraph {
    public nodes: BPNode[];
    public edges: BPEdge[];

    constructor(width?: number, height?: number) {

        let startx = (width || 800) / 2;
        let starty = 50;
        let endx = startx;
        let endy = (height || 400) - 45;

        this.nodes = [
            new BPNode(BPNodeType.Start, "start", null, null, startx, starty),
            new BPNode(BPNodeType.End, "end", null, null, endx, endy)
        ];
        this.edges = [];
    }

    public deleteEdge(edge: BPEdge) {
        let idx = this.edges.indexOf(edge);
        this.edges.splice(idx, 1);
    }

    public deleteNode(node: BPNode) {
        let idx = this.nodes.indexOf(node);
        this.nodes.splice(idx, 1);

        let graph = this;
        this.edges.filter((e: BPEdge) => e.source == node || e.target == node)
            .forEach((e: BPEdge) => graph.deleteEdge(e))
    }
}