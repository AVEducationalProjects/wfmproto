using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;
using WFM.Models.Store;

namespace WFM.Repositaries
{
    public interface IBusinessProcessRepositary
    {
        Task<IList<BusinessProcess>> List();

        Task<BusinessProcess> GetById(ObjectId id);

        Task Save(BusinessProcess businessProcess);

        Task Remove(ObjectId id);
    }
}
