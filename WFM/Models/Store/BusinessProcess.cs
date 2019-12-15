using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json;
using System.Text.Json.Serialization;
using WFM.Models.DTO;

namespace WFM.Models.Store
{
    [ModelBinder(BinderType = typeof(BusinessProcessBinder))]
    public partial class BusinessProcess
    {
        private static JsonSerializerOptions _serializerOptions;
        static BusinessProcess()
        {
            _serializerOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
        }

        public ObjectId Id { get; set; }

        public string Name { get; set; }

        public Graph Diagram { get; set; }

        [BsonIgnore]
        public string SerializedDiagram
        {
            get
            {

                return JsonSerializer.Serialize(Diagram, _serializerOptions);
            }
            set
            {
                Diagram = JsonSerializer.Deserialize<Graph>(value, _serializerOptions);
            }
        }
    }
}
