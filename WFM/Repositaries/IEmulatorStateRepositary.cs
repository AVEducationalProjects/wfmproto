using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WFM.Models.Store;

namespace WFM.Repositaries
{
    public interface IEmulatorStateRepositary
    {
        Task<IList<BusinessProcessState>> List();
        Task<IList<BusinessProcessState>> ListNotComplete();
        Task Save(BusinessProcessState businessProcessState);
        Task<BusinessProcessState> GetById(ObjectId objectId);
    }
}
