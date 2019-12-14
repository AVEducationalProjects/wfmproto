using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WFM.Options;

namespace WFM
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.ConfigureServices(ConfigureOptions);
                    webBuilder.UseStartup<Startup>();
                });
        private static void ConfigureOptions(WebHostBuilderContext context, IServiceCollection services)
        {
            services.AddOptions()
                .Configure<MongoOptions>(context.Configuration.GetSection("Mongo"));
        }
    }
}
