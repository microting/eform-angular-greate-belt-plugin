/*
The MIT License (MIT)
Copyright (c) 2007 - 2021 Microting A/S
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Microsoft.EntityFrameworkCore;
using Microting.eForm.Dto;
using Microting.eFormApi.BasePn.Abstractions;
using Microting.ItemsPlanningBase.Infrastructure.Data;

namespace GreateBelt.Pn.Controllers
{
    using System.Threading.Tasks;
    using Infrastructure.Models.Report.Index;
    using Microsoft.AspNetCore.Mvc;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.eFormApi.BasePn.Infrastructure.Models.Common;
    using Services.GreateBeltReportService;

    [Route("api/greate-belt-pn/report")]
    public class GreateBeltReportController : Controller
    {
        private readonly IGreateBeltReportService _greateBeltMainService;
        private readonly IEFormCoreService _coreHelper;
        private readonly IUserService _userService;
        private readonly ItemsPlanningPnDbContext _itemsPlanningPnDbContext;

        public GreateBeltReportController(IGreateBeltReportService greateBeltMainService, IEFormCoreService coreHelper, IUserService userService, ItemsPlanningPnDbContext itemsPlanningPnDbContext)
        {
            _greateBeltMainService = greateBeltMainService;
            _coreHelper = coreHelper;
            _userService = userService;
            _itemsPlanningPnDbContext = itemsPlanningPnDbContext;
        }

        [HttpPost]
        public async Task<OperationDataResult<Paged<GreateBeltReportIndexModel>>> Index([FromBody] GreateBeltReportIndexRequestModel model)
        {
            return await _greateBeltMainService.Index(model);
        }

        [HttpGet]
        [Route("{templateId}")]
        public async Task<IActionResult> DownloadEFormPdf(int templateId, int caseId, int itemId)
        {

            try
            {
                var core = await _coreHelper.GetCore();
                var language = await _userService.GetCurrentUserLanguage();
                var item = await _itemsPlanningPnDbContext.Plannings.FirstOrDefaultAsync(x => x.Id == itemId);

                var planningTranslation = await _itemsPlanningPnDbContext.PlanningNameTranslation.FirstOrDefaultAsync(x => x.PlanningId == item.Id && x.LanguageId == language.Id);

                var regex = new Regex(@"(\d )(.*)");
                var matches = regex.Matches(planningTranslation.Name);
                if (matches.Count > 0)
                {
                    planningTranslation.Name = matches[0].Groups[2].Value;
                }

                string customXml = new XElement("F_ItemName", planningTranslation.Name).ToString();
                if (templateId == 11 || templateId == 23)
                {
                    Regex regex1 = new Regex(@"fuge nr. (\d+)");
                    Regex regex2 = new Regex(@"- (\d)");
                    Match match1 = regex1.Match(planningTranslation.Name);
                    Match match2 = regex2.Match(planningTranslation.Name);
                    customXml = new XElement("Custom",
                        new XElement("F_ItemName", planningTranslation.Name),
                        new XElement("groove_name", match1.Value.Replace("fuge nr. ", "")),
                        new XElement("rail_name", match2.Value.Replace("- ", ""))).ToString();
                }

                var filePath = await core.CaseToPdf(caseId, templateId.ToString(),
                    DateTime.Now.ToString("yyyyMMddHHmmssffff"),
                    $"{await core.GetSdkSetting(Settings.httpServerAddress)}/" + "api/template-files/get-report-image/", customXml, language);
                // var filePath = await core.CaseToPdf(caseId, templateId.ToString(),
                //     DateTime.Now.ToString("yyyyMMddHHmmssffff"),
                //     $"{await core.GetSdkSetting(Settings.httpServerAddress)}/" + "api/template-files/get-image/pdf", customXmlContent, language);
                //DateTime.Now.ToString("yyyyMMddHHmmssffff"), $"{core.GetHttpServerAddress()}/" + "api/template-files/get-image?&filename=");
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound();
                }

                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                return File(fileStream, "application/pdf", Path.GetFileName(filePath));
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return BadRequest();
            }
        }
    }
}