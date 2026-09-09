import { successResponse } from "../../shared/utils/response.js";
import {
  searchProductsSchema,
  productDetailsSchema,
} from "./product.validation.js";
import {
  searchAndCompareProducts,
  getProductDetailsById,
} from "./product.service.js";

export const searchProducts = async (req, res, next) => {
  try {
    const filters = searchProductsSchema.parse(req.query);

    const data = await searchAndCompareProducts(req.localUser, filters);

    return successResponse(res, 200, "Products fetched", data);
  } catch (err) {
    next(err);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    // الـ id من المسار والـ productToken من الـ query — منتحقق منهن سوا
    const { id, productToken } = productDetailsSchema.parse({
      id: req.params.id,
      productToken: req.query.productToken,
    });

    const data = await getProductDetailsById({ productId: id, productToken });

    return successResponse(res, 200, "Product details fetched", data);
  } catch (err) {
    next(err);
  }
};
