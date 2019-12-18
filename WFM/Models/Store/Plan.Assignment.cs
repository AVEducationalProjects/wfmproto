using MongoDB.Bson;
using System;

namespace WFM.Models.Store
{
    public partial class Plan
    {
        public class Assignment
        {
            public ObjectId Id { get; set; }

            public ObjectId ResourceId { get; set; }

            public BusinessProcessState.ActionToDo Task { get; set; }

            public DateTime Start { get; set; }
            
            public DateTime End { get; set; }

        }
    }
}
