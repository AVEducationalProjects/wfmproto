using System;
using System.Collections.Generic;

namespace WFM.Models.DTO
{
    public partial class BusinessProcess
    {
        public class Node
        {
            public Guid Id { get; set; }

            public string Name { get; set; }

            public NodeType Type { get; set; }

            public decimal Duration { get; set; }

            public string Skills { get; set; }

            public List<Transition> Transitions { get; set; }

            public int X { get; set; }

            public int Y { get; set; }

        }
    }
}