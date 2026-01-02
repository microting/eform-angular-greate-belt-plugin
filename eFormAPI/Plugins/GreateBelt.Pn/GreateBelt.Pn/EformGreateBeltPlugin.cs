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

using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using Sentry;

namespace GreateBelt.Pn
{
    using System;
    using System.Collections.Generic;
    using System.Reflection;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microting.eFormApi.BasePn;
    using Microting.eFormApi.BasePn.Infrastructure.Consts;
    using Microting.eFormApi.BasePn.Infrastructure.Helpers;
    using Microting.eFormApi.BasePn.Infrastructure.Models.Application;
    using Microting.eFormApi.BasePn.Infrastructure.Models.Application.NavigationMenu;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using Services.GreateBeltLocalizationService;
    using Services.GreateBeltReportService;

    public class EformGreateBeltPlugin : IEformPlugin
    {
        public string Name => "Microting Greate Belt Plugin";
        public string PluginId => "eform-angular-greate-belt-plugin";
        public string PluginPath => PluginAssembly().Location;
        public string PluginBaseUrl => "greate-belt-pn";

        //private IBus _bus;

        public Assembly PluginAssembly()
        {
            return typeof(EformGreateBeltPlugin).GetTypeInfo().Assembly;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddTransient<IGreateBeltLocalizationService, GreateBeltLocalizationService>();
            services.AddTransient<IGreateBeltReportService, GreateBeltReportService>();
            services.AddControllers();
        }

        public void AddPluginConfig(IConfigurationBuilder builder, string connectionString)
        {
        }

        public void ConfigureOptionsServices(IServiceCollection services, IConfiguration configuration)
        {
        }

        public void ConfigureDbContext(IServiceCollection services, string connectionString)
        {
            SentrySdk.Init(options =>
            {
                // A Sentry Data Source Name (DSN) is required.
                // See https://docs.sentry.io/product/sentry-basics/dsn-explainer/
                // You can set it in the SENTRY_DSN environment variable, or you can set it in code here.
                options.Dsn = "https://2cd3071eb1d210f5384914322eb6e765@o4506241219428352.ingest.us.sentry.io/4508266870145024";

                // When debug is enabled, the Sentry client will emit detailed debugging information to the console.
                // This might be helpful, or might interfere with the normal operation of your application.
                // We enable it here for demonstration purposes when first trying Sentry.
                // You shouldn't do this in your applications unless you're troubleshooting issues with Sentry.
                options.Debug = false;

                // This option is recommended. It enables Sentry's "Release Health" feature.
                options.AutoSessionTracking = true;

                // This option is recommended for client applications only. It ensures all threads use the same global scope.
                // If you're writing a background service of any kind, you should remove this.
                options.IsGlobalModeEnabled = true;
            });

            string pattern = @"Database=(\d+)_eform-angular-greate-belt-plugin;";
            Match match = Regex.Match(connectionString!, pattern);

            if (match.Success)
            {
                string numberString = match.Groups[1].Value;
                int number = int.Parse(numberString);
                SentrySdk.ConfigureScope(scope =>
                {
                    scope.SetTag("customerNo", number.ToString());
                    Console.WriteLine("customerNo: " + number);
                    scope.SetTag("osVersion", Environment.OSVersion.ToString());
                    Console.WriteLine("osVersion: " + Environment.OSVersion);
                    scope.SetTag("osArchitecture", RuntimeInformation.OSArchitecture.ToString());
                    Console.WriteLine("osArchitecture: " + RuntimeInformation.OSArchitecture);
                    scope.SetTag("osName", RuntimeInformation.OSDescription);
                    Console.WriteLine("osName: " + RuntimeInformation.OSDescription);
                });
            }
            var itemsPlannigConnectionString = connectionString.Replace(
                "eform-angular-greate-belt-plugin",
                "eform-angular-items-planning-plugin");
            services.AddDbContext<ItemsPlanningPnDbContext>(o =>
                o.UseMySql(itemsPlannigConnectionString, new MariaDbServerVersion(
                    new Version(10, 4, 0)), mySqlOptionsAction: builder =>
                {
                    builder.EnableRetryOnFailure();
                    builder.MigrationsAssembly(PluginAssembly().FullName);
                }));
        }

        public void Configure(IApplicationBuilder appBuilder)
        {
        }

        public List<PluginMenuItemModel> GetNavigationMenu(IServiceProvider serviceProvider)
        {
            var pluginMenu = new List<PluginMenuItemModel>
            {
                new()
                {
                    Name = "Dropdown",
                    E2EId = "greate-belt-pn-oresund",
                    Link = "",
                    Type = MenuItemTypeEnum.Dropdown,
                    Position = 1,
                    Translations = new List<PluginMenuTranslationModel>
                    {
                        new()
                        {
                            LocaleName = LocaleNames.English,
                            Name = "Øresund",
                            Language = LanguageNames.English,
                        },
                        new()
                        {
                            LocaleName = LocaleNames.Danish,
                            Name = "Øresund",
                            Language = LanguageNames.Danish,
                        },
                    },
                    ChildItems = new List<PluginMenuItemModel>
                    {
                        new()
                        {
                            Name = "Øresund: Sporanlæg (Eftersyn og smøring af skinneudtraek - 14 dags) menu",
                            E2EId = "greate-belt-pn-report-oresund",
                            Link = "/plugins/greate-belt-pn/report/oresund/14-dags",
                            Type = MenuItemTypeEnum.Link,
                            Position = 3,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Øresund: Sporanlæg (Eftersyn og smøring af skinneudtraek - 14 dags) menu",
                                E2EId = "greate-belt-pn-oresund-14-dags",
                                DefaultLink = "/plugins/greate-belt-pn/report/oresund/14-dags",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Øresund: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name =
                                            "Øresund: Sporanlæg (Eftersyn og smøring af skinneudtraek - 14 dags)",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Øresund: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Øresund: Sporanlæg (Eftersyn og smøring af skinneudtraek - 14 dags)",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                        new()
                        {
                            Name = "Øresund: Tilstandsrapport menu",
                            E2EId = "greate-belt-pn-report-oresund",
                            Link = "/plugins/greate-belt-pn/report/oresund/tr",
                            Type = MenuItemTypeEnum.Link,
                            Position = 0,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Øresund: Tilstandsrapport menu",
                                E2EId = "greate-belt-pn-oresund-14-dags",
                                DefaultLink = "/plugins/greate-belt-pn/report/oresund/tr",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Øresund: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name =
                                            "Øresund: Tilstandsrapport",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Øresund: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Øresund: Tilstandsrapport",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                        new()
                        {
                            Name = "Øresund: Sporskifteeftersyn menu",
                            E2EId = "greate-belt-pn-report-oresund",
                            Link = "/plugins/greate-belt-pn/report/oresund/oesse",
                            Type = MenuItemTypeEnum.Link,
                            Position = 1,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Øresund: Sporskifteeftersyn menu",
                                E2EId = "greate-belt-pn-oresund-14-dags",
                                DefaultLink = "/plugins/greate-belt-pn/report/oresund/oesse",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Øresund: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name =
                                            "Øresund: Sporskifteeftersyn",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Øresund: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Øresund: Sporskifteeftersyn",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                        new()
                        {
                            Name = "Øresund: Sporanlæg (Eftersyn og kontrol af gennemgående og centralsikrede spor) menu",
                            E2EId = "greate-belt-pn-report-oresund",
                            Link = "/plugins/greate-belt-pn/report/oresund/oesaekcsltf",
                            Type = MenuItemTypeEnum.Link,
                            Position = 2,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Øresund: Sporanlæg (Eftersyn og kontrol af gennemgående og centralsikrede spor) menu",
                                E2EId = "greate-belt-pn-oresund-14-dags",
                                DefaultLink = "/plugins/greate-belt-pn/report/oresund/oesaekcsltf",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Øresund: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name =
                                            "Øresund: Sporanlæg (Eftersyn og kontrol af gennemgående og centralsikrede spor)",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Øresund: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Øresund: Sporanlæg (Eftersyn og kontrol af gennemgående og centralsikrede spor)",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                    }
                },
                new()
                {
                    Name = "Dropdown",
                    E2EId = "greate-belt-pn-storebaelt",
                    Link = "",
                    Type = MenuItemTypeEnum.Dropdown,
                    Position = 0,
                    Translations = new List<PluginMenuTranslationModel>
                    {
                        new()
                        {
                            LocaleName = LocaleNames.English,
                            Name = "Greate Belt",
                            Language = LanguageNames.English,
                        },
                        new()
                        {
                            LocaleName = LocaleNames.Danish,
                            Name = "Storebælt",
                            Language = LanguageNames.Danish,
                        },
                    },
                    ChildItems = new List<PluginMenuItemModel>
                    {
                        new()
                        {
                            Name = "Greate Belt: Sporanlæg (Eftersyn og smøring af skinneudtraek - 14 dags) menu",
                            E2EId = "greate-belt-pn-report-storebaelt",
                            Link = "/plugins/greate-belt-pn/report/storebaelt/14-dags",
                            Type = MenuItemTypeEnum.Link,
                            Position = 3,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Greate Belt: Sporanlæg (Eftersyn og smøring af skinneudtraek - 14 dags) menu",
                                E2EId = "greate-belt-pn-storebaelt-14-dags",
                                DefaultLink = "/plugins/greate-belt-pn/report/storebaelt/14-dags",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name = "Storebælt: Skinneudtræk (14 dags)",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Storebælt: Skinneudtræk (14 dags)",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                        new()
                        {
                            Name = "Greate Belt: Sporanlæg (Eftersyn og smøring af skinneudtraek - 2 måneder) menu",
                            E2EId = "greate-belt-pn-report-storebaelt",
                            Link = "/plugins/greate-belt-pn/report/storebaelt/2-mdr",
                            Type = MenuItemTypeEnum.Link,
                            Position = 4,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Greate Belt: Sporanlæg (Eftersyn og smøring af skinneudtraek - 2 måneder) menu",
                                E2EId = "greate-belt-pn-storebaelt-2-mdr",
                                DefaultLink = "/plugins/greate-belt-pn/report/storebaelt/2-mdr",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name = "Storebælt: Skinneudtræk (2 måneder)",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Storebælt: Skinneudtræk (2 måneder)",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                        new()
                        {
                            Name = "Greate Belt: Tilstandsrapport menu",
                            E2EId = "greate-belt-pn-report-storebaelt",
                            Link = "/plugins/greate-belt-pn/report/storebaelt/tr",
                            Type = MenuItemTypeEnum.Link,
                            Position = 0,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Greate Belt: Tilstandsrapport menu",
                                E2EId = "greate-belt-pn-storebaelt-2-mdr",
                                DefaultLink = "/plugins/greate-belt-pn/report/storebaelt/tr",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name = "Storebælt: Tilstandsrapport",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Storebælt: Tilstandsrapport",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                        new()
                        {
                            Name = "Greate Belt: Sporskifteeftersyn menu",
                            E2EId = "greate-belt-pn-report-storebaelt",
                            Link = "/plugins/greate-belt-pn/report/storebaelt/sse",
                            Type = MenuItemTypeEnum.Link,
                            Position = 1,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Greate Belt: Sporskifteeftersyn menu",
                                E2EId = "greate-belt-pn-storebaelt-2-mdr",
                                DefaultLink = "/plugins/greate-belt-pn/report/storebaelt/sse",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name = "Storebælt: Sporskifteeftersyn",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Storebælt: Sporskifteeftersyn",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                        new()
                        {
                            Name = "Greate Belt: Sporanlæg (Eftersyn og kontrol af gennemgående og centralsikrede spor) menu",
                            E2EId = "greate-belt-pn-report-storebaelt",
                            Link = "/plugins/greate-belt-pn/report/storebaelt/saekcsltf",
                            Type = MenuItemTypeEnum.Link,
                            Position = 2,
                            MenuTemplate = new PluginMenuTemplateModel
                            {
                                Name = "Greate Belt: Sporanlæg (Eftersyn og kontrol af gennemgående og centralsikrede spor) menu",
                                E2EId = "greate-belt-pn-storebaelt-2-mdr",
                                DefaultLink = "/plugins/greate-belt-pn/report/storebaelt/saekcsltf",
                                Translations = new List<PluginMenuTranslationModel>
                                {
                                    new()
                                    {
                                        LocaleName = LocaleNames.English,
                                        Name =
                                            "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                        Language = LanguageNames.English,
                                    },
                                    new()
                                    {
                                        LocaleName = LocaleNames.Danish,
                                        Name = "Storebælt: Sporanlæg (Eftersyn og kontrol af gennemgående og centralsikrede spor)",
                                        Language = LanguageNames.Danish,
                                    },
                                }
                            },
                            Translations = new List<PluginMenuTranslationModel>
                            {
                                new()
                                {
                                    LocaleName = LocaleNames.English,
                                    Name =
                                        "Greate Belt: Track system (Inspection and lubrication of rail extraction - 14 days) menu",
                                    Language = LanguageNames.English,
                                },
                                new()
                                {
                                    LocaleName = LocaleNames.Danish,
                                    Name = "Storebælt: Sporanlæg (Eftersyn og kontrol af gennemgående og centralsikrede spor)",
                                    Language = LanguageNames.Danish,
                                },
                            }
                        },
                    }
                }
            };

            return pluginMenu;
        }

        public MenuModel HeaderMenu(IServiceProvider serviceProvider)
        {
            var localizationService = serviceProvider
                .GetService<IGreateBeltLocalizationService>();

            var result = new MenuModel();
            result.LeftMenu.Add(new MenuItemModel
            {
                Name = localizationService.GetString("Greate Belt"),
                E2EId = "greate-belt-pn-storebaelt",
                Link = "",
                MenuItems = new List<MenuItemModel>
                {
                    new()
                    {
                        Name = localizationService.GetString(
                            "Greate Belt: Sporanlæg (Eftersyn og smøring af skinneudtraek - 14 dags) menu"),
                        E2EId = "greate-belt-pn-report-storebaelt",
                        Link = "/plugins/greate-belt-pn/report/storebaelt/14-dags",
                        Position = 0,
                    },
                }
            });
            result.LeftMenu.Add(new MenuItemModel
            {
                Name = localizationService.GetString("Øresund"),
                E2EId = "greate-belt-pn-oresund",
                Link = "",
                MenuItems = new List<MenuItemModel>
                {
                    new()
                    {
                        Name = localizationService.GetString(
                            "Øresund: Sporanlæg (Eftersyn og smøring af skinneudtraek - 14 dags) menu"),
                        E2EId = "greate-belt-pn-report-oresund",
                        Link = "/plugins/greate-belt-pn/report/oresund/14-dags",
                        Position = 0,
                    },
                }
            });
            return result;
        }

        public void SeedDatabase(string connectionString)
        {
        }

        public PluginPermissionsManager GetPermissionsManager(string connectionString)
        {
            return null;
        }
    }
}