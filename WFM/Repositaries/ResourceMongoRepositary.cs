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
    public class ResourceMongoRepositary : IResourceRepositary
    {
        private IMongoCollection<Resource> Resources { get; }

        public ResourceMongoRepositary(IOptions<MongoOptions> mongoOptions)
        {
            var client = new MongoClient(mongoOptions.Value.Server);
            var database = client.GetDatabase(mongoOptions.Value.Database);

            Resources = database.GetCollection<Resource>(mongoOptions.Value.ResourceCollection);
        }


        public async Task<Resource> GetById(ObjectId id)
        {
            var result = await Resources.FindAsync(x => x.Id == id);
            return result.Single();
        }

        public async Task<IList<Resource>> List()
        {
            var result = await Resources.FindAsync(_ => true);
            return result.ToList();
        }

        public async Task Remove(ObjectId id)
        {
            await Resources.FindOneAndDeleteAsync(x => x.Id == id);
        }

        public async Task Save(Resource resource)
        {
            var result = await Resources.FindAsync(x => x.Id == resource.Id);
            if (result.Any())
            {
                await Resources.FindOneAndReplaceAsync(x => x.Id == resource.Id, resource);
            }
            else
            {
                await Resources.InsertOneAsync(resource);
            }
        }
    }
}
