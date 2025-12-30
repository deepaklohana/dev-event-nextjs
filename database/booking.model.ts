import mongoose, { Schema, model, models, Document } from 'mongoose';

// Interface for Booking document
export interface IBooking extends Document {
    eventId: mongoose.Schema.Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
        email: { type: String, required: true },
    },
    { timestamps: true }
);

// Pre-save hook for validation
// Pre-save hook for validation
BookingSchema.pre('save', async function () {
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(this.email)) {
        throw new Error('Invalid email format');
    }

    // Check if the referenced Event exists
    if (this.isModified('eventId')) {
        try {
            // We need to use mongoose.models.Event to access the registered model
            const EventModel = mongoose.models.Event;
            if (EventModel) {
                const eventExists = await EventModel.findById(this.eventId);
                if (!eventExists) {
                    throw new Error('Referenced Event does not exist');
                }
            }
        } catch (error) {
            throw error;
        }
    }
});

const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
