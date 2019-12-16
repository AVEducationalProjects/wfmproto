using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using WFM.Models.Store;
using WFM.Repositaries;

namespace WFM.Controllers
{
    public class ResourceController : Controller
    {
        private readonly ILogger<ResourceController> _logger;
        private readonly IResourceRepositary _resourceRepositary;

        public ResourceController(ILogger<ResourceController> logger,
            IResourceRepositary resourceRepositary)
        {
            _logger = logger;
            _resourceRepositary = resourceRepositary;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var result = await _resourceRepositary.List();
            return View(result);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody]Resource resource)
        {
            if (resource is null)
                throw new ArgumentNullException(nameof(resource));

            await _resourceRepositary.Save(resource);
            return RedirectToAction("Index");
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentNullException(nameof(id));

            var result = await _resourceRepositary.GetById(new ObjectId(id));

            return View(result);
        }

        [HttpPost]
        public async Task<IActionResult> Edit([FromBody]Resource resource)
        {
            if (resource is null)
                throw new ArgumentNullException(nameof(resource));
            await _resourceRepositary.Save(resource);
            return RedirectToAction("Index");
        }


        [HttpGet]
        public async Task<IActionResult> Delete(string id)
        {
            await _resourceRepositary.Remove(new ObjectId(id));
            return RedirectToAction("Index");
        }
    }
}