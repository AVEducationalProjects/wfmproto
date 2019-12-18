using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WFM.Models.Store
{
    public partial class Plan
    {
        public Plan()
        {
            Resources = new List<Resource>();
            Assignments = new List<Assignment>();
            NotAssignedTasks = new List<BusinessProcessState.ActionToDo>();
        }

        public IList<Resource> Resources { get; set; }
        public IList<Assignment> Assignments { get; set; }
        public IList<BusinessProcessState.ActionToDo> NotAssignedTasks { get; set; }

        public IList<BusinessProcessState.ActionToDo> this[ObjectId index]
        {
            get 
            {
                return Assignments.Where(x => x.ResourceId == index).Select(x => x.Task).OrderBy(x=>x.Estimated).ToList();
            }
        }

        public Resource GetLeastBusyResource(IList<Resource> resourcelist)
        {
            return resourcelist.OrderBy(x => GetAvailableDateTime(x)).FirstOrDefault();
        }

        public DateTime GetAvailableDateTime(Resource resource)
        {
            var assigment = Assignments
                .Where(x => x.ResourceId == resource.Id)
                .OrderBy(x => x.End)
                .LastOrDefault();

            return assigment?.End ?? DateTime.Now;
        }
    }
}
