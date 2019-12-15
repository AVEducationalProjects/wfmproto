using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using WFM.Models.Store;

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

            var statNode = Diagram.Nodes.Single(x => x.Type == BusinessProcess.NodeType.Start);
            Completed = new List<CompleteRecord> {
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

        public List<CompleteRecord> Completed { get; set; }

        public BusinessProcess.Graph Diagram { get; set; }

        private IEnumerable<(BusinessProcess.Transition Transition, CompleteRecord CompleteRecord)> GetTransitionFrontiee()
        {
            var completed = Diagram.Nodes.Where(x => Completed.Any(rec => rec.Id == x.Id));
            return completed.Select(
                cn => new
                {
                    TransitionRecords = cn.Transitions
                        .Where(t => !Completed.Any(rec => rec.Id == t.Id))
                        .Select(t => (Transition: t, CompleteRecord: Completed.Single(rec => rec.Id == cn.Id)))
                })
                .SelectMany(x => x.TransitionRecords)
                .Where(x => x.Transition.Resolution == x.CompleteRecord.Resolution);
        }

        public IList<ExpectedEvent> GetExpectedEvents()
        {
            var transitionFrontier = GetTransitionFrontiee();

            var nodes = transitionFrontier
                .Select(x => (x.Transition, x.CompleteRecord, Node: Diagram.Nodes.Single(n => n.Id == x.Transition.Id)));

            var expectedEvents = nodes
                .Where(x => x.Node.Type == BusinessProcess.NodeType.Event)
                .Select(x => new ExpectedEvent
                {
                    Id = x.Node.Id,
                    Estimated = x.CompleteRecord.DateTime.AddMinutes((int)(x.Node.Duration * 60m)),
                    Name = x.Node.Name
                });

            return expectedEvents.ToList();
        }


        public IList<ActionToDo> GetActionsToDo()
        {
            var transitionFrontier = GetTransitionFrontiee();

            var nodes = transitionFrontier
                .Select(x => (x.Transition, x.CompleteRecord, Node: Diagram.Nodes.Single(n => n.Id == x.Transition.Id)));

            var expectedActions = nodes
                .Where(x => x.Node.Type == BusinessProcess.NodeType.Action)
                .Select(x => new ActionToDo
                {
                    Id = x.Node.Id,
                    Estimated = x.CompleteRecord.DateTime.AddMinutes((int)(x.Node.Duration * 60m)),
                    Name = x.Node.Name
                });

            return expectedActions.ToList();
        }
    }
}
