﻿using System;
using System.Collections.Generic;

namespace WFM.Models.Store
{
    public partial class BusinessProcessState
    {
        public class ExpectedEvent
        {
            public Guid Id { get; internal set; }
            public string Name { get; internal set; }
            public DateTime Estimated { get; internal set; }
            public IList<string> Resolutions { get; set; }
        }
    }
}
