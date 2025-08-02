//api/controllers/Category.controller.js

import { handleError } from "../helpers/handleError.js";
import Category from "../models/category.model.js";
export const addCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const category = new Category({
      name,
      slug,
    });

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category added successfully.",
    });
  } catch (error) {
    console.error("addCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const showCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;
    const category = await Category.findById(categoryid);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Data not found.",
      });
    }
    res.status(200).json({
      category,
    });
  } catch (error) {
    console.error("showCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const { categoryid } = req.params;
    const category = await Category.findByIdAndUpdate(
      categoryid,
      {
        name,
        slug,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error("updateCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const deleteCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;
    await Category.findByIdAndDelete(categoryid);
    res.status(200).json({
      success: true,
      message: "Category Deleted successfully.",
    });
  } catch (error) {
    console.error("deleteCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getAllCategory = async (req, res, next) => {
  try {
    const category = await Category.find().sort({ name: 1 }).lean().exec();
    res.status(200).json({
      category,
    });
  } catch (error) {
    console.error("getAllCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
