import { Guid } from "guid-typescript";
export enum BPNodeType {
    Start = "Start",
    Event = "Event",
    Action = "Action",
    End = "End"
};

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

export interface GraphDTOItemTransition {
    id: string;
    resolution: string;
}

export interface GraphDTOItem {
    id: string;
    name: string;
    type: string;
    duration: number;
    skills: string;
    x: number;
    y: number;

    transitions: GraphDTOItemTransition[];
}

export interface GraphDTO {
    nodes: GraphDTOItem[];
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

    public exportData(): GraphDTO {
        let result: GraphDTO = { nodes: [] };

        for (var node of this.nodes) {
            let itemDTO: GraphDTOItem = {
                id: node.id.toString(),
                name: node.name,
                type: node.type.toString(),
                duration: node.duration,
                skills: node.skills,
                x: node.x,
                y: node.y,
                transitions: []
            };

            this.edges.filter(e => e.source == node).forEach(e => {
                let transition: GraphDTOItemTransition = {
                    id: e.target.id.toString(),
                    resolution: e.resolution
                };
                itemDTO.transitions.push(transition);
            })

            result.nodes.push(itemDTO);
        }

        return result;
    }

    public importData(data: GraphDTO) {
        let nodes = [];
        data.nodes.forEach(nodeDTO => {
            nodes.push(new BPNode(
                BPNodeType[nodeDTO.type],
                nodeDTO.name,
                nodeDTO.duration,
                nodeDTO.skills,
                nodeDTO.x,
                nodeDTO.y,
                Guid.parse(nodeDTO.id)));
        });

        let edges = [];
        data.nodes.forEach(nodeDTO => nodeDTO.transitions.forEach(transition => {
            let source: BPNode = nodes.find((n: BPNode) => n.id.equals(Guid.parse(nodeDTO.id)));
            let target: BPNode = nodes.find((n: BPNode) => n.id.equals(Guid.parse(transition.id)));
            edges.push(new BPEdge(
                source,
                target,
                transition.resolution));
        }));

        this.nodes = nodes;
        this.edges = edges;
    }
}