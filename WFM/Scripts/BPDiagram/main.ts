import * as d3 from 'd3';
import { BPGraph, BPEdge, BPNode, BPNodeType } from './model';

const color = d3.rgb(60, 60, 60);

class BPDiagramComponent {

    private graph: BPGraph;

    private selectedEdge: BPEdge;
    private selectedNode: BPNode;

    constructor(selector: string) {
        this.selectedEdge = null;
        this.selectedNode = null;
        this.graph = new BPGraph();

        this.createControls(selector);

        this.update();
    }

    private svg;
    private edgeFigures;
    private nodeFigures;

    /**
     * Creates diagram controls under DOM (via selector)
     * @param selector
     */
    private createControls(selector: string) {
        this.svg = d3.select(selector)
            .on('contextmenu', () => { d3.event.preventDefault(); });

        this.edgeFigures = this.svg.append('svg:g').selectAll('path');
        this.nodeFigures = this.svg.append('svg:g').selectAll('g');
    }

    /**
     * Update graph (called when needed)
     */
    private update() {
        let diagram = this;

        // update existing edges
        diagram.edgeFigures = diagram.edgeFigures.data(diagram.graph.edges);
        diagram.edgeFigures.classed('selected', (d) => d === diagram.selectedEdge)
            .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
            .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '');

        // remove old edges
        diagram.edgeFigures.exit().remove();

        // add new edges
        diagram.edgeFigures = diagram.edgeFigures.enter().append('svg:path')
            .attr('class', 'link')
            .classed('selected', (d) => d === diagram.selectedEdge)
            .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
            .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '')
            .on('mousedown', (d) => {
                // select edge
                diagram.selectedEdge = (d === diagram.selectedEdge) ? null : d;
                diagram.selectedNode = null;
                diagram.update();
            })
            .merge(diagram.edgeFigures);

        // node group
        // NB: the function arg is crucial here! nodes are known by id, not by index!
        diagram.nodeFigures = diagram.nodeFigures.data(diagram.graph.nodes, (d) => d.id);

        // update existing nodes (reflexive & selected visual states)
        diagram.nodeFigures.selectAll('g.nodectl')
            .attr("x", (d: BPNode) => d.x)
            .attr("y", (d: BPNode) => d.y)
            .select('circle')
            .style('fill', (d: BPNode) => (d === this.selectedNode) ? color.brighter().toString() : color);

        // remove old nodes
        diagram.nodeFigures.exit().remove();

        // add new nodes
        const g = diagram.nodeFigures.enter().append('svg:g')
            .attr("class", 'nodectl')
            .attr("transform", (d: BPNode) => "translate(" + [d.x, d.y] + ")")
            .call(d3.drag()
                .on("drag", (d: BPNode) => {
                    d.x = d3.event.x;
                    d.y = d3.event.y;
                    diagram.update();
                })
            );

        g.filter(d => d.type == BPNodeType.Start).append('svg:circle')
            .attr('class', 'node')
            .attr('r', 12)
            .style('fill', (d: BPNode) => (d === this.selectedNode) ? color.brighter().toString() : color)
            .style('stroke', () => color.darker().toString());

        g.filter(d => d.type == BPNodeType.End).append('svg:circle')
            .attr('class', 'node')
            .attr('r', 16)
            .style('fill', d3.rgb(255, 255, 255))
            .style('stroke', () => color.darker().toString());
        g.filter(d => d.type == BPNodeType.End)
            .append('svg:circle')
            .attr('class', 'node')
            .attr('r', 12)
            .style('fill', (d: BPNode) => (d === this.selectedNode) ? color.brighter().toString() : color)
            .style('stroke', () => color.darker().toString());

            


        //// show node IDs
        //g.append('svg:text')
        //    .attr('x', 0)
        //    .attr('y', 4)
        //    .attr('class', 'id')
        //    .text((d) => d.id);

        diagram.edgeFigures = g.merge(this.edgeFigures);
    }
}


export default function BPDiagram(selector: string): BPDiagramComponent {
    return new BPDiagramComponent(selector);
}