using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WFM.Models.Store;
using WFM.Options;

namespace WFM.Repositaries
{
    public class EmulatorStateMongoRepositary : IEmulatorStateRepositary
    {
        private IMongoCollection<BusinessProcessState> BusinessProcessStateCollection { get; }

        public EmulatorStateMongoRepositary(IOptions<MongoOptions> mongoOptions)
        {
            var client = new MongoClient(mongoOptions.Value.Server);
            var database = client.GetDatabase(mongoOptions.Value.Database);

            BusinessProcessStateCollection = database.GetCollection<BusinessProcessState>(mongoOptions.Value.BusinessProcessStateCollection);
        }

        public async Task<BusinessProcessState> GetById(ObjectId objectId)
        {
            var result = await BusinessProcessStateCollection.FindAsync(x => x.Id == objectId);
            return result.Single();
        }

        public async Task<IList<BusinessProcessState>> List()
        {
            var result = await BusinessProcessStateCollection.FindAsync(_ => true);
            return result.ToList();
        }

        public async Task Save(BusinessProcessState businessProcessState)
        {
            var searchResult = await BusinessProcessStateCollection.FindAsync(x => x.Id == businessProcessState.Id);
            if (searchResult.Any())
                await BusinessProcessStateCollection.FindOneAndReplaceAsync(x => x.Id == businessProcessState.Id, businessProcessState);
            else
                await BusinessProcessStateCollection.InsertOneAsync(businessProcessState);
        }
    }
}
