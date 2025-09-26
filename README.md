<h1 align="center">
  Medusa Avalara Plugin
</h1>

<!-- Prettier is ignored here for correct rendering in GitHub -->
<p align="center">
<a href="https://u11d.com"><picture><source media="(prefers-color-scheme: dark)" srcset="https://u11d.com/static/u11d-white-b0b10621fc20805805f23cd6b8c349e0.svg"><source media="(prefers-color-scheme: light)" srcset="https://u11d.com/static/u11d-color-136ce418fbbb940b43748ef1bef30220.svg"><img alt="u11d logo" src="https://u11d.com/static/u11d-white-b0b10621fc20805805f23cd6b8c349e0.svg" width="120" height="40"></picture></a>
<a href="https://www.medusajs.com"><picture><source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg"><source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg"><img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg" width="120" height="40"></picture></a>
<a href="https://www.avalara.com"><img alt="Avalara logo" src="https://www.avalara.com/content/experience-fragments/avalara-com/navigation/global/header/us/master/_jcr_content/root/header_copy_copy_cop/image.cmpimage.svg/1743782062550/avalara-logo.svg" width="120" height="40"></a>
</p>

<p align="center">
  A Medusa plugin for integrating Avalara AvaTax as a tax provider, enabling automated tax calculations and compliance for your e-commerce store.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@u11d/medusa-avalara"><img src="https://img.shields.io/npm/v/@u11d/medusa-avalara.svg" alt="NPM Version"/></a>
  <a href="https://www.npmjs.com/package/@u11d/medusa-avalara"><img src="https://img.shields.io/npm/dw/@u11d/medusa-avalara.svg" alt="NPM Weekly Downloads" /></a>
  <a href="https://github.com/u11d-com/medusa-avalara"><img src="https://img.shields.io/github/stars/u11d-com/medusa-avalara.svg" alt="GitHub Stars" /></a>
  <a href="https://github.com/u11d-com/medusa-avalara/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="License" /></a>
  <a href="https://docs.medusajs.com"><img src="https://img.shields.io/badge/Medusa-2.8.0+-9333ea.svg" alt="Medusa Version" /></a>
</p>

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📋 Configuration Options](#-configuration-options)
- [🎯 Advanced Usage](#-advanced-usage)
- [⚙️ How the plugin works?](#️-how-the-plugin-works)
- [🔧 Troubleshooting](#-troubleshooting)
- [✋ Need help?](#-need-help)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

- **Real-time Tax Calculations**: Automatically calculate accurate taxes during checkout using Avalara's AvaTax API
- **Order Transaction Management**: Create AvaTax transactions when orders are placed for proper tax recording
- **Transaction Lifecycle Tracking**:
  - Commit transactions when orders are completed/fulfilled
  - Void transactions when orders are canceled
- **Flexible Configuration**: Support for custom shipping addresses and tax codes

## 🚀 Quick Start

### 1. Installation

```bash
# npm
npm install @u11d/medusa-avalara
# yarn
yarn add @u11d/medusa-avalara
```

### 2. Basic Medusa Config

Add the plugin to your Medusa config file (`medusa-config.ts`) using the `withAvalaraPlugin` helper:

```typescript
import { defineConfig } from "@medusajs/framework/utils";
import { withAvalaraPlugin, AvalaraPluginOptions } from "@u11d/medusa-avalara";

const avalaraPluginOptions: AvalaraPluginOptions = {
  client: {
    accountId: "YOUR_ACCOUNT_ID",
    licenseKey: "YOUR_LICENSE_KEY",
    environment: "sandbox",
    companyCode: "DEFAULT",
  },
  shipFromAddress: {
    line1: "512 S Mangum St Ste 100",
    city: "Durham",
    region: "NC",
    country: "US",
    postalCode: "27701-3973",
  },
  taxCodes: {
    shipping: "FR020100",
    default: "PC040100", // Clothing and related products (business-to-customer)-general
  },
};

module.exports = defineConfig(
  withAvalaraPlugin(
    {
      projectConfig: {
        // your project config
      },
      plugins: [
        // other plugins
      ],
      modules: [
        // your modules
      ],
    },
    avalaraPluginOptions
  )
);
```

> **Important Notes:**
>
> - The `withAvalaraPlugin` wrapper handles plugin modules registration and dependency injection automatically. See [Manual Module Registration](#manual-module-registration) section if you need to understand what the helper does or configure modules manually
> - You can use environment variables instead of hardcoding options, especially important for credentials like `accountId` and `licenseKey`
> - The example above will use `PC040100` for each product. See [Advanced Usage](#-advanced-usage) for assigning specific tax codes to individual products
> - The `shipFromAddress` should reflect your Avalara configuration - ensure it matches the address configured in your Avalara account for accurate tax calculations

### 3. Run Database Migration

After configuring your Medusa setup, run the database migration to create the required tables:

```bash
npx medusa db:migrate
```

### 4. Enable AvaTax Provider

After starting your Medusa server:

1. Go to your admin panel (locally available at `http://localhost:9000/app` by default)
2. Navigate to **Settings** > **Tax Regions**
3. Select a tax region and **edit** it
4. Select **Avalara** as your tax provider
5. Save the configuration

## 📋 Configuration Options

### Client Options (`client`)

| Option        | Type                        | Required | Description                 |
| ------------- | --------------------------- | -------- | --------------------------- |
| `accountId`   | `string`                    | ✅       | Your Avalara account ID     |
| `licenseKey`  | `string`                    | ✅       | Your Avalara license key    |
| `environment` | `"sandbox" \| "production"` | ✅       | AvaTax environment          |
| `companyCode` | `string`                    | ✅       | Your company code in AvaTax |
| `appName`     | `string`                    | ❌       | Custom app name             |
| `appVersion`  | `string`                    | ❌       | Custom app version          |
| `machineName` | `string`                    | ❌       | Machine identifier          |

### Ship From Address (`shipFromAddress`)

| Option       | Type     | Required             | Description               |
| ------------ | -------- | -------------------- | ------------------------- |
| `line1`      | `string` | ✅                   | Street address line 1     |
| `line2`      | `string` | ❌                   | Street address line 2     |
| `city`       | `string` | ✅                   | City name                 |
| `region`     | `string` | ⚠️ (required for US) | State/province code       |
| `country`    | `string` | ✅                   | ISO 2-letter country code |
| `postalCode` | `string` | ✅                   | Postal/ZIP code           |

### Tax Codes (`taxCodes`)

| Option     | Type     | Required | Default      | Description                   |
| ---------- | -------- | -------- | ------------ | ----------------------------- |
| `default`  | `string` | ❌       | `"P0000000"` | Default tax code for products |
| `shipping` | `string` | ❌       | `"FR020100"` | Tax code for shipping         |

## 🎯 Advanced Usage

### Using Different Tax Codes for Products

In most e-commerce scenarios, different products require different tax codes based on their category, material, or intended use. The plugin uses the `avalara_product` table to determine which specific Avalara tax code should be applied to each product during tax calculations. You can manage these product-specific tax codes either by updating the database table directly or by using the provided admin API endpoint.

You can find the complete list of available Avalara tax codes at: https://taxcode.avatax.avalara.com/

By default, all products will use the `taxCodes.default` value. Make `PUT /admin/avalara-products` to assign specific Avalara tax codes to individual products.

```bash
curl -X PUT http://localhost:9000/admin/avalara-products
  -H "Content-Type: application/json"
  -d '{
    "avalara_products": [
      {
        "product_id": "prod_123",
        "avalara_tax_code": "PC040100"
      },
      {
        "product_id": "prod_456",
        "avalara_tax_code": "PS081000"
      }
    ]
  }'
```

### Manual Module Registration

If you prefer to configure modules manually without using the `withAvalaraPlugin` wrapper, you can register each module individually:

```typescript
import { defineConfig, Modules } from "@medusajs/framework/utils";
import { AvalaraPluginOptions } from "@u11d/medusa-avalara";

const options: AvalaraPluginOptions = {
  // your options here
};

module.exports = defineConfig({
  plugins: ["@u11d/medusa-avalara"],
  modules: [
    {
      resolve: "@u11d/medusa-avalara/modules/avalara-product",
      dependencies: [Modules.CACHE],
    },
    {
      resolve: "@u11d/medusa-avalara/modules/avatax-factory",
      options,
      dependencies: [Modules.CACHE],
    },
    {
      resolve: "@medusajs/medusa/tax",
      options: {
        providers: [
          {
            resolve: "@u11d/medusa-avalara/providers/avatax",
            options,
          },
        ],
      },
      dependencies: [Modules.CACHE],
    },
  ],
});
```

> **Note:** Manual registration requires careful attention to module dependencies and isolation. The `withAvalaraPlugin` wrapper is recommended as it handles these complexities automatically.

## ⚙️ How the plugin works?

The Medusa Avalara plugin integrates with Avalara's AvaTax service through a modular architecture:

### Core Components

**modules/avalara-product**

- Manages product-specific tax codes through the `AvalaraProduct` model and database migration
- Used by the `/admin/avalara-products` API endpoint
- Saves mapping of `product_id` → `avalara_tax_code` in cache for fast retrieval by the AvaTax provider

**modules/avatax-factory**

- Provides AvaTax client configured with plugin options
- Validates plugin options and credentials
- Validates communication with Avalara to ensure credentials are correct (validation happens in loader)

**providers/avatax**

- Tax calculation provider implementation (separate from `avatax-factory` due to Medusa's module isolation requirements)
- Skips tax calculation if shipping address is not provided
- Retrieves `avalara_tax_code` from cache; uses default tax code or throws error if not found
- Makes API calls to AvaTax to create `SalesOrder` entities (temporary entities for dynamic cart tax calculations)
- The `getTaxLines` method handles tax rate calculations using the AvaTax API

### Order Lifecycle Integration

**Subscribers and Workflows:**

- **orderPlacedHandler**: Creates Sales Invoices (permanent entities representing finalized transactions in Avalara)
- **orderCanceledHandler**: Voids the transaction in Avalara
- **orderCompletedHandler**: Commits the transaction in Avalara

This architecture ensures accurate tax calculations during checkout and proper transaction lifecycle management in Avalara's system. The `withAvalaraPlugin` wrapper simplifies the setup by automatically configuring all these modules with proper dependencies and isolation.

## 🔧 Troubleshooting

### Migration Error: "relation 'public.avalara_product' does not exist"

If you encounter this error:

```
error: Failed to feed cache. Error: select "a0".* from "public"."avalara_product" as "a0" where "a0"."deleted_at" is null order by "a0"."created_at" desc limit 1000 - relation "public.avalara_product" does not exist. Please make sure migration adding avalara_product table has been run and cache module is injected to the module via medusa-config
```

**Solution:** Run the database migration:

```bash
npx medusa db:migrate
```

This ensures the `avalara_product` table is created and the cache module is properly configured.

### Tax calculations returning $0

If you're seeing $0 tax amounts in your calculations, follow these troubleshooting steps:

1. **Check application logs** for any error messages or warnings related to AvaTax API calls
2. **Verify shipping address** - tax calculation is skipped if no valid shipping address is provided
3. **Validate Avalara account configuration**:
   - Ensure your company location is properly configured in your Avalara account
   - Verify that tax jurisdictions are set up correctly for your business locations
   - Check that your company has nexus configured for the relevant states/regions
4. **Test tax calculation directly in Avalara**:
   - Log into your Avalara account
   - Use the AvaTax API testing tools to verify tax calculations work with your setup
   - Test with the same addresses and product codes you're using in Medusa
5. **Review tax codes**:
   - Ensure products have valid Avalara tax codes assigned
   - Verify that the tax codes are appropriate for your products and jurisdiction
6. **Check environment settings**:
   - Confirm you're using the correct environment (sandbox vs production)
   - Verify your API credentials are valid and have the necessary permissions

## ✋ Need help?

If you encounter any issues or need assistance with this plugin, please visit our [GitHub Issues](https://github.com/u11d-com/medusa-avalara/issues) page. Our team actively monitors and responds to bug reports, feature requests, and questions from the community. We aim to provide timely support to ensure your integration with Avalara runs smoothly.

Need expert assistance or want our team to support your Medusa project? We're here to help! Contact us at [https://u11d.com/contact/](https://u11d.com/contact/) for professional support and consultation services.

<!--
## 📖 Learn More

Read our comprehensive blog article about integrating Avalara with Medusa: **URL coming soon**
-->

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
