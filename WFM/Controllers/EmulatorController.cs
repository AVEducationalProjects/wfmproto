using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WFM.Repositaries;

namespace WFM.Controllers
{
    public class EmulatorController : Controller
    {
        private readonly ILogger<EmulatorController> _logger;
        private readonly IEmulatorStateRepositary _emulatorStateRepositary;

        public EmulatorController(
            ILogger<EmulatorController> logger,
            IEmulatorStateRepositary emulatorStateRepositary)
        {
            _logger = logger;
            _emulatorStateRepositary = emulatorStateRepositary;
        }

        public async Task<IActionResult> Index()
        {
            return View();
        }
    }
}