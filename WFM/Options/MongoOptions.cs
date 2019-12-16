using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WFM.Options
{
    public class MongoOptions
    {
        public string Server { get; set; }

        public string Database { get; set; }

        public string BusinessProcessCollection { get; set; }

        public string BusinessProcessStateCollection { get; set; }

        public string ResourceCollection { get; set; }
    }
}
