import * as predictionService from "./prediction.service.js";
import { successResponse } from "../../shared/utils/response.js";
import { productInputSchema } from "../../shared/validation/productInput.js"; // نفس مدخل recommendation/ — الاتنين بياخدوا منتج

export const getPrediction = async (req, res, next) => {
  try {
    const product = productInputSchema.parse(req.body);

    const prediction = await predictionService.getPrediction(product);

    return successResponse(res, 200, "Prediction generated", prediction);
  } catch (err) {
    next(err);
  }
};
