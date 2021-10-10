# Azure Storage Filed

```ts
import { AzureStorageConfig, azureStorageFile, azureStorageImage } from '@k6-contrib/fields-azure';
import 'dotenv/config';

const config: AzureStorageConfig = {
  azureStorageOptions: {
    account: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accessKey: process.env.AZURE_STORAGE_ACCESS_KEY,
    container: process.env.AZURE_STORAGE_CONTAINER,
  },
};

const Post = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    content: text(),
    image: azureStorageImage({ config }),
    file: azureStorageFile({ config }),
  },
});
```
