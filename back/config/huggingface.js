const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const MODEL_CONFIG = {
  name: process.env.HUGGINGFACE_MODEL,
  maxLength: parseInt(process.env.SUMMARY_MAX_LENGTH),
  minLength: parseInt(process.env.SUMMARY_MIN_LENGTH)
};

module.exports = { hf, MODEL_CONFIG };