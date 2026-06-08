using Microsoft.AspNetCore.Mvc;

namespace Maintenance_System.Controllers
{
    public class Data : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
