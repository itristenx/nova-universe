# Quickstart

Follow these steps to get CueIT running quickly.

## 1. Install

Use the installer script for your operating system:

- **macOS** – run `./installers/make-installer.sh` to create `CueIT-<version>.pkg` and then open the package.
- **Windows** – run `./installers/make-windows-installer.ps1 -Version <version>` to build `CueIT-<version>.exe` and execute it.
- **Linux** – run `./installers/make-linux-installer.sh <version>` to build an AppImage and launch it.

After installation you can launch **CueIT** from `/Applications` on macOS, from the Start Menu on Windows and by running the AppImage on Linux. See the [macOS launcher](../README.md#macos-launcher) section for details.

All installer scripts are located under the `installers/` directory. On macOS you can remove the application with `./installers/uninstall-macos.sh` and upgrade it with `./installers/upgrade-macos.sh`. See [installers.md](installers.md) for more options.
These scripts package the SwiftUI launcher along with the API and web apps.

## 2. Configure

After installing or cloning the repository, copy `.env.local.example` to `.env.local` and run `./scripts/init-env.sh` to generate the `.env` files for each service. Edit them as needed. See [Local vs Production Setup](environments.md) for details on every variable.
Set `SLACK_WEBHOOK_URL` in `cueit-api/.env` if you want notification events posted to Slack.

## 3. Launch Services

You can start all services from the command line:

```bash
./installers/start-all.sh
```

On Windows use `start-all.ps1` instead. The packaged launcher app created above also runs the same script in the background so you can start everything with a single click.
