# Contributing to Nova Universe

First off, thank you for considering contributing to Nova Universe! It's people like you that make Nova Universe such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [Nova Universe Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainer email].

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for Nova Universe. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report:**
- Check the debugging guide (if available)
- Check the [issues](https://github.com/itristenx/nova-universe/issues) for a list of common questions and problems.
- Perform a [cursory search](https://github.com/itristenx/nova-universe/issues) to see if the problem has already been reported.

**How Do I Submit A (Good) Bug Report?**

Bugs are tracked as [GitHub issues](https://github.com/itristenx/nova-universe/issues). Create an issue using the Bug Report template and provide the following information:

- Use a clear and descriptive title
- Describe the exact steps which reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots and animated GIFs if helpful

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Nova Universe, including completely new features and minor improvements to existing functionality.

**Before Submitting An Enhancement Suggestion:**
- Check if the enhancement has already been suggested
- Perform a [cursory search](https://github.com/itristenx/nova-universe/issues) to see if the enhancement has already been suggested

**How Do I Submit A (Good) Enhancement Suggestion?**

Enhancement suggestions are tracked as [GitHub issues](https://github.com/itristenx/nova-universe/issues). Create an issue using the Feature Request template and provide the following information:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead
- Explain why this enhancement would be useful

### Your First Code Contribution

Unsure where to begin contributing to Nova Universe? You can start by looking through these `beginner` and `help-wanted` issues:

- [Beginner issues](https://github.com/itristenx/nova-universe/labels/beginner) - issues which should only require a few lines of code, and a test or two.
- [Help wanted issues](https://github.com/itristenx/nova-universe/labels/help%20wanted) - issues which should be a bit more involved than `beginner` issues.

### Pull Requests

The process described here has several goals:

- Maintain Nova Universe's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible Nova Universe
- Enable a sustainable system for Nova Universe's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in [the template](PULL_REQUEST_TEMPLATE.md)
2. Follow the [styleguides](#styleguides)
3. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript Styleguide

All JavaScript code should adhere to the existing code style in the project. We use:

- 2 spaces for indentation
- Semicolons where appropriate
- Single quotes for strings
- Meaningful variable and function names

### Documentation Styleguide

- Use [Markdown](https://daringfireball.net/projects/markdown/)
- Reference functions and classes in backticks

## Development Environment Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/nova-universe.git`
3. Navigate to the directory: `cd nova-universe`
4. Install dependencies: `npm install`
5. Run the setup script: `./installers/setup.sh`
6. Initialize environment files: `./scripts/init-env.sh`

### Running Tests

- Root tests: `npm test`
- API tests: `cd cueit-api && npm test`
- Admin UI tests: `cd cueit-admin && npm test`
- Kiosk tests: `cd cueit-kiosk && npm test`
- Slack tests: `cd cueit-slack && npm test`

### Component Structure

Nova Universe consists of several components:

- **cueit-api** - Express/SQLite API backend
- **cueit-admin** - React admin interface 
- **cueit-kiosk** - iPad kiosk application
- **cueit-slack** - Slack integration service
- **cueit-macos** - macOS launcher application

Each component has its own dependencies and can be developed independently.

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

#### Type of Issue and Issue State

- `enhancement` - Feature requests
- `bug` - Confirmed bugs or reports that are very likely to be bugs
- `question` - Questions more than bug reports or feature requests
- `feedback` - General feedback more than bug reports or feature requests
- `help-wanted` - The Nova Universe core team would appreciate help from the community in resolving these issues
- `beginner` - Less complex issues which would be good first issues to work on for users who want to contribute
- `more-information-needed` - More information needs to be collected about these problems or feature requests

#### Component Labels

- `api` - Related to the cueit-api component
- `admin` - Related to the cueit-admin component  
- `kiosk` - Related to the cueit-kiosk component
- `slack` - Related to the cueit-slack component
- `macos` - Related to the cueit-macos component
- `documentation` - Related to any type of documentation
- `ci` - Related to continuous integration

Thank you for contributing to Nova Universe! 🚀