# Contributing

Thanks for your interest in contributing to `@u11d/medusa-avalara`. We welcome
bug reports, improvements, documentation fixes, and new features. This guide
explains how to get started and the workflow we prefer for contributions.

## Getting started (local dev)

Prerequisites:

- Node.js 20+ (see `engines` in `package.json`)
- Yarn or npm
- A running Medusa project when testing the plugin locally

Basic steps:

1. Fork the repository and clone your fork.
2. Run and publish plugin locally as described in [Medusa docs](https://docs.medusajs.com/learn/fundamentals/plugins/create#3-publish-plugin-locally-for-development-and-testing)
3. Use the plugin in a local Medusa project

## Reporting bugs

- Search existing issues before filing a new one.
- Provide a clear title and a reproducible description.
- Include environment details: Node.js version, Medusa version, plugin
  configuration (redact any secrets), and steps to reproduce.
- If the issue relates to tax calculations, please include:
  - Ship-from address used in your configuration
  - Tax codes being used (product-specific or default)
  - Customer shipping address (you can anonymize specific details but keep region/country for tax jurisdiction context)

## Suggesting enhancements

Feature requests are welcome. Please include a clear motivation, examples of
usage, and any backward-compatibility considerations.

## Pull request workflow

1. Create a feature branch from `main`.
2. Keep changes focused; one logical change per PR if possible.
3. Run linters, type checks, and build locally.
4. Open a PR against upstream `main` with a descriptive title and summary.

## Coding style

- This project uses TypeScript. Keep types explicit for exported APIs.
- Prefer small, well-tested functions over large, complex ones.
- Follow existing code conventions used in the repository.

## Communication

The best place to ask questions is in GitHub Issues. For commercial support or
professional services, see the project README for contact links.

Thanks for helping improve `@u11d/medusa-avalara` — your contributions are valued!
