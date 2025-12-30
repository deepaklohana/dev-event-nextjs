import { Schema, model, models, Document } from 'mongoose';
import slugify from 'slugify';

// Interface for Event document
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: 'online' | 'offline' | 'hybrid';
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true },
        slug: { type: String, unique: true, required: true },
        description: { type: String, required: true },
        overview: { type: String, required: true },
        image: { type: String, required: true },
        venue: { type: String, required: true },
        location: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        mode: { type: String, required: true }, // Could be enum restricted if needed
        audience: { type: String, required: true },
        agenda: { type: [String], required: true },
        organizer: { type: String, required: true },
        tags: { type: [String], required: true },
    },
    { timestamps: true }
);

// Pre-save hook for slug generation and date validation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
EventSchema.pre('save', function (this: IEvent, next: any) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    // Validate and normalize date to ISO string if possible
    if (this.isModified('date')) {
        const parsedDate = new Date(this.date);
        if (isNaN(parsedDate.getTime())) {
            return next(new Error('Invalid date format'));
        }
        this.date = parsedDate.toISOString();
    }

    // Format time
    if (this.isModified('time') && !this.time) {
        return next(new Error('Time is required'));
    }

    next();
});

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
