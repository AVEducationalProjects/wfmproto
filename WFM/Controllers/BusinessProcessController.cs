using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using WFM.Models;
using WFM.Models.DTO;
using WFM.Repositaries;

namespace WFM.Controllers
{
    public class BusinessProcessController : Controller
    {
        private readonly ILogger<BusinessProcessController> _logger;
        private readonly IBusinessProcessRepositary _businessProcessRepositary;

        public BusinessProcessController(
            ILogger<BusinessProcessController> logger,
            IBusinessProcessRepositary businessProcessRepositary)
        {
            _logger = logger;
            _businessProcessRepositary = businessProcessRepositary;
        }

        public async Task<IActionResult> Index()
        {
            return View(await _businessProcessRepositary.List());
        }

        [HttpGet]
        public IActionResult Create(int id)
        {
            return View(new BusinessProcess
            {
                Id = ObjectId.GenerateNewId(),
                Name = "Диаграмма бизнес-процесса",
                Diagram = new BusinessProcess.Graph
                {
                    Nodes = new List<BusinessProcess.Node>
                    {
                        new BusinessProcess.Node
                        {
                            Id=Guid.NewGuid(),
                            Type=BusinessProcess.NodeType.Start,
                            Name="start",
                            Duration =0,
                            Transitions = new List<BusinessProcess.Transition>(),
                            X = 400,
                            Y = 30
                        },
                        new BusinessProcess.Node
                        {
                            Id=Guid.NewGuid(),
                            Type=BusinessProcess.NodeType.End,
                            Name="end",
                            Duration =0,
                            Transitions = new List<BusinessProcess.Transition>(),
                            X = 400,
                            Y = 400
                        }
                    }
                }
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody]BusinessProcess businessProcess)
        {
            if (businessProcess is null)
                throw new ArgumentNullException(nameof(businessProcess));
            await _businessProcessRepositary.Save(businessProcess);
            return RedirectToAction("Index");
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            return View(await _businessProcessRepositary.GetById(new ObjectId(id)));
        }

        [HttpPost]
        public async Task<IActionResult> Edit([FromBody]BusinessProcess businessProcess)
        {
            if (businessProcess is null)
                throw new ArgumentNullException(nameof(businessProcess));
            await _businessProcessRepositary.Save(businessProcess);
            return RedirectToAction("Index");
        }

        public async Task<IActionResult> Delete(string id)
        {
            await _businessProcessRepositary.Remove(new ObjectId(id));
            return RedirectToAction("Index");
        }


    }
}
