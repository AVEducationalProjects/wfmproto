using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WFM.Models.Store;

namespace WFM.Repositaries
{
    public interface IResourceRepositary
    {
        Task<IList<Resource>> List();
        Task<Resource> GetById(ObjectId id);
        Task Save(Resource resource);
        Task Remove(ObjectId id);
    }
}
