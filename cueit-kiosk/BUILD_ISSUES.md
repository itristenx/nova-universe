# CueIT Kiosk Build Issues

## Info.plist Conflict Resolution

The project currently has a conflict where Xcode is set to both:
1. Generate an Info.plist file automatically (`GENERATE_INFOPLIST_FILE = YES`)
2. Use an existing manual Info.plist file in the project

### To Fix:

1. Open the CueIT Kiosk project in Xcode
2. Select the project file in the navigator
3. Select the "CueIT Kiosk" target
4. Go to "Build Settings"
5. Search for "Generate Info.plist File"
6. Set it to "No" for both Debug and Release configurations
7. Search for "Info.plist File"
8. Set the path to: `CueIT Kiosk/Info.plist`

### Alternative Quick Fix:

Run the provided clean build script to clear derived data:
```bash
./clean-build.sh
```

This will clean the build cache and should resolve the immediate build issues.

### Configuration Values in Info.plist:

The Info.plist file contains important configuration:
- `API_BASE_URL`: The base URL for the CueIT API
- `SCIM_URL`: Optional SCIM directory integration URL  
- `KIOSK_TOKEN`: Authentication token for kiosk operations

Update these values as needed for your environment.
