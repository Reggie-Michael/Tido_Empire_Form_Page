import Prompt from "@models/prompt";
import { connectToDB } from "@utils/database";

export const GET = async (req, res) => {
  // const { userId, prompt, tag } = await req.json();
  try {
    await connectToDB();
    const prompt = await Prompt.find({}).populate('creator');
    return new Response(JSON.stringify(prompt), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to fetch all prompts", { status: 500 });
  }
};
