using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using WFM.Models.Store;
using WFM.Repositaries;
using WFM.Extensions;

namespace WFM.Controllers
{
    public class PlaningController : Controller
    {
        private readonly ILogger<PlaningController> _logger;
        private readonly IPlanRepositary _planRepositary;
        private readonly IResourceRepositary _resourcesRepositary;
        private readonly IEmulatorStateRepositary _emulatorRepositary;

        public PlaningController(ILogger<PlaningController> logger,
            IPlanRepositary planRepositary,
            IResourceRepositary resourceRepositary,
            IEmulatorStateRepositary emulatorStateRepositary)
        {
            _logger = logger;
            _planRepositary = planRepositary;
            _resourcesRepositary = resourceRepositary;
            _emulatorRepositary = emulatorStateRepositary;
        }

        public async Task<IActionResult> Index()
        {
            var plan = await _planRepositary.Get();
            return View(plan);
        }

        public async Task<IActionResult> Plan()
        {
            Plan plan = await RecalcPlan();

            await _planRepositary.Save(plan);

            return RedirectToAction("Index");
        }

        private async Task<Plan> RecalcPlan()
        {
            var plan = new Plan();
            plan.Resources = await _resourcesRepositary.List();
            var tasks = (await _emulatorRepositary.List()).SelectMany(x => x.GetActionsToDo()).ToList();
            var taskToResource = GetResourcesAvailableForTasks(tasks, plan.Resources);

            foreach (var task in tasks.OrderBy(x => x.Estimated))
            {
                var resource = plan.GetLeastBusyResource(taskToResource[task]);
                if (resource == null)
                    plan.NotAssignedTasks.Add(task);
                else
                {
                    (DateTime start, DateTime end) = plan.GetAvailableDateTime(resource).GetWorkWindows((int)(task.Duration * 60));
                    plan.Assignments.Add(new Plan.Assignment
                    {
                        Id = ObjectId.GenerateNewId(),
                        ResourceId = resource.Id,
                        Task = task,
                        Start = start,
                        End = end
                    });
                }
            }

            return plan;
        }

        private IDictionary<BusinessProcessState.ActionToDo, IList<Resource>> GetResourcesAvailableForTasks(
            IList<BusinessProcessState.ActionToDo> tasks,
            IList<Resource> resources)
        {
            var result = new Dictionary<BusinessProcessState.ActionToDo, IList<Resource>>();
            foreach (var task in tasks)
            {
                var availableResources = new List<Resource>();
                var taskSkillRequirements = task.Skills?.Split(Environment.NewLine).Select(x => x.Trim()).ToHashSet();

                foreach (var resource in resources)
                {
                    var skills = resource.Skills?.Split(Environment.NewLine).Select(x => x.Trim()).ToHashSet();
                    if ((skills == null && taskSkillRequirements == null) ||
                        (skills != null && taskSkillRequirements == null) ||
                        (skills != null && skills.IsSupersetOf(taskSkillRequirements ?? new HashSet<string>())))
                        availableResources.Add(resource);
                }

                result[task] = availableResources;
            }

            return result;
        }
    }
}