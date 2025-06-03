import Replicate from 'replicate';
import dotenv from 'dotenv';
dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, negative_prompt } = req.body;
    
    // Enhanced prompt for better cake generation
    const enhancedPrompt = `A professional photograph of a beautiful cake: ${prompt}. High quality, detailed, food photography, studio lighting, 8k`;
    
    // Using a model fine-tuned for food/desserts
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: negative_prompt || "blurry, low quality, distorted, unrealistic, bad proportions",
          width: 768,
          height: 768,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 25,
        }
      }
    );

    // Replicate returns an array of image URLs
    const imageUrl = output[0];
    
    // You might want to download and store this image on your own server
    // For now, we'll just return the URL from Replicate
    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
}