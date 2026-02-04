import Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import { NextRequest, NextResponse } from "next/server";


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Validate Cloudinary Config
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary Env Vars Missing", {
        cloud_name: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET
      });
      return NextResponse.json({ message: "Server Misconfiguration: Missing Cloudinary Keys" }, { status: 500 });
    }

    await connectToDatabase();

    const contentType = req.headers.get("content-type") || "";

    let event: any = {};

    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();
      event = Object.fromEntries(formData.entries());

      if (event.tags && typeof event.tags === 'string') {
        event.tags = JSON.parse(event.tags)
      }
      if (event.agenda && typeof event.agenda === 'string') {
        event.agenda = JSON.parse(event.agenda)
      }

      // Handle Image Upload if 'image' file is present
      const file = formData.get("image") as File;

      // If image is missing but required by schema, we should probably check it here
      // But let's first fix the upload logic

      if (file && file.size > 0 && file.name) {

        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "DevEvent",
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  reject(error);
                  return;
                }
                resolve(result);
              }
            );
            uploadStream.end(buffer);
          });

          if (uploadResult && uploadResult.secure_url) {
            event.image = uploadResult.secure_url;
          } else {
            console.error("Cloudinary upload succeeded but no secure_url returned");
            return NextResponse.json({ message: "Image upload failed to return URL" }, { status: 500 });
          }
        } catch (uploadError) {
          console.error("Cloudinary upload failed:", uploadError);
          return NextResponse.json({ message: "Image upload failed", error: String(uploadError) }, { status: 500 });
        }
      } else {
        // If file is not present or empty, event.image might be the File object or empty string
        // The Model expects a String (URL). If we didn't upload, and it's required, we should fail early with a clear message
        // unless the user provided a string URL in the 'image' field (which implies they passed a text field, not a file)

        // If event.image is a File object, Mongoose will fail casting to String or simply fail validation if it's treated as complex object
        // Let's ensure if it was a file that failed size check, we remove it or handle it.
        if (event.image instanceof File) {
          // User sent a file but it might be empty or we skipped it. 
          // If we skipped it, we should probably set it to undefined so validation fails cleanly or error out
          delete event.image;
        }
      }

    } else if (contentType.includes("application/json")) {
      event = await req.json();
    } else {
      const text = await req.text();
      try {
        event = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { message: "Unsupported text body: send JSON or form data" },
          { status: 400 }
        );
      }
    }

    // Basic required field checks
    if (!event.title) {
      return NextResponse.json({ message: "Missing required field: title" }, { status: 400 });
    }

    // Explicit check for image requirement to provide better error message
    if (!event.image) {
      return NextResponse.json({ message: "Missing required field: image. Please upload an image or provide a URL." }, { status: 400 });
    }


    // Auto-generate slug from title if not provided
    if (!event.slug) {
      const baseSlug = slugify(String(event.title), { lower: true, strict: true });
      event.slug = baseSlug;

      // Check for existing slug and append uniquifier if necessary
      let slugExists = await Event.findOne({ slug: event.slug });
      let counter = 1;
      while (slugExists) {
        event.slug = `${baseSlug}-${counter}`;
        slugExists = await Event.findOne({ slug: event.slug });
        counter++;
      }
    }

    let createdEvent;
    try {
      createdEvent = await Event.create({ ...event });
    } catch (err: any) {
      console.error("Event.create failed", err);
      // Mongoose validation errors -> 400
      if (err && err.name === "ValidationError") {
        const details = Object.values(err.errors || {}).map(
          (v: any) => v.message
        );
        return NextResponse.json(
          { message: "Validation failed", errors: details },
          { status: 400 }
        );
      }
      // Duplicate key (e.g., slug unique) -> 409
      if (err && err.code === 11000) {
        return NextResponse.json(
          { message: "Duplicate key error", keyValue: err.keyValue },
          { status: 409 }
        );
      }
      // Otherwise rethrow to outer catch
      throw err;
    }

    return NextResponse.json(
      { message: "Event created", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    await connectToDatabase();

    const events = await Event.find().sort({ createdAt: -1 })

    return NextResponse.json({ message: 'Event feteched successfully', events }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 })
  }
}