using System.Threading.Tasks;
using WFM.Models.Store;

namespace WFM.Repositaries
{
    public interface IPlanRepositary
    {
        Task<Plan> Get();
        Task Save(Plan plan);
    }
}
