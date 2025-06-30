const { hf, MODEL_CONFIG } = require('../config/huggingface');

const summarizeText = async (text) => {
  try {
    const summary = await hf.summarization({
      model: MODEL_CONFIG.name,
      inputs: text.substring(0, 1024),
      parameters: {
        max_length: MODEL_CONFIG.maxLength,
        min_length: MODEL_CONFIG.minLength,
        do_sample: false
      }
    });
    return summary.summary_text;
  } catch (error) {
    throw error;
  }
};

module.exports = { summarizeText };