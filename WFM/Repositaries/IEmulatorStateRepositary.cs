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
        Task Save(BusinessProcessState businessProcessState);
    }
}
