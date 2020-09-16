# GithubStats Contributor Guide

Contributions to GithubStats, whether new features or bug fixes, are deeply appreciated and benefit the whole user community.

The following guidelines help ensure the smooth running of the project, and keep a consistent standard across the codebase. They are guidelines only - should you feel a need to deviate from them it is probably for a good reason - but please adhere to them as closely as possible.

If you'd like to contribute code or documentation to GithubStats, we welcome pull requests.

## Code of Conduct

It is expected that all contributors follow the [code of conduct](CODE_OF_CONDUCT.md).

## Process

- **File an issue.** Either suggest a feature or note a defect. If it's a feature, explain the challenge you're facing and how you think the feature should work. If it's a defect, include a description and reproduction.
- **Design discussion.** For new features, some discussion on the issue will take place to determine if it's something that should be included in GithubStats. For defects, discussion may happen around whether the issue is truly a defect or if the behavior is correct.
- **Pull request.** Create [a pull request](https://help.github.com/articles/using-pull-requests/) on the `develop` branch of the repository to submit changes to the code based on the information in the issue ( for each pull request a feature or bug reports needs to be filled to simply tracking changed for release). Pull requests need to pass the CI build and follow coding standards. See below for more on coding standards in use with GithubStats. Note all pull requests should include accompanying unit tests to verify the work.
- **Code review.** Some iteration may take place requiring updates to the pull request (e.g., to fix a typo or add error handling).
- **Pull request acceptance.** The pull request will be accepted into the `develop` branch and pushed to `master` with the next release.

## License

By contributing to GithubStats, you assert that:

1. The contribution is your own original work.
2. You have the right to assign the *copyright* for the work (it is not owned by your employer, or you have been given copyright assignment in writing).
3. You license it under the terms applied to the rest of the GithubStats project.

### Workflow

GithubStats follows the [Gitflow workflow process](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow/) for handling releases. This means active development is done on the `develop` branch and we push to `master` when it's release time. **If you're creating a pull request or contribution, please do it on the `develop` branch.** We can then build, test, and release to when everything's verified.

We use [semantic versioning](https://semver.org/) for our project versions.


### Breaking Changes

A breaking change can be a lot of things:

- Change a type's namespace.
- Remove or rename a method on a class or interface.
- Move an extension method from one static class to a different static class.
- Add an optional parameter to an existing method.
- Add a new abstract method to an existing abstract class.
- Add a new member on an interface.

### Dependencies

- Projects should be able to be built straight out of Git (no additional installation needs to take place on the developer's machine). This means package references, not installation of required components.
- Any third-party libraries consumed by GithubStats integration must have licenses compatible with GithubStats it's license.

### Code Documentation

**The Golden Rule of Documentation: Write the documentation you'd want to read.** Every developer has seen self explanatory docs and wondered why there wasn't more information. (Parameter: "index." Documentation: "The index.") Please write the documentation you'd want to read if you were a developer first trying to understand how to make use of a feature.
