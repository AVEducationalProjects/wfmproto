import * as d3 from 'd3';
import { BPGraph, BPEdge, BPNode, BPNodeType, GraphDTO } from './model';

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

        this.createPropertiesPanel();
        this.createToolPanel();
        this.svg
            .attr("class", "col-md-9");

        // calculate editor size
        let svgRect = this.svg.node().getBoundingClientRect();
        this.width = svgRect.width;
        this.height = svgRect.height;

        this.createFigureDefinitions();
        this.createDragLine();

        this.edgeFigures = this.svg.append('svg:g').selectAll('path');
        this.nodeFigures = this.svg.append('svg:g').selectAll('g');

        let svg = this.svg.selectAll("g");
        this.svg
            .on('contextmenu', () => { d3.event.preventDefault(); })
            .on('mousedown', this.svgMouseDown())
            .call(d3.zoom().scaleExtent([0.1, 10])
                .on("zoom", function () {
                    svg.attr("transform", d3.event.transform);
                }));
    }

    /**
     * Create toolbar
     * */
    private createToolPanel() {
        let diagram = this;

        let panel = d3.select(this.svg.node().parentNode)
            .insert("div", ":first-child")
            .attr("class", "tools-panel col-md-12")
            .append("div")
            .attr("class", "btn-group")
            .attr("role", "group");

        panel.append("button")
            .attr("class", "btn btn-secondary")
            .text('Просмотр')
            .on('click', () => {
                diagram.state = BPDiagramComponentState.View;
                d3.event.preventDefault();
            });

        panel.append("button")
            .attr("class", "btn btn-secondary")
            .text('Действие')
            .on('click', () => {
                diagram.state = BPDiagramComponentState.AddAction;
                d3.event.preventDefault();
            });

        panel.append("button")
            .attr("class", "btn btn-secondary")
            .text('Событие')
            .on('click', () => {
                diagram.state = BPDiagramComponentState.AddEvent;
                d3.event.preventDefault();
            });

        panel.append("button")
            .attr("class", "btn btn-secondary")
            .text('Связь')
            .on('click', () => {
                diagram.state = BPDiagramComponentState.AddEdge;
                d3.event.preventDefault();
            });
    }

    /**
     * Creates properties pane
     * */
    private propertiesPanel;
    private createPropertiesPanel() {
        this.propertiesPanel = d3.select(this.svg.node().parentNode)
            .append("div")
            .attr("class", "col-md-3 properties-panel")
            .style("height", `${this.height}px`);
    }

    /**
     * Add definitions for reusable figures
     * */
    private createFigureDefinitions() {
        // arrow
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
    }

    /**
     * Create temporary path for edge creation
     * */
    private dragLine;
    private createDragLine() {
        this.dragLine = this.svg.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');
    }

    /**
     * Update graph (called when needed)
     */
    private update(updateProps: boolean = true) {
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
            .on('mousedown', (d: BPEdge) => {
                if (d != diagram.selectedEdge)
                    diagram.selectEdge(d);
                diagram.update();
            })
            .merge(diagram.edgeFigures);

        // node group
        diagram.nodeFigures = diagram.nodeFigures.data(diagram.graph.nodes, (d) => d.id);

        // update existing nodes 
        diagram.nodeFigures
            .attr("transform", (d: BPNode) => "translate(" + [d.x, d.y] + ")")
            .classed('selected', (d: BPNode) => d == this.selectedNode)
            .select("text")
            .text((d: BPNode) => d.name)
            .each(function (d) {
                let textWidth = this.getComputedTextLength();
                let text = d3.select(this);
                let rect = d3.select(this.parentNode).select("rect");
                text.attr("x", -textWidth / 2).attr("width", textWidth);
                rect.attr("x", -textWidth / 2 - 5).attr("width", textWidth + 10);
            })


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

                    diagram.selectNode(d);

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
                        d.x = Math.round(d3.event.x);
                        d.y = Math.round(d3.event.y);

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

        // update tools panel
        if (updateProps)
            this.updatePropertiesPanel();
    }

    private updatePropertiesPanel() {
        this.propertiesPanel.selectAll("*").remove();

        let form = this.propertiesPanel.append("form");

        let diagram = this;
        if (this.selectedEdge == null && this.selectedNode == null) {
            form.append("h5").text("Ничего не выбрано");
        }
        else if (this.selectedEdge != null) {
            let edge: BPEdge = this.selectedEdge;

            var formGroup = form.append("div")
                .attr("class", "form-group");

            formGroup.append("label")
                .attr("for", "nodeName")
                .text("Резолюция");

            formGroup.append("input")
                .attr("id", "nodeName")
                .attr("type", "text")
                .attr("value", edge.resolution)
                .attr("class", "form-control")
                .on("input", function () {
                    diagram.selectedEdge.resolution = this.value;
                    diagram.update(false);
                });

            form.append("hr");
            form.append("button")
                .attr("class", "btn btn-danger")
                .on("click", () => {
                    diagram.graph.deleteEdge(edge);
                    diagram.selectedEdge = null;
                    diagram.update();
                    d3.event.preventDefault();
                })
                .text("Удалить ребро");
        }
        else if (this.selectedNode != null) {
            let node: BPNode = this.selectedNode;

            if (node.type != BPNodeType.Start && node.type != BPNodeType.End) {

                var formGroup = form.append("div")
                    .attr("class", "form-group");

                formGroup.append("label")
                    .attr("for", "nodeName")
                    .text("Название");

                formGroup.append("input")
                    .attr("id", "nodeName")
                    .attr("type", "text")
                    .attr("value", node.name)
                    .attr("class", "form-control")
                    .on("input", function () {
                        diagram.selectedNode.name = this.value;
                        diagram.update(false);
                    });

                formGroup = form.append("div")
                    .attr("class", "form-group");

                formGroup.append("label")
                    .attr("for", "nodeDuration")
                    .text(node.type == BPNodeType.Action ? "Плановая трудоемкость" : "Ожидаемый срок");

                formGroup.append("input")
                    .attr("id", "nodeDuration")
                    .attr("type", "number")
                    .attr("min", "0.5")
                    .attr("step", "0.5")
                    .attr("value", node.duration)
                    .attr("class", "form-control")
                    .on("input", function () {
                        diagram.selectedNode.duration = this.value;
                    });

                if (node.type == BPNodeType.Action) {
                    formGroup = form.append("div")
                        .attr("class", "form-group");

                    formGroup.append("label")
                        .attr("for", "nodeSkills")
                        .text("Требуемые компетенции");

                    formGroup.append("textarea")
                        .attr("id", "nodeSkills")
                        .attr("rows", "3")
                        .attr("class", "form-control")
                        .on("input", function () {
                            diagram.selectedNode.skills = this.value;
                        })
                        .text(node.skills);
                }

                form.append("hr");
                form.append("button")
                    .attr("class", "btn btn-danger")
                    .on("click", () => {
                        diagram.graph.deleteNode(node);

                        diagram.selectedNode = null;
                        diagram.update();
                        d3.event.preventDefault();
                    })
                    .text("Удалить вершину");
            } else {
                form.append("h5")
                    .text("Этот узел нельзя изменить");
            }
        }
    }

    /**
     * Select node
     * @param node
     */
    private selectNode(node: BPNode) {
        this.selectedEdge = null;
        this.selectedNode = node;
    }

    /**
     * Select node
     * @param node
     */
    private selectEdge(edge: BPEdge) {
        this.selectedEdge = edge;
        this.selectedNode = null;
    }

    /**
     * Create action node
     * @param g
     */
    private createActionNodes(g) {
        g.classed("nodectl", true);
        g.classed("action-node", true);
        g.classed("selected", (d) => d == this.selectedNode);

        var textWidth = 0;
        g.append('svg:text')
            .text((d) => d.name)
            .each(function (d) {
                textWidth = this.getComputedTextLength();
            })
            .attr('x', -textWidth / 2)
            .attr('y', 5);

        g.insert("svg:rect", ":first-child")
            .attr("x", -textWidth / 2 - 5)
            .attr("y", -15)
            .attr("width", textWidth + 10)
            .attr("height", 30)
            .attr("rx", 10)
            .attr("ry", 10);
    }

    /**
     * Create event node
     * @param g
     */
    private createEventNodes(g) {
        g.classed("nodectl", true);
        g.classed("event-node", true);
        g.classed("selected", (d) => d == this.selectedNode);

        var textWidth = 0;
        g.append('svg:text')
            .text((d) => d.name)
            .each(function (d) {
                textWidth = this.getComputedTextLength();
            })
            .attr('x', -textWidth / 2)
            .attr('y', 5);

        g.insert("svg:rect", ":first-child")
            .attr("x", -textWidth / 2 - 5)
            .attr("y", -15)
            .attr("width", textWidth + 10)
            .attr("height", 30)
            .attr("rx", 10)
            .attr("ry", 10);
    }

    /**
     * Create start node
     * @param g
     */
    private createStartNodes(g) {
        g.classed("nodectl", true);
        g.classed("start-node", true);
        g.classed("selected", (d) => d == this.selectedNode);

        g.append('svg:circle')
            .attr('r', 12);
    }

    /**
     * Create end node
     * @param g
     */
    private createEndNodes(g) {
        g.classed("nodectl", true);
        g.classed("end-node", true);
        g.classed("selected", (d) => d == this.selectedNode);

        g.append('svg:circle')
            .attr('r', 12);

        g.append('svg:circle')
            .attr('r', 6);
    }

    private svgMouseDown() {
        let diagram = this;
        return function () {
            let coords = d3.mouse(this);

            switch (diagram.state) {
                case BPDiagramComponentState.AddAction:
                    diagram.graph.nodes.push(new BPNode(BPNodeType.Action, "Новое действие", 1, null, Math.round(coords[0]), Math.round(coords[1])));
                    diagram.state = BPDiagramComponentState.View;
                    break;
                case BPDiagramComponentState.AddEvent:
                    diagram.graph.nodes.push(new BPNode(BPNodeType.Event, "Новое событие", 0, null, Math.round(coords[0]), Math.round(coords[1])));
                    diagram.state = BPDiagramComponentState.View;
                    break;
            }

            diagram.update();
        }
    }

    public import(graphDTO: GraphDTO) {
        this.graph.importData(graphDTO);
        this.update();
    }

    public export(): GraphDTO {
        return this.graph.exportData();
    }
}

export default function BPDiagram(selector: string): BPDiagramComponent {
    return new BPDiagramComponent(selector);
}