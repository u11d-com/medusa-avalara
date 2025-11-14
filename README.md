<h1 align="center">
  Medusa Avalara Plugin
</h1>

<!-- Prettier is ignored here for correct rendering in GitHub -->
<p align="center">
<a href="https://u11d.com"><picture><source media="(prefers-color-scheme: dark)" srcset="https://u11d.com/static/u11d-white-b0b10621fc20805805f23cd6b8c349e0.svg"><source media="(prefers-color-scheme: light)" srcset="https://u11d.com/static/u11d-color-136ce418fbbb940b43748ef1bef30220.svg"><img alt="u11d logo" src="https://u11d.com/static/u11d-color-136ce418fbbb940b43748ef1bef30220.svg" width="120" height="40"></picture></a>
<a href="https://www.medusajs.com"><picture><source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg"><source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg"><img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg" width="120" height="40"></picture></a>
<a href="https://www.avalara.com"><img alt="Avalara logo" src="https://www.avalara.com/content/experience-fragments/avalara-com/navigation/global/header/us/master/_jcr_content/root/header_copy_copy_cop/image.cmpimage.svg/1743782062550/avalara-logo.svg" width="120" height="40"></a>
</p>

<p align="center">
  A <a href="https://www.medusajs.com">Medusa</a> plugin for integrating <a href="https://www.avalara.com">Avalara AvaTax</a> as a tax provider, enabling automated tax calculations and compliance for your e-commerce store. Created and maintained by <a href="https://u11d.com">u11d</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@u11d/medusa-avalara"><img src="https://img.shields.io/npm/v/@u11d/medusa-avalara.svg" alt="NPM Version"/></a>
  <a href="https://www.npmjs.com/package/@u11d/medusa-avalara"><img src="https://img.shields.io/npm/dm/@u11d/medusa-avalara.svg" alt="NPM Weekly Downloads" /></a>
  <a href="https://github.com/u11d-com/medusa-avalara"><img src="https://img.shields.io/github/stars/u11d-com/medusa-avalara.svg" alt="GitHub Stars" /></a>
  <a href="https://github.com/u11d-com/medusa-avalara/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="License" /></a>
  <a href="https://docs.medusajs.com"><img src="https://img.shields.io/badge/Medusa-2.8.0+-9333ea.svg" alt="Medusa Version" /></a>
</p>

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Advanced Usage](#advanced-usage)
- [How the plugin works?](#how-the-plugin-works)
- [Troubleshooting](#troubleshooting)
- [Need help?](#need-help)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time Tax Calculations**: Automatically calculate accurate taxes during checkout using Avalara's AvaTax API
- **Order Transaction Management**: Create AvaTax transactions when orders are placed for proper tax recording
- **Transaction Lifecycle Tracking**:
  - Commit transactions when orders are completed/fulfilled
  - Void transactions when orders are canceled
- **Flexible Configuration**: Support for custom tax codes, exemptions (entity use code) and shipping addresses.
- **Address Validation**: Validate and standardize shipping addresses using Avalara's address validation service

## Quick Start

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
  accountId: 0, // Your Avalara account ID
  licenseKey: "YOUR_LICENSE_KEY",
  environment: "sandbox",
  companyId: 0, // Your Avalara company ID
  companyCode: "DEFAULT",
  defaultTaxCode: "PC040100", // Clothing and related products (business-to-customer)-general
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
> - It's strongly recommended to call `POST /store/carts/${cartId}/taxes` ([docs](https://docs.medusajs.com/api/store#carts_postcartsidtaxes)) before checkout to ensure taxes are recalculated correctly. Medusa doesn't automatically recalculate taxes when cart properties change (quantity, address, discounts), which can lead to incorrect amounts. See [issue #13929](https://github.com/medusajs/medusa/issues/13929)
> - The `withAvalaraPlugin` wrapper handles plugin modules registration and dependency injection automatically. See [Manual Module Registration](#manual-module-registration) section if you need to understand what the helper does or configure modules manually
> - You can use environment variables instead of hardcoding options, especially important for credentials like `accountId` and `licenseKey`
> - The example above will use `PC040100` for each product. See [Advanced Usage](#advanced-usage) for assigning specific tax codes to individual products
> - The plugin automatically syncs your Medusa stock locations with Avalara locations on startup for accurate tax calculations. However, since Medusa doesn't emit events for stock location changes, if you create or update a location after startup, you'll need to either restart the app or manually call `POST /admin/avalara-cache/feed` to refresh the cache
> - The plugin fully supports tax-inclusive pricing and automatically respects the region's tax-inclusive preferences
> - The region's `Automatic Taxes` configuration is critical for API efficiency. When enabled, Medusa calls the tax provider's `getTaxLines` method multiple times during the checkout flow (on shipping address updates, shipping method selection, etc.), which significantly increases the number of requests to the Avalara API. To optimize performance and reduce API calls, it's recommended to disable automatic taxes and instead manually trigger tax calculation by calling [POST `/store/carts/{id}/taxes`](https://docs.medusajs.com/api/store#carts_postcartsidtaxes) from your storefront when the order is ready for review — typically after the shipping method has been selected.
> - Discounts should be used with caution. Medusa does not use the exact tax amounts returned by Avalara but instead calculates taxes using the rates provided, which may lead to minor differences in final tax calculations when discounts are applied.

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

> **Note:** To disable Avalara and return to the default Medusa tax calculations, simply select **System** as your tax provider in the same settings.

## Configuration Options

Access your Avalara dashboard to obtain the required credentials:

- **Production**: https://admin.avalara.com/
- **Sandbox**: https://sandbox.admin.avalara.com/

| Option                     | Type                        | Required | Default      | Description                                                                                                              |
| -------------------------- | --------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `accountId`                | `number`                    | ✅       | -            | Your Avalara account ID                                                                                                  |
| `licenseKey`               | `string`                    | ✅       | -            | Your Avalara license key                                                                                                 |
| `environment`              | `"sandbox" \| "production"` | ✅       | -            | AvaTax environment                                                                                                       |
| `companyCode`              | `string`                    | ✅       | -            | Your company code in AvaTax                                                                                              |
| `companyId`                | `number`                    | ✅       | -            | Your Avalara company ID                                                                                                  |
| `documentRecordingEnabled` | `boolean`                   | ❌       | `true`       | Controls whether documents should be recorded in AvaTax. If set to `false` transactions (sales invoices) are not created |
| `machineName`              | `string`                    | ❌       | -            | Machine identifier                                                                                                       |
| `defaultTaxCode`           | `string`                    | ❌       | -            | Default tax code for products                                                                                            |
| `shippingTaxCode`          | `string`                    | ❌       | `"FR020100"` | Tax code for shipping                                                                                                    |

## Advanced Usage

### Authentication for Admin API Endpoints

The configuration endpoints for managing product tax codes and customer exemptions require admin credentials. You'll need to authenticate first to get a Bearer token that you'll use for subsequent API requests.

**Get Authentication Token:**

```bash
curl -X POST http://localhost:9000/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_admin_email@example.com",
    "password": "your_admin_password"
  }'
```

This will return a response containing a `token` field. Copy this token value to use in the `Authorization: Bearer YOUR_TOKEN_HERE` header for the admin API endpoints described below.

### Using Different Tax Codes for Products

In most e-commerce scenarios, different products require different tax codes based on their category, material, or intended use. The plugin uses the `avalara_product` table to determine which specific Avalara tax code should be applied to each product during tax calculations. You can manage these product-specific tax codes either by updating the database table directly or by using the provided admin API endpoint.

You can find the complete list of available Avalara tax codes at: https://taxcode.avatax.avalara.com/

By default, all products will use the `taxCodes.default` value. To assign specific Avalara tax codes to individual products, make a `PUT` request to `/admin/avalara-products` using your authentication token:

**Update Product Tax Codes:**

```bash
curl -X PUT http://localhost:9000/admin/avalara-products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "avalara_products": [
      {
        "product_id": "prod_123",
        "tax_code": "PC040100"
      },
      {
        "product_id": "prod_456",
        "tax_code": "PS081000"
      }
    ]
  }'
```

### Customer Tax Exemptions (Entity Use Codes)

Many businesses need to support tax-exempt customers such as government entities, non-profit organizations, or resellers. The plugin provides a complete system for managing customer exemptions using [Avalara's Entity Use Codes](https://help.avalara.com/Avalara_AvaTax_Update/Entity_Use_Codes).

For the complete list of predefined entity use codes, refer to the official Avalara [documentation](https://knowledge.avalara.com/bundle/rpb1660904325464_rpb1660904325464/page/List_of_entity_use_codes.html).

#### Managing Customer Exemptions

The plugin manages customer exemptions through the `avalara_customer` module, which stores entity use codes for exempt customers and caches them for fast lookup during tax calculations.

**Setting Customer Exemptions:**

```bash
curl -X PUT http://localhost:9000/admin/avalara-customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "avalara_customers": [
      {
        "customer_id": "cus_federal_agency",
        "entity_use_code": "A"
      },
      {
        "customer_id": "cus_nonprofit",
        "entity_use_code": "E"
      }
    ]
  }'
```

**Listing Customer Exemptions:**

```bash
curl -X GET "http://localhost:9000/admin/avalara-customers?offset=0&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Address Validation

The plugin provides a `POST /store/avalara-address` endpoint that serves as a proxy to Avalara's [ResolveAddressPost API](https://developer.avalara.com/api-reference/avatax/rest/v2/methods/Addresses/ResolveAddressPost/). Address validation is critical for accurate tax calculations, as Avalara requires correctly formatted and validated addresses to determine proper tax rates and jurisdictions.

**Request Body:**

```json
{
  "line1": "512 S Mangum St Ste 100",
  "city": "Durham",
  "region": "NC",
  "postalCode": "27701",
  "country": "US"
}
```

**Notes:**

- Address validation is available for US and Canadian addresses
- Use this endpoint in your storefront during checkout to validate and save corrected addresses before tax calculation
- The response includes validated addresses, coordinates, resolution quality, and tax authorities
- Refer to Avalara's API documentation for more details: https://developer.avalara.com/api-reference/avatax/rest/v2/methods/Addresses/ResolveAddressPost/

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
      resolve: "@u11d/medusa-avalara/modules/avalara-customer",
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

## How the plugin works?

The Medusa Avalara plugin integrates with Avalara's AvaTax service through a modular architecture:

### Core Components

**modules/avalara-product**

- Manages product-specific tax codes through the `AvalaraProduct` model and database migration
- Used by the `/admin/avalara-products` API endpoint
- Saves mapping of `product_id` → `avalara_tax_code` in cache for fast retrieval by the AvaTax provider

**modules/avalara-customer**

- Manages customer-specific tax exemptions through the `AvalaraCustomer` model and database migration
- Used by the `/admin/avalara-customers` API endpoint
- Saves mapping of `customer_id` → `entity_use_code` in cache for fast retrieval by the AvaTax provider
- Validates entity use codes against Avalara's predefined list and provides warnings for unrecognized codes

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

### Cached Data

The plugin uses Redis cache to store frequently accessed data for optimal performance during tax calculations. This cache strategy minimizes database queries and API calls, ensuring fast response times during checkout.

**Product Tax Codes** (`avalara:product:{product_id}`)

- Stores the mapping of Medusa product IDs to Avalara tax codes
- Fed by the `feed-avalara-product-cache` workflow step
- Retrieved during tax calculations to determine the appropriate tax code for each line item
- Falls back to `taxCodes.default` if no product-specific code is found

**Customer Exemptions** (`avalara:customer:{customer_id}`)

- Stores entity use codes for tax-exempt customers
- Fed by the `feed-avalara-customer-cache` workflow step
- Retrieved during tax calculations to apply exemptions when applicable
- Enables quick lookup of customer tax exemption status without database queries

**Tax-Inclusive Settings** (`avalara:tax_included:{country_code}`)

- Stores whether prices are tax-inclusive for each country
- Fed by the `feed-avalara-tax-inclusive-cache` workflow step
- Based on region price preferences configured in Medusa
- Critical for correctly calculating taxes in regions with tax-inclusive pricing

**Location Mappings** (`avalara:location:{country_code}` and `avalara:location:{country_code}_{province_code}`)

- Stores the mapping of geographic locations to Avalara location codes and addresses
- Fed by the `feed-avalara-location-cache` workflow step
- Syncs Medusa stock locations with Avalara locations for accurate origin-based tax calculations
- Supports both country-level and province/state-level location mappings for precise nexus determination

**Cache Management:**

- All cache entries use a 30-day TTL (Time To Live)
- The cache is automatically populated on application startup through the `init-feed-avalara-cache` job
- The cache is automatically refreshed every night at midnight via the `feed-avalara-cache` scheduled job
- Cache can be manually refreshed anytime via the `POST /admin/avalara-cache/feed` endpoint
- Individual module caches are also refreshed after bulk updates via their respective admin endpoints (e.g., after updating product tax codes or customer exemptions)

## Troubleshooting

### Migration Error: "relation ... does not exist"

If you encounter any of the following errors:

```
error: Failed to feed cache. Error: select "a0".* from "public"."avalara_product" as "a0" where "a0"."deleted_at" is null order by "a0"."created_at" desc limit 1000 - relation "public.avalara_product" does not exist. Please make sure migration adding avalara_product table has been run and cache module is injected to the module via medusa-config
```

```
Failed to feed cache. Error: select "a0".* from "public"."avalara_customer" as "a0" where "a0"."deleted_at" is null order by "a0"."created_at" desc limit 1000 - relation "public.avalara_customer" does not exist. Please make sure migration adding avalara_customer table has been run and cache module is injected to the module via medusa-config.
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

## Need help?

If you encounter any issues or need assistance with this plugin, please visit our [GitHub Issues](https://github.com/u11d-com/medusa-avalara/issues) page. Our team actively monitors and responds to bug reports, feature requests, and questions from the community. We aim to provide timely support to ensure your integration with Avalara runs smoothly.

Need expert assistance or want our team to support your Medusa project? We're here to help! Contact us at [https://u11d.com/contact/](https://u11d.com/contact/) for professional support and consultation services.

## Learn More

Read our comprehensive blog article about integrating Avalara with Medusa: [https://u11d.com/blog/automated-tax-calculations-medusa-avalara-integration](https://u11d.com/blog/automated-tax-calculations-medusa-avalara-integration/)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
