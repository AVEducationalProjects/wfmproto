using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using WFM.Models.DTO;

namespace WFM.Models.Store
{
    [ModelBinder(BinderType =typeof(ResourceBinder))]
    public class Resource
    {
        public ObjectId Id { get; set; }

        public string Name { get; set; }

        public string Skills { get; set; }
    }
}
