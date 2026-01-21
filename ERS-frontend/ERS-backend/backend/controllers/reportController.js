// controllers/reportController.js
import Registration from "../models/Registration.js";

export const eventReport = async (req, res) => {
  const data = await Registration.find().populate("event user");
  res.json(data);
};
