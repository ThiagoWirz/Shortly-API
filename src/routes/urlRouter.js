import { Router } from "express";
import {
  deleteUrl,
  getShortUrl,
  postUrl,
} from "../controllers/urlController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import urlSchema from "../schemas/urlSchema.js";

const urlRouter = Router();

urlRouter.post(
  "/urls/shorten",
  validateSchemaMiddleware(urlSchema),
  validateTokenMiddleware,
  postUrl
);
urlRouter.get("/urls/:shortUrl", getShortUrl);
urlRouter.delete("/urls/:id", validateTokenMiddleware, deleteUrl);

export default urlRouter;
