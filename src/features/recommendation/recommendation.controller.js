import * as recommendationService from "./recommendation.service.js";
import { successResponse } from "../../shared/utils/response.js";
import { productInputSchema } from "../../shared/validation/productInput.js"; // نفس مدخل prediction/ — الاتنين بياخدوا منتج

export const getRecommendation = async (req, res, next) => {
  try {
    const product = productInputSchema.parse(req.body);

    const recommendation = await recommendationService.getRecommendation(
      req.localUser._id,
      product,
    );

    return successResponse(
      res,
      200,
      "Recommendation generated",
      recommendation,
    );
  } catch (err) {
    next(err);
  }
};
