using System;

namespace WFM.Models.Store
{
    public partial class BusinessProcessState
    {
        public class CompleteRecord
        {
            public Guid Id { get; set; }

            public string Resolution { get; set; }

            public DateTime DateTime { get; set; }
        }
    }
}
