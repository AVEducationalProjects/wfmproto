using System;

namespace WFM.Models.DTO
{
    public partial class BusinessProcess
    {
        public class Transition
        {
            public string Resolution { get; set; }

            public Guid Id { get; set; }
        }
    }
}