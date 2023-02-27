import product from "./product"
import category from "./category"
import blockContent from "./blockContent"
import { user, account } from 'next-auth-sanity/schemas';
export const schemaTypes = [product, category, blockContent, user, account]
