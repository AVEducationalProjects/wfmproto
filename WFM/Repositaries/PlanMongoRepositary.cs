using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Threading.Tasks;
using WFM.Models.Store;
using WFM.Options;

namespace WFM.Repositaries
{
    public class PlanMongoRepositary : IPlanRepositary
    {
        private IMongoCollection<Plan.Assignment> PlanAssignments { get; }
        private IMongoCollection<BusinessProcessState.ActionToDo> PlanNotAssignedTasks { get; }
        private IMongoCollection<Resource> PlanResources { get; }

        public PlanMongoRepositary(IOptions<MongoOptions> mongoOptions)
        {
            var client = new MongoClient(mongoOptions.Value.Server);
            var database = client.GetDatabase(mongoOptions.Value.Database);

            PlanAssignments = database.GetCollection<Plan.Assignment>(mongoOptions.Value.PlanAssigmentsCollection);
            PlanNotAssignedTasks = database.GetCollection<BusinessProcessState.ActionToDo>(mongoOptions.Value.PlanNotAssignedTasksCollection);
            PlanResources = database.GetCollection<Resource>(mongoOptions.Value.PlanResourcesCollection);
        }

        public async Task<Plan> Get()
        {
            var plan = new Plan();
            plan.Resources = (await PlanResources.FindAsync(_ => true)).ToList();
            plan.Assignments = (await PlanAssignments.FindAsync(_ => true)).ToList();
            plan.NotAssignedTasks = (await PlanNotAssignedTasks.FindAsync(_ => true)).ToList();

            return plan;
        }

        public async Task Save(Plan plan)
        {
            await PlanResources.DeleteManyAsync(_ => true);
            await PlanAssignments.DeleteManyAsync(_ => true);
            await PlanNotAssignedTasks.DeleteManyAsync(_ => true);

            if (plan.Resources.Count > 0)
                await PlanResources.InsertManyAsync(plan.Resources);
            if (plan.Assignments.Count > 0)
                await PlanAssignments.InsertManyAsync(plan.Assignments);
            if (plan.NotAssignedTasks.Count > 0)
                await PlanNotAssignedTasks.InsertManyAsync(plan.NotAssignedTasks);
        }
    }
}
