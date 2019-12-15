using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WFM.Models.Store;
using WFM.Options;

namespace WFM.Repositaries
{
    public class BusinessProcessMongoRepositary : IBusinessProcessRepositary
    {
        private IMongoCollection<BusinessProcess> BusinessProcesses { get; }

        public BusinessProcessMongoRepositary(IOptions<MongoOptions> mongoOptions)
        {
            var client = new MongoClient(mongoOptions.Value.Server);
            var database = client.GetDatabase(mongoOptions.Value.Database);

            BusinessProcesses = database.GetCollection<BusinessProcess>(mongoOptions.Value.BusinessProcessCollection);
        }

        public async Task<BusinessProcess> GetById(ObjectId id)
        {
            var result = await BusinessProcesses.FindAsync(x => x.Id == id);
            return result.Single();

        }

        public async Task<IList<BusinessProcess>> List()
        {
            return (await BusinessProcesses.FindAsync(_ => true)).ToList();
        }

        public async Task Remove(ObjectId id)
        {
            await BusinessProcesses.FindOneAndDeleteAsync(x => x.Id == id);
        }

        public async Task Save(BusinessProcess businessProcess)
        {
            var searchResult = await BusinessProcesses.FindAsync(x => x.Id == businessProcess.Id);
            if (searchResult.Any())
                await BusinessProcesses.FindOneAndReplaceAsync(x => x.Id == businessProcess.Id, businessProcess);
            else
                await BusinessProcesses.InsertOneAsync(businessProcess);
        }
    }
}
