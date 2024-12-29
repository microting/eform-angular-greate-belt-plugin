FROM node:20-bookworm-slim as node-env
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY eform-angular-frontend/eform-client ./
RUN yarn install
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0-noble AS build-env
WORKDIR /app
ARG GITVERSION
ARG PLUGINVERSION
ARG PLUGIN4VERSION

# Copy csproj and restore as distinct layers
COPY eform-angular-frontend/eFormAPI/eFormAPI.Web ./eFormAPI.Web
COPY eform-angular-items-planning-plugin/eFormAPI/Plugins/ItemsPlanning.Pn ./ItemsPlanning.Pn
COPY eform-angular-greate-belt-plugin/eFormAPI/Plugins/GreateBelt.Pn ./GreateBelt.Pn
RUN dotnet publish eFormAPI.Web -o eFormAPI.Web/out /p:Version=$GITVERSION --runtime linux-x64 --configuration Release
RUN dotnet publish ItemsPlanning.Pn -o ItemsPlanning.Pn/out /p:Version=$PLUGINVERSION --runtime linux-x64 --configuration Release
RUN dotnet publish GreateBelt.Pn -o GreateBelt.Pn/out /p:Version=$PLUGIN4VERSION --runtime linux-x64 --configuration Release

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble
WORKDIR /app
COPY --from=build-env /app/eFormAPI.Web/out .
RUN mkdir -p ./Plugins/ItemsPlanning.Pn
RUN mkdir -p ./Plugins/GreateBelt.Pn
COPY --from=build-env /app/ItemsPlanning.Pn/out ./Plugins/ItemsPlanning.Pn
COPY --from=build-env /app/GreateBelt.Pn/out ./Plugins/GreateBelt.Pn
COPY --from=node-env /app/dist wwwroot

ENV DEBIAN_FRONTEND noninteractive
ENV Logging__Console__FormatterName=

ENTRYPOINT ["dotnet", "eFormAPI.Web.dll"]
