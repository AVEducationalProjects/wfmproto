import * as d3 from 'd3';
import { BPGraph, BPEdge, BPNode, BPNodeType } from './model';

const color = d3.rgb(60, 60, 60);

enum BPDiagramComponentState { View, AddAction, AddEvent, AddEdge }

class BPDiagramComponent {

    private state: BPDiagramComponentState;

    private graph: BPGraph;

    private selectedEdge: BPEdge;
    private selectedNode: BPNode;

    constructor(selector: string) {
        this.state = BPDiagramComponentState.View;
        this.createControls(selector);

        this.selectedEdge = null;
        this.selectedNode = null;
        this.graph = new BPGraph(this.width, this.height);

        this.update();
    }

    private svg;
    private dragLine;

    private width: number;
    private height: number;

    private edgeFigures;
    private nodeFigures;

    /**
     * Creates diagram controls under DOM (via selector)
     * @param selector
     */
    private createControls(selector: string) {
        this.svg = d3.select(selector);

        this.svg.append('svg:defs').append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 6)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#000');

        let svgRect = this.svg.node().getBoundingClientRect();
        this.width = svgRect.width;
        this.height = svgRect.height;

        this.edgeFigures = this.svg.append('svg:g').selectAll('path');
        this.nodeFigures = this.svg.append('svg:g').selectAll('g');

        this.dragLine = this.svg.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');

        this.createToolPanel();

        this.svg
            .on('contextmenu', () => { d3.event.preventDefault(); })
            .on('mousedown', this.svgMouseDown())
            .on('mousemove', this.svgMouseMove());
    }

    private createToolPanel() {
        let diagram = this;

        let panel = this.svg.append("foreignObject")
            .attr('x', (this.width - 400) / 2)
            .attr('y', 0)
            .attr('width', 400)
            .attr('height', 60)
            .append("xhtml:div");

        panel.append("button")
            .text('Просмотр')
            .on('click', () => {
                diagram.state = BPDiagramComponentState.View;
            });

        panel.append("button")
            .text('Действие')
            .on('click', () => {
                diagram.state = BPDiagramComponentState.AddAction;
            });

        panel.append("button")
            .text('Событие')
            .on('click', () => {
                diagram.state = BPDiagramComponentState.AddEvent;
            });

        panel.append("button")
            .text('Связь')
            .on('click', () => {
                diagram.state = BPDiagramComponentState.AddEdge;
            });
    }

    /**
     * Update graph (called when needed)
     */
    private update() {
        let diagram = this;

        // update existing edges
        diagram.edgeFigures = diagram.edgeFigures.data(diagram.graph.edges);
        diagram.edgeFigures.classed('selected', (d: BPEdge) => d === diagram.selectedEdge)
            .style('marker-end', 'url(#end-arrow)')
            .attr('d', (d: BPEdge) => {
                const deltaX = d.target.x - d.source.x;
                const deltaY = d.target.y - d.source.y;
                const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const normX = deltaX / dist;
                const normY = deltaY / dist;
                const padding = 25;
                const sourceX = d.source.x + (padding * normX);
                const sourceY = d.source.y + (padding * normY);
                const targetX = d.target.x - (padding * normX);
                const targetY = d.target.y - (padding * normY);

                return `M${sourceX},${sourceY}L${targetX},${targetY}`;
            });

        // remove old edges
        diagram.edgeFigures.exit().remove();

        // add new edges
        diagram.edgeFigures = diagram.edgeFigures.enter().append('svg:path')
            .attr('class', 'link')
            .classed('selected', (d) => d === diagram.selectedEdge)
            .style('marker-end', 'url(#end-arrow)')
            .attr('d', (d: BPEdge) => {
                const deltaX = d.target.x - d.source.x;
                const deltaY = d.target.y - d.source.y;
                const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const normX = deltaX / dist;
                const normY = deltaY / dist;
                const padding = 25;
                const sourceX = d.source.x + (padding * normX);
                const sourceY = d.source.y + (padding * normY);
                const targetX = d.target.x - (padding * normX);
                const targetY = d.target.y - (padding * normY);

                return `M${sourceX},${sourceY}L${targetX},${targetY}`;
            })
            .on('mousedown', (d) => {
                diagram.selectedEdge = (d === diagram.selectedEdge) ? null : d;
                diagram.update();
            })
            .merge(diagram.edgeFigures);

        // node group
        diagram.nodeFigures = diagram.nodeFigures.data(diagram.graph.nodes, (d) => d.id);

        // update existing nodes 
        diagram.nodeFigures
            .attr("transform", (d: BPNode) => "translate(" + [d.x, d.y] + ")")
            .select('circle')
            .style('fill', (d: BPNode) => (d === this.selectedNode) ? color.brighter().toString() : color);

        // remove old nodes
        diagram.nodeFigures.exit().remove();

        // add new nodes
        const g = diagram.nodeFigures.enter().append('svg:g')
            .attr("class", 'nodectl')
            .attr("transform", (d: BPNode) => "translate(" + [d.x, d.y] + ")")
            .call(d3.drag()
                .on("start", (d: BPNode) => {
                    if (!(d instanceof BPNode)) return;

                    if (diagram.state != BPDiagramComponentState.AddEdge &&
                        diagram.state != BPDiagramComponentState.View) return;

                    diagram.selectedNode = d;

                    if (diagram.state == BPDiagramComponentState.AddEdge) {
                        diagram.dragLine
                            .style('marker-end', 'url(#end-arrow)')
                            .classed('hidden', false)
                            .attr('d', `M${d.x},${d.y}L${d.x},${d.y}`);
                    }

                    diagram.update();
                })
                .on("drag", (d: BPNode) => {
                    if (diagram.state == BPDiagramComponentState.View && d instanceof BPNode) {
                        d.x = d3.event.x;
                        d.y = d3.event.y;

                        diagram.update();
                    } else if (diagram.state == BPDiagramComponentState.AddEdge && diagram.selectedNode != null) {
                        let coords = d3.mouse(diagram.svg.node());
                        diagram.dragLine.attr('d', `M${diagram.selectedNode.x},${diagram.selectedNode.y}L${coords[0]},${coords[1]}`);
                    }
                })
                .on("end", (d: BPNode) => {
                    if (diagram.state != BPDiagramComponentState.AddEdge) return;

                    let endNode: BPNode = null;
                    let endNodes: unknown[] = d3.select(document.elementFromPoint(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY)).data();
                    if (endNodes.length > 0 && endNodes[0] instanceof BPNode)
                        endNode = endNodes[0] as BPNode;

                    if (diagram.selectedNode != null && endNode != null && endNode != diagram.selectedNode)
                        diagram.graph.edges.push(new BPEdge(diagram.selectedNode, endNode));

                    diagram.dragLine
                        .classed('hidden', true)
                        .style('marker-end', '');

                    diagram.state = BPDiagramComponentState.View;

                    diagram.update();
                })
            );

        this.createStartNodes(g.filter(d => d.type == BPNodeType.Start));
        this.createEndNodes(g.filter(d => d.type == BPNodeType.End));
        this.createActionNodes(g.filter(d => d.type == BPNodeType.Action));
        this.createEventNodes(g.filter(d => d.type == BPNodeType.Event));

        diagram.nodeFigures = g.merge(this.nodeFigures);
    }

    /**
     * Create action node
     * @param g
     */
    private createActionNodes(g) {
        g.append("svg:rect")
            .attr("height", 30)
            .attr("width", 80)
            .attr("rx", 10)
            .attr("ry", 10)
            .style('fill', d3.rgb(255, 255, 255))
            .style('stroke', () => color.darker().toString());

        g.append('svg:text')
            .attr('x', 5)
            .attr('y', 20)
            .text((d) => d.name);
    }

    /**
     * Create event node
     * @param g
     */
    private createEventNodes(g) {
        g.append("svg:rect")
            .attr("height", 30)
            .attr("width", 80)
            .attr("rx", 10)
            .attr("ry", 10)
            .style('fill', d3.rgb(255, 255, 255))
            .style('stroke', () => color.darker().toString());

        g.append('svg:text')
            .attr('x', 5)
            .attr('y', 20)
            .text((d) => d.name);
    }

    /**
     * Create start node
     * @param g
     */
    private createStartNodes(g) {
        g.append('svg:circle')
            .attr('class', 'node')
            .attr('r', 12)
            .style('fill', (d: BPNode) => (d === this.selectedNode) ? color.brighter().toString() : color)
            .style('stroke', () => color.darker().toString());
    }

    /**
     * Create end node
     * @param g
     */
    private createEndNodes(g) {
        g.append('svg:circle')
            .attr('class', 'node')
            .attr('r', 16)
            .style('fill', d3.rgb(255, 255, 255))
            .style('stroke', () => color.darker().toString());

        g.append('svg:circle')
            .attr('class', 'node')
            .attr('r', 12)
            .style('fill', (d: BPNode) => (d === this.selectedNode) ? color.brighter().toString() : color)
            .style('stroke', () => color.darker().toString());
    }

    private svgMouseDown() {
        let diagram = this;
        return function () {
            let coords = d3.mouse(this);

            switch (diagram.state) {
                case BPDiagramComponentState.AddAction:
                    diagram.graph.nodes.push(new BPNode(BPNodeType.Action, "Новое действие", coords[0], coords[1]));
                    diagram.state = BPDiagramComponentState.View;
                    break;
                case BPDiagramComponentState.AddEvent:
                    diagram.graph.nodes.push(new BPNode(BPNodeType.Event, "Новое событие", coords[0], coords[1]));
                    diagram.state = BPDiagramComponentState.View;
                    break;
            }

            diagram.update();
        }
    }

    private svgMouseMove() {
        let diagram = this;
        return function () {
            if (diagram.state != BPDiagramComponentState.AddEdge || diagram.selectedNode == null) return;


        }
    }
}

export default function BPDiagram(selector: string): BPDiagramComponent {
    return new BPDiagramComponent(selector);
}