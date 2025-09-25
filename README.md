<h1 align="center">
  Medusa Avalara Plugin
</h1>

<p align="center">
  <a href="https://u11d.com" style="text-decoration: none !important;">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://u11d.com/static/u11d-white-b0b10621fc20805805f23cd6b8c349e0.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://u11d.com/static/u11d-color-136ce418fbbb940b43748ef1bef30220.svg">
      <img alt="u11d logo" src="https://u11d.com/static/u11d-white-b0b10621fc20805805f23cd6b8c349e0.svg" width="120" height="40">
    </picture>
  </a>
  <a href="https://www.medusajs.com" style="text-decoration: none !important;">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
      <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg" width="120" height="40">
    </picture>
  </a>
  <a href="https://www.avalara.com" style="text-decoration: none !important;">
    <img alt="Avalara logo" src="https://www.avalara.com/content/experience-fragments/avalara-com/navigation/global/header/us/master/_jcr_content/root/header_copy_copy_cop/image.cmpimage.svg/1743782062550/avalara-logo.svg" width="120" height="40">
  </a>
</p>

<p align="center">
  A Medusa plugin for integrating Avalara AvaTax as a tax provider, enabling automated tax calculations and compliance for your ecommerce store.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@u11d/medusa-avalara" style="text-decoration: none !important;">
    <img src="https://img.shields.io/npm/v/@u11d/medusa-avalara.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/@u11d/medusa-avalara" style="text-decoration: none !important;">
    <img src="https://img.shields.io/npm/dw/@u11d/medusa-avalara.svg" alt="NPM Weekly Downloads" />
  </a>
  <a href="https://github.com/u11d-com/medusa-avalara" style="text-decoration: none !important;">
    <img src="https://img.shields.io/github/stars/u11d-com/medusa-avalara.svg" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/u11d-com/medusa-avalara/blob/main/LICENSE" style="text-decoration: none !important;">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="License" />
  </a>
  <a href="https://docs.medusajs.com" style="text-decoration: none !important;">
    <img src="https://img.shields.io/badge/Medusa-2.4.0+-9333ea.svg" alt="Medusa Version" />
  </a>
</p>

## 🚀 Quick Start

### Installation

```bash
# npm
npm install @u11d/medusa-avalara
# yarn
yarn add @u11d/medusa-avalara
```

### Basic Configuration

Add the plugin to your Medusa config file (`medusa-config.ts`):

```typescript
import { defineConfig, Modules } from "@medusajs/framework/utils";
import { AvalaraPluginOptions } from "@u11d/medusa-avalara";

const options: AvalaraPluginOptions = {
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
    throwErrorIfMissing: false,
  },
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

> **Important Notes:**
>
> - Each module must be registered separately due to Medusa's module isolation
> - You can use environment variables instead of hardcoding options, especially important for credentials like `accountId` and `licenseKey`
> - The example above will use `P0000000` for each product. See [Advanced Usage](#-advanced-usage) for assigning specific tax codes to individual products
> - The `shipFromAddress` should reflect your Avalara configuration - ensure it matches the address configured in your Avalara account for accurate tax calculations

### Run Database Migration

After configuring your Medusa setup, run the database migration to create the required tables:

```bash
npx medusa db:migrate
```

### Enable AvaTax Provider

After starting your Medusa server:

1. Go to your admin panel
2. Navigate to **Settings** > **Tax Regions**
3. Select a tax region and **edit** it
4. Select **Avalara** as your tax provider
5. Save the configuration

## 📋 Configuration Options

### Client Options (`client`)

| Option        | Type                        | Required | Default              | Description                 |
| ------------- | --------------------------- | -------- | -------------------- | --------------------------- |
| `accountId`   | `string`                    | ✅       | -                    | Your Avalara account ID     |
| `licenseKey`  | `string`                    | ✅       | -                    | Your Avalara license key    |
| `environment` | `"sandbox" \| "production"` | ✅       | -                    | AvaTax environment          |
| `companyCode` | `string`                    | ✅       | -                    | Your company code in AvaTax |
| `appName`     | `string`                    | ❌       | `MedusaAvaTaxPlugin` | Custom app name             |
| `appVersion`  | `string`                    | ❌       | Plugin version       | Custom app version          |
| `machineName` | `string`                    | ❌       | `MedusaServer`       | Machine identifier          |

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

| Option                | Type      | Required | Default      | Description                               |
| --------------------- | --------- | -------- | ------------ | ----------------------------------------- |
| `default`             | `string`  | ❌       | `"P0000000"` | Default tax code for products             |
| `shipping`            | `string`  | ❌       | `"FR020100"` | Tax code for shipping                     |
| `throwErrorIfMissing` | `boolean` | ❌       | `true`       | Throw error if product tax code not found |

## 🎯 Advanced Usage

### Using Different Tax Codes for Products

By default, all products will use the `taxCodes.default` value. To assign specific Avalara tax codes to individual products:

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

### Error Handling

Setting `throwErrorIfMissing: true` (recommended) ensures that:

- Missing tax codes for products will throw errors during checkout
- You'll be notified of configuration issues early
- Tax compliance is maintained

Setting `throwErrorIfMissing: false` will:

- Use the default tax code for products without specific codes
- Allow checkout to proceed even with missing configurations
- May lead to incorrect tax calculations

## ⚙️ How it works?

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

- Tax calculation provider implementation (note: cannot use `avatax-factory` due to Medusa's module isolation)
- Skips tax calculation if shipping address is not provided
- Retrieves `avalara_tax_code` from cache; uses default tax code or throws error if not found
- Makes API calls to AvaTax to create `SalesOrder` entities (temporary entities for dynamic cart tax calculations)
- The `getTaxLines` method handles tax rate calculations using the AvaTax API

### Order Lifecycle Integration

**Subscribers and Workflows:**

- **orderPlacedHandler**: Creates Sales Invoices (permanent entities representing finalized transactions in Avalara)
- **orderCanceledHandler**: Voids the transaction in Avalara
- **orderCompletedHandler**: Commits the transaction in Avalara

This architecture ensures accurate tax calculations during checkout and proper transaction lifecycle management in Avalara's system.

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
