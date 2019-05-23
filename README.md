| CI | CD |
|----|----|
| [![Build Status](https://dev.azure.com/azure-sdk/public/_apis/build/status/tools/public.git-rest-api.ci?branchName=master)](https://dev.azure.com/azure-sdk/public/_build/latest?definitionId=444&branchName=master) |  [![Build Status](https://dev.azure.com/azure-sdk/public/_apis/build/status/tools/Azure.git-rest-api%20Build?branchName=master)](https://dev.azure.com/azure-sdk/public/_build/latest?definitionId=445&branchName=master) |

# Start

1. Install dependencies
```bash
npm install
```

2. Run
```bash
npm start           # To run once
npm start:watch     # To run and restart when there is a change
```

Run in vscode

Instead of `npm start` run `npm build:watch` and in vscode press `F5`

# Windows

* Long path issue. libgit2(library behind nodegit) doesn't support windows long path feature. Which means some repo with long reference might not work on windows. You can test with other simpler repos on windows. You should however not use this in production on windows.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
