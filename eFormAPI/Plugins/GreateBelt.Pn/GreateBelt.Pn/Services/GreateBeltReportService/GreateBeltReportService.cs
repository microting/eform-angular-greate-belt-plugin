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

namespace GreateBelt.Pn.Services.GreateBeltReportService
{
    using GreateBelt.Pn.Infrastructure.Models.Report.Index;
    using GreateBelt.Pn.Services.GreateBeltLocalizationService;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Helpers;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class GreateBeltReportService : IGreateBeltReportService
    {
        private readonly ILogger<GreateBeltReportService> _logger;
        private readonly ItemsPlanningPnDbContext _itemsPlanningPnDbContext;
        private readonly IUserService _userService;
        private readonly IGreateBeltLocalizationService _localizationService;
        private readonly IEFormCoreService _core;

        public GreateBeltReportService(
            ILogger<GreateBeltReportService> logger,
            ItemsPlanningPnDbContext itemsPlanningPnDbContext,
            IUserService userService,
            IGreateBeltLocalizationService localizationService,
            IEFormCoreService core)
        {
            _logger = logger;
            _itemsPlanningPnDbContext = itemsPlanningPnDbContext;
            _userService = userService;
            _localizationService = localizationService;
            _core = core;
        }

        public async Task<OperationDataResult<GreateBeltReportIndexResponseModel>> Index(GreateBeltReportIndexRequestModel model)
        {
            var core = await _core.GetCore();
            await using var sdkDbContext = core.DbContextHelper.GetDbContext();

            var fieldId = sdkDbContext.Fields
                .Where(x => x.CheckListId == model.EformId)
                .Select(x => x.Id)
                .FirstOrDefault();
            var currentLanguage = await _userService.GetCurrentUserLanguage();
            var nameFields = new List<string> { "Id", "Value", "DoneAtUserModifiable", "DoneAt" };

            var casesQuery = sdkDbContext.Cases
                .Where(x => x.CheckListId == model.EformId);
            casesQuery = QueryHelper.AddFilterToQuery(casesQuery, nameFields, model.NameFilter);
            casesQuery = casesQuery
                .Skip(model.Offset)
                .Take(model.PageSize);

            var total = await casesQuery.Select(x => x.Id).CountAsync();

            var foundCases = await casesQuery
                .Select(x => new
                {
                    Id = x.Id,
                    CustomField1 = sdkDbContext.FieldValues
                                .Where(z => z.FieldId == fieldId && z.CaseId == x.Id)
                                .Select(z => z.Value)
                                .FirstOrDefault(),
                    DoneAtUserEdtiable = x.DoneAtUserModifiable.Value,
                    DoneBy = x.Site.Name,
                    IsArchieved = x.IsArchived,
                })
                .ToListAsync();

            var foundCaseIds = foundCases.Select(x => x.Id).ToList();

            var allFieldValues = core.Advanced_FieldValueReadList(foundCaseIds, currentLanguage);

            var foundPlanningInfo = await _itemsPlanningPnDbContext.Plannings
                .Where(planning => planning.PlanningCases.Select(y => y.MicrotingSdkCaseId).Any(caseId => foundCaseIds.Contains(caseId)))
                .Select(x => new
                {
                    x.Id,
                    Name = x.NameTranslations
                        .Where(y => y.LanguageId == 1) //Danish
                        .Select(y => y.Name)
                        .FirstOrDefault(),
                })
                .ToListAsync();

            var result = new GreateBeltReportIndexResponseModel
            {
                TotalCount = total,
                Cases = foundCases
                .Select(x => new GreateBeltReportIndexModel
                {
                    Id = x.Id,
                    CustomField1 = x.CustomField1,
                    DoneAtUserEdtiable = x.DoneAtUserEdtiable,
                    DoneBy = x.DoneBy,
                    ItemName = foundPlanningInfo
                        .Where(y => y.Id == x.Id)
                        .Select(y => y.Name)
                        .FirstOrDefault(),
                    IsArchieved = x.IsArchieved,
                })
                .ToList(),
            };

            return new OperationDataResult<GreateBeltReportIndexResponseModel>(true, result);
        }
    }
}
