<h1 align="center">
  Medusa Avalara Plugin
</h1>

<p align="center">
  <a href="https://u11d.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://u11d.com/static/u11d-white-b0b10621fc20805805f23cd6b8c349e0.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://u11d.com/static/u11d-color-136ce418fbbb940b43748ef1bef30220.svg">
      <img alt="u11d logo" src="https://u11d.com/static/u11d-white-b0b10621fc20805805f23cd6b8c349e0.svg" width="120" height="40">
    </picture>
  </a>
  <a href="https://www.medusajs.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
      <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg" width="120" height="40">
    </picture>
  </a>
  <a href="https://www.avalara.com">
    <img alt="Avalara logo" src="https://www.avalara.com/content/experience-fragments/avalara-com/navigation/global/header/us/master/_jcr_content/root/header_copy_copy_cop/image.cmpimage.svg/1743782062550/avalara-logo.svg" width="120" height="40">
  </a>
</p>

<p align="center">
  A Medusa plugin for integrating Avalara AvaTax as a tax provider, enabling automated tax calculations and compliance for your ecommerce store.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@u11d/medusa-avalara">
    <img src="https://img.shields.io/npm/v/@u11d/medusa-avalara.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/@u11d/medusa-avalara">
    <img src="https://img.shields.io/npm/dw/@u11d/medusa-avalara.svg" alt="NPM Weekly Downloads" />
  </a>
  <a href="https://github.com/u11d-com/medusa-avalara">
    <img src="https://img.shields.io/github/stars/u11d-com/medusa-avalara.svg" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/u11d-com/medusa-avalara/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="License" />
  </a>
  <a href="https://docs.medusajs.com">
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

## 🏗️ Module Architecture

Due to Medusa's module isolation and dependency injection system, each module must be registered separately with its dependencies:

- **`avalara-product` module**: Manages product-specific tax codes
- **`avatax-factory` module**: Creates and configures AvaTax client instances
- **`avatax` provider**: Implements the Medusa tax provider interface

Each module requires the `CACHE` dependency for mapping products to Avalara tax codes.

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
