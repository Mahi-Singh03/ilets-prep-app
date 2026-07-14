import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/DBconnection";
import WritingQuestion from "@/src/models/writing";
import cloudinary from "@/src/lib/cloudinary";

export async function GET() {
  await dbConnect();

  const questions = await WritingQuestion.find().sort({
    createdAt: -1,
  });

  return NextResponse.json(questions);
}

export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const taskType = Number(formData.get("taskType"));
    const file = formData.get("image");

    let image = {
      url: "",
      publicId: "",
    };

    if (taskType === 1 && file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "ielts-writing",
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      image = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    }

    const question = await WritingQuestion.create({
      title,
      description,
      taskType,
      image,
    });

    return NextResponse.json(question, {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}