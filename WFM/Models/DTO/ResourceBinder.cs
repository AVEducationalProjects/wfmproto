using Microsoft.AspNetCore.Mvc.ModelBinding;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WFM.Models.Store;

namespace WFM.Models.DTO
{
    public class ResourceBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext is null)
                throw new System.ArgumentNullException(nameof(bindingContext));

            var serializedId = bindingContext.ValueProvider.GetValue(nameof(Resource.Id)).FirstValue;
            var name = bindingContext.ValueProvider.GetValue(nameof(Resource.Name)).FirstValue;
            var skills = bindingContext.ValueProvider.GetValue(nameof(Resource.Skills)).FirstValue;

            ObjectId id;
            if (serializedId == null)
                id = ObjectId.GenerateNewId();
            else if (!ObjectId.TryParse(serializedId, out id))
            {
                bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, "Business process Id must be an ObjectId.");
                return Task.CompletedTask;
            }

            if (string.IsNullOrWhiteSpace(name))
            {
                bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, "Name should not be empty.");
                return Task.CompletedTask;
            }

            var model = new Resource { Id = id, Name = name, Skills = skills };
            bindingContext.Result = ModelBindingResult.Success(model);
            return Task.CompletedTask;
        }
    }
}
