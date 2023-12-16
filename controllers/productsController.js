import { Product } from "../models";
import multer from "multer";
import path from "path";
import CustomErrorHandler from "../services/CustomErrorHandler";
import fs from "fs";
import productSchema from "../validators/productValidator";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image");

const productsController = {
  // create store
  async store(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      const filePath = req.file.path;

      const { error } = productSchema.validate(req.body);
      if (error) {
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });
        return next(error);
      }

      const { name, price, size } = req.body;
      let document;
      try {
        document = await Product.create({
          name,
          price,
          size,
          image: filePath,
        });
      } catch (err) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },

  // update
  update(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }
      const { error } = productSchema.validate(req.body);
      if (error) {
        // Delete the uploaded file
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }

        return next(error);
      }

      const { name, price, size } = req.body;
      let document;
      try {
        document = await Product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            price,
            size,
            ...(req.file && { image: filePath }),
          },
          {
            new: true,
          }
        );
      } catch (err) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },

  // destroy
  async destroy(req, res, next) {
    const product = await Product.findOneAndDelete({ _id: req.params.id });
    if (!product) {
      return next(new Error("Nothing to delete"));
    }

    //image delete
    const imagePath = product._doc.image;
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
      res.json(product);
    });
  },

  // get all products
  async index(req, res, next) {
    let products;
    try {
      products = await Product.find()
        .select("-updatedAt -__v")
        .sort({ _id: -1 });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.json(products);
  },

  // get single product
  async show(req, res, next) {
    let product;
    try {
      product = await Product.findOne({ _id: req.params.id }).select(
        "-updatedAt -__v"
      );
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.json(product);
  },
};

export default productsController;
