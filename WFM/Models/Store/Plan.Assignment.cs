using MongoDB.Bson;

namespace WFM.Models.Store
{
    public partial class Plan
    {
        public class Assignment
        {
            public ObjectId Id { get; set; }

            public ObjectId ResourceId { get; set; }

            public BusinessProcessState.ActionToDo Task { get; set; }
        }
    }
}
