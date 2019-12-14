using Microsoft.AspNetCore.Mvc.ModelBinding;
using MongoDB.Bson;
using System.Text.Json;
using System.Threading.Tasks;

namespace WFM.Models.DTO
{
    internal class BusinessProcessBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext is null)
                throw new System.ArgumentNullException(nameof(bindingContext));

            var serializedId = bindingContext.ValueProvider.GetValue(nameof(BusinessProcess.Id)).FirstValue;
            var name = bindingContext.ValueProvider.GetValue(nameof(BusinessProcess.Name)).FirstValue;
            var serializedDiagram = bindingContext.ValueProvider.GetValue(nameof(BusinessProcess.SerializedDiagram)).FirstValue;

            if (serializedId == null || name == null || serializedDiagram == null)
                throw new System.ApplicationException("Not all fields provided for binding context.");

            if (!ObjectId.TryParse(serializedId, out ObjectId id))
            {
                bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, "Business process Id must be an ObjectId.");
                return Task.CompletedTask;
            }

            if (string.IsNullOrWhiteSpace(name))
            {
                bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, "Name should not be empty.");
                return Task.CompletedTask;
            }

            var model = new BusinessProcess { Id = id, Name = name, SerializedDiagram = serializedDiagram };
            bindingContext.Result = ModelBindingResult.Success(model);
            return Task.CompletedTask;
        }
    }
}