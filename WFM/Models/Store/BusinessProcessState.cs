using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;

namespace WFM.Models.Store
{
    public partial class BusinessProcessState
    {
        public BusinessProcessState() { }

        public BusinessProcessState(string name, BusinessProcess businessProcess)
        {

            Id = ObjectId.GenerateNewId();
            Name = name;
            Diagram = businessProcess.Diagram;
            IsCompleted = false;

            var statNode = Diagram.Nodes.Single(x => x.Type == BusinessProcess.NodeType.Start);
            CompletedStages = new List<CompleteRecord> {
                new CompleteRecord
                {
                    Id = statNode.Id,
                    Resolution = statNode.Transitions.FirstOrDefault()?.Resolution,
                    DateTime = DateTime.Now
                }
            };
        }

        public ObjectId Id { get; set; }

        public string Name { get; set; }

        public List<CompleteRecord> CompletedStages { get; set; }

        public BusinessProcess.Graph Diagram { get; set; }

        public bool IsCompleted { get; set; }

        private IEnumerable<(BusinessProcess.Transition Transition, CompleteRecord CompleteRecord)> GetTransitionFrontier()
        {
            var completed = Diagram.Nodes.Where(x => CompletedStages.Any(rec => rec.Id == x.Id));
            return completed.Select(
                cn => new
                {
                    TransitionRecords = cn.Transitions
                        .Where(t => !CompletedStages.Any(rec => rec.Id == t.Id))
                        .Select(t => (Transition: t, CompleteRecord: CompletedStages.Single(rec => rec.Id == cn.Id)))
                })
                .SelectMany(x => x.TransitionRecords)
                .Where(x => x.Transition.Resolution == x.CompleteRecord.Resolution);
        }

        public IList<ExpectedEvent> GetExpectedEvents()
        {
            var transitionFrontier = GetTransitionFrontier();

            var nodes = transitionFrontier
                .Select(x => (x.Transition, x.CompleteRecord, Node: Diagram.Nodes.Single(n => n.Id == x.Transition.Id)));

            var expectedEvents = nodes
                .Where(x => x.Node.Type == BusinessProcess.NodeType.Event)
                .Select(x => new ExpectedEvent
                {
                    Id = x.Node.Id,
                    Estimated = x.CompleteRecord.DateTime.AddMinutes((int)(x.Node.Duration * 60m)),
                    Name = x.Node.Name,
                    Resolutions = x.Node.Transitions.Select(x=>x.Resolution??"").Distinct().ToList()
                });

            return expectedEvents.ToList();
        }

        public IList<ActionToDo> GetActionsToDo()
        {
            var transitionFrontier = GetTransitionFrontier();

            var nodes = transitionFrontier
                .Select(x => (x.Transition, x.CompleteRecord, Node: Diagram.Nodes.Single(n => n.Id == x.Transition.Id)));

            var expectedActions = nodes
                .Where(x => x.Node.Type == BusinessProcess.NodeType.Action)
                .Select(x => new ActionToDo
                {
                    Id = x.Node.Id,
                    Estimated = x.CompleteRecord.DateTime.AddMinutes((int)(x.Node.Duration * 60m)),
                    Name = x.Node.Name,
                    Resolutions = x.Node.Transitions.Select(x=>x.Resolution??"").Distinct().ToList()
                });

            return expectedActions.ToList();
        }

        public void CompleteStage(Guid nodeId, string resolution)
        {
            var eventNode = Diagram.Nodes.Single(x => x.Id == nodeId);
            CompletedStages.Add(new CompleteRecord { Id = nodeId, DateTime = DateTime.Now, Resolution = resolution });
            CheckIfProcessComplete();
        }

        private void CheckIfProcessComplete()
        {
            if(!GetExpectedEvents().Any() && !GetActionsToDo().Any())
            {
                CompleteProcess();
            }
        }

        public void CompleteProcess()
        {
                CompletedStages.Add(
                    new CompleteRecord { 
                        Id = Diagram.Nodes.Single(x => x.Type == BusinessProcess.NodeType.End).Id, 
                        DateTime = DateTime.Now, 
                        Resolution = "" });

                IsCompleted = true;
        }
    }
}
