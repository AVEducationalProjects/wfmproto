import { Guid } from "guid-typescript";
export enum BPNodeType { Start, Event, Action, End };

export class BPNode {
    public id: Guid;
    public name: string;
    public type: BPNodeType;
    public x: number;
    public y: number;

    constructor(type: BPNodeType, name: string, id?: Guid, x?: number, y?: number) {
        this.id = id || Guid.create();
        this.x = x || 0;
        this.y = y || 0;

        this.name = name;
        this.type = type;
    }
};

export class BPEdge {
    public source: BPNode;
    public target: BPNode;
}

export class BPGraph {
    public nodes: BPNode[];
    public edges: BPEdge[];

    constructor() {
        this.nodes = [
            new BPNode(BPNodeType.Start, "start"),
            new BPNode(BPNodeType.End, "end")
        ];
        this.edges = [];
    }
}