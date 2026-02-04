import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event from "@/database/event.model";

/**
 * GET handler for fetching a single event by slug.
 * 
 * @param req - The incoming request object
 * @param params - Route parameters (slug is required)
 * @returns JSON response containing the event or error message
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectToDatabase();

        // Await params as required in Next.js 15+
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json({ message: "Slug is required" }, { status: 400 });
        }

        // Find event by slug
        const event = await Event.findOne({ slug });

        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Event fetched successfully", event }, { status: 200 });

    } catch (error) {
        console.error("GET /api/events/[slug] error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
