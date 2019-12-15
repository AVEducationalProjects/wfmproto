using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using WFM.Models.Store;
using WFM.Repositaries;

namespace WFM.Controllers
{
    public class EmulatorController : Controller
    {
        private readonly ILogger<EmulatorController> _logger;
        private readonly IEmulatorStateRepositary _emulatorStateRepositary;
        private readonly IBusinessProcessRepositary _businessProcessRepositary;

        public EmulatorController(
            ILogger<EmulatorController> logger,
            IEmulatorStateRepositary emulatorStateRepositary,
            IBusinessProcessRepositary businessProcessRepositary)
        {
            _logger = logger;
            _emulatorStateRepositary = emulatorStateRepositary;
            _businessProcessRepositary = businessProcessRepositary;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var businessProcessState = await _emulatorStateRepositary.List();
            return View(businessProcessState);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            ViewBag.BusinessProcesses = new SelectList(await _businessProcessRepositary.List(), "Id", "Name");
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm]string id, [FromForm] string name)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentNullException(nameof(id));

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentNullException(nameof(name));

            var bp = await _businessProcessRepositary.GetById(new ObjectId(id));
            var bps = new BusinessProcessState(name, bp);
            await _emulatorStateRepositary.Save(bps);
            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> Complete([FromForm] string businessProcessStateId, [FromForm]string nodeId, [FromForm] string resolution)
        {
            if (string.IsNullOrWhiteSpace(businessProcessStateId))
                throw new ArgumentNullException(nameof(businessProcessStateId));
            if (string.IsNullOrWhiteSpace(nodeId))
                throw new ArgumentNullException(nameof(nodeId));

            var bps = await _emulatorStateRepositary.GetById(new ObjectId(businessProcessStateId));
            bps.Complete(Guid.Parse(nodeId), resolution);
            await _emulatorStateRepositary.Save(bps);

            return RedirectToAction("Index");
        }
    }
}