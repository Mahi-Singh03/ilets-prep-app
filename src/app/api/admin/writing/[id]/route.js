import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/DBconnection";
import WritingQuestion from "@/src/models/writing";
import cloudinary from "@/src/lib/cloudinary";

export async function GET(request, { params }) {
  await dbConnect();

  const { id } = await params;

  const question = await WritingQuestion.findById(id);

  if (!question) {
    return NextResponse.json(
      { message: "Question not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(question);
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const question = await WritingQuestion.findById(id);

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const taskType = Number(formData.get("taskType"));
    const file = formData.get("image");

    if (file && file.size > 0) {
      if (question.image.publicId) {
        await cloudinary.uploader.destroy(question.image.publicId);
      }

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

      question.image = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    }

    question.title = title;
    question.description = description;
    question.taskType = taskType;

    await question.save();

    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const question = await WritingQuestion.findById(id);

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    if (question.image.publicId) {
      await cloudinary.uploader.destroy(question.image.publicId);
    }

    await question.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}