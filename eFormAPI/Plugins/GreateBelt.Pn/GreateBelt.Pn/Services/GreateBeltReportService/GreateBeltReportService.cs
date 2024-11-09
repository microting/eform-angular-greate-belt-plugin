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

using System.Collections.Generic;
using System.Text.RegularExpressions;
using Sentry;

namespace GreateBelt.Pn.Services.GreateBeltReportService
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using GreateBeltLocalizationService;
    using Infrastructure.Models.Report.Index;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microting.eForm.Infrastructure.Constants;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.eFormApi.BasePn.Infrastructure.Models.Common;
    using Microting.ItemsPlanningBase.Infrastructure.Data;

    public class GreateBeltReportService(
        ILogger<GreateBeltReportService> logger,
        ItemsPlanningPnDbContext itemsPlanningPnDbContext,
        IUserService userService,
        IGreateBeltLocalizationService localizationService,
        IEFormCoreService core)
        : IGreateBeltReportService
    {
        public async Task<OperationDataResult<Paged<GreateBeltReportIndexModel>>> Index(GreateBeltReportIndexRequestModel model)
        {
            try
            {
                var core1 = await core.GetCore();
                var sdkDbContext = core1.DbContextHelper.GetDbContext();

                var casesQuery = sdkDbContext.Cases
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .Where(x => x.DoneAt != null)
                    .Where(x => model.EformIds.Contains(x.CheckListId.Value));

                var foundCases = await casesQuery
                    .Select(x => new
                    {
                        x.Id,
                        CustomField1 = x.FieldValue1,
                        CustomField2 = x.FieldValue2,
                        CustomField3 = x.FieldValue3,
                        CustomField4 = x.FieldValue4,
                        CustomField5 = x.FieldValue5,
                        CustomField6 = x.FieldValue6,
                        DoneAtUserEditable = x.DoneAtUserModifiable,
                        DoneBy = x.SiteId == null ? "" : x.Site.Name,
                        x.CheckListId,
                        IsArchieved = x.IsArchived,
                    })
                    .ToListAsync();

                var foundCaseIds = foundCases.Select(x => x.Id).ToList();
                var planningQuery = itemsPlanningPnDbContext.Plannings
                    .Where(x => model.EformIds.Contains(x.RelatedEFormId))
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .Select(x => new
                    {
                        x.Id,
                        x.RelatedEFormId,
                        Name = x.NameTranslations
                            .Where(y => y.LanguageId == 1) //Danish
                            .Select(y => y.Name)
                            .FirstOrDefault(),
                    });

                var plannings = await planningQuery
                    .ToListAsync();

                var planningCasesQuery = itemsPlanningPnDbContext.PlanningCases
                    .Include(x => x.Planning)
                    .Where(x => foundCaseIds.Contains(x.MicrotingSdkCaseId))
                    .Where(x => x.Status == 100)
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .AsQueryable();

                var joined = plannings
                    .Join(planningCasesQuery, arg => arg.Id, arg => arg.PlanningId,
                        (x, y) => new
                        {
                            x.Name,
                            y.MicrotingSdkCaseId,
                            y.PlanningId,
                            y.MicrotingSdkeFormId
                        })
                    .ToList();

                var foundResultQuery = foundCases
                    .Select(x => new GreateBeltReportIndexModel
                    {
                        Id = x.Id,
                        CustomField1 = x.CustomField1 ?? "",
                        CustomField2 = x.CustomField2 ?? "",
                        CustomField3 = x.CustomField3 ?? "",
                        CustomField4 = x.CustomField4 ?? "",
                        CustomField5 = x.CustomField5 ?? "",
                        CustomField6 = x.CustomField6 ?? "",
                        DoneAtUserEditable = x.DoneAtUserEditable,
                        DoneBy = x.DoneBy,
                        ItemName = joined
                            .Where(y => y.MicrotingSdkCaseId == x.Id)
                            .Select(y => y.Name)
                            .LastOrDefault(),
                        IsArchived = x.IsArchieved,
                        ItemId = joined.Where(y => y.MicrotingSdkCaseId == x.Id).Select(y => y.PlanningId).LastOrDefault(),
                        TemplateId = joined.Where(y => y.MicrotingSdkCaseId == x.Id).Select(y => y.MicrotingSdkeFormId).LastOrDefault()
                    });

                foundResultQuery = foundResultQuery
                    .Where(x => x.Id.ToString().Contains(model.NameFilter)
                    || x.CustomField1.ToLower().Contains(model.NameFilter)
                    || x.CustomField2.ToLower().Contains(model.NameFilter)
                    || x.CustomField3.ToLower().Contains(model.NameFilter)
                    || x.CustomField4.ToLower().Contains(model.NameFilter)
                    || x.CustomField5.ToLower().Contains(model.NameFilter)
                    || x.CustomField6.ToLower().Contains(model.NameFilter)
                    || x.DoneAtUserEditable.ToString().Contains(model.NameFilter)
                    || x.DoneBy.ToLower().Contains(model.NameFilter)
                    || x.ItemName.ToLower().Contains(model.NameFilter))
                    .Select(x => x)
                    .ToList();

                switch (model.Sort)
                {
                    case "Name":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.DoneBy).ToList()
                            : foundResultQuery.OrderBy(x => x.DoneBy).ToList();

                        break;
                    }
                    case "ItemName":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.ItemName).ToList()
                            : foundResultQuery.OrderBy(x => x.ItemName).ToList();
                        break;
                    }
                    case "Id":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.Id).ToList()
                            : foundResultQuery.OrderBy(x => x.Id).ToList();
                        break;
                    }
                    case "FieldValue1":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.CustomField1).ToList()
                            : foundResultQuery.OrderBy(x => x.CustomField1).ToList();
                        break;
                    }
                    case "FieldValue2":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.CustomField2).ToList()
                            : foundResultQuery.OrderBy(x => x.CustomField2).ToList();
                        break;
                    }
                    case "FieldValue3":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.CustomField3).ToList()
                            : foundResultQuery.OrderBy(x => x.CustomField3).ToList();
                        break;
                    }
                    case "FieldValue4":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.CustomField4).ToList()
                            : foundResultQuery.OrderBy(x => x.CustomField4).ToList();
                        break;
                    }
                    case "FieldValue5":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.CustomField5).ToList()
                            : foundResultQuery.OrderBy(x => x.CustomField5).ToList();
                        break;
                    }
                    case "FieldValue6":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.CustomField6).ToList()
                            : foundResultQuery.OrderBy(x => x.CustomField6).ToList();
                        break;
                    }
                    case "DoneAtUserModifiable":
                    {
                        foundResultQuery = model.IsSortDsc
                            ? foundResultQuery.OrderByDescending(x => x.DoneAtUserEditable).ToList()
                            : foundResultQuery.OrderBy(x => x.DoneAtUserEditable).ToList();
                        break;
                    }
                    default:
                        foundResultQuery = foundResultQuery.OrderByDescending(x => x.Id).ToList();
                        break;
                }

                var total = foundResultQuery.Select(x => x.Id).Count();
                foundResultQuery = foundResultQuery
                    .Skip(model.Offset)
                    .Take(model.PageSize);
                var result = new Paged<GreateBeltReportIndexModel>
                {
                    Total = total,
                    Entities = new List<GreateBeltReportIndexModel>()
                };

                foreach (var indexModel in foundResultQuery.ToList())
                {
                    var regex = new Regex(@"(\d )(.*)");
                    if (indexModel.ItemName == null)
                    {
                        result.Entities.Add(indexModel);
                        continue;
                    }
                    var matches = regex.Matches(indexModel.ItemName);
                    if (matches.Count > 0 && !indexModel.ItemName.Contains("fuge"))
                    {
                        indexModel.ItemName = indexModel.ItemName.Replace(matches[0].Groups[1].Value, "");
                    }
                    result.Entities.Add(indexModel);
                }



                return new OperationDataResult<Paged<GreateBeltReportIndexModel>>(true, result);
            }
            catch (Exception e)
            {
                SentrySdk.CaptureException(e);
                logger.LogError(e, $"User {userService.GetCurrentUserFullName()} logged in from GreateBeltReportService.Index");
                logger.LogTrace(e.StackTrace);
                return new OperationDataResult<Paged<GreateBeltReportIndexModel>>(false,
                    localizationService.GetString("ErrorWhileReadCases"));
            }
        }
    }
}