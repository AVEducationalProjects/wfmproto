using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using WFM.Models.DTO;

namespace WFM.Models.Store
{
    public partial class BusinessProcess
    {
        public class Node
        {
            public Guid Id { get; set; }

            public string Name { get; set; }

            public NodeType Type { get; set; }

            [JsonConverter(typeof(DecimalToStringConverter))]
            public decimal Duration { get; set; }

            public string Skills { get; set; }

            public List<Transition> Transitions { get; set; }

            public int X { get; set; }

            public int Y { get; set; }

        }
    }
}