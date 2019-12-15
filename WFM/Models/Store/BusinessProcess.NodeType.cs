namespace WFM.Models.Store
{
    public partial class BusinessProcess
    {
        public enum NodeType
        {
            Start,
            Event,
            Action,
            End
        }
    }
}