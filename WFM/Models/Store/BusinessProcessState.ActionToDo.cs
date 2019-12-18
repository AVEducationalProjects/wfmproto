using System;
using System.Collections.Generic;

namespace WFM.Models.Store
{
    public partial class BusinessProcessState
    {
        public class ActionToDo
        {
            public Guid Id { get; internal set; }
            public string Name { get; internal set; }
            public string Skills { get; set; }
            public DateTime Estimated { get; internal set; }
            public decimal Duration { get; internal set; }
            public IList<string> Resolutions { get; set; }
        }
    }
}
