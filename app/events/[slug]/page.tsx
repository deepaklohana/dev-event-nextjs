import Image from 'next/image'
import { notFound } from 'next/navigation'
import React from 'react'
import { formatDateTime } from '@/lib/utils'
import BookEvent from '@/components/BookEvent'
import { IEvent } from '@/database/event.model'
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions'
import EventCard from '@/components/EventCard'


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const EventDetailItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => (
  <div className='flex-row-gap-2 items-center'>
    <Image src={icon} alt={alt} width={16} height={16} />
    <p className=' '>{label}</p>
  </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className='agenda'>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className='flex flex-row gap-2 flex-wrap'>
    {tags.map((tag) => (
      <div className='pill' key={tag}>
        {tag}
      </div>
    ))}
  </div>
)

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params

  try {
    const request = await fetch(`${BASE_URL}/api/events/${slug}`)

    if (!request.ok) {
      console.error(`Failed to fetch event: ${request.status} ${request.statusText}`)
      return notFound()
    }

    const data = await request.json()

    if (!data?.event) {
      console.error('Invalid event data received', data)
      return notFound()
    }

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = data.event

    if (!description) {
      return notFound()
    }
    const bookings = 10;

    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug)
    return (
      <section id='event'>
        <div className="header">
          <h1>Event Description</h1>
          <p className=''>{description}</p>
        </div>
        <div className="details">
          {/* Left Side - Event Content */}

          <div className="content">
            <Image src={image} alt='Event Banner' width={800} height={800} className='banner' />

            <section className='flex-col-gap-2'>
              <h2>Overview</h2>
              <p>{overview}</p>
            </section>


            <section className='flex-col-gap-2'>
              <h2>Event Details</h2>

              <EventDetailItem icon='/icons/calendar.svg' alt='calender' label={formatDateTime(date).dateOnly} />
              <EventDetailItem icon='/icons/clock.svg' alt='clock' label={time} />
              <EventDetailItem icon='/icons/pin.svg' alt='location' label={location} />
              <EventDetailItem icon='/icons/mode.svg' alt='mode' label={mode} />
              <EventDetailItem icon='/icons/audience.svg' alt='audience' label={audience} />
            </section>
            <EventAgenda agendaItems={Array.isArray(agenda) ? agenda : []} />

            <section className='   flex-col-gap-2'>
              <h2>About the Organizer</h2>
              <p>{organizer}</p>
            </section>

            <EventTags tags={Array.isArray(tags) ? tags : []} />
          </div>

          {/* Right Side - Booking Form */}
          <aside className='booking'>
            {/* <p className='text-lg font-semiblod '>Book Events</p> */}

            <div className='signup-card'>
              <h2>Book your Spot</h2>
              {bookings > 0 ? (
                <p className='text-sm'>Join {bookings} people who have already booked their spots</p>
              ) : (
                <p className='text-sm'>Be the first to book your spot</p>
              )}
              <BookEvent />
            </div>
          </aside>
        </div>
        <div className='flex w-full flex-col gap-4 pt-20'>
          <h2>Similar Events</h2>
          <div className='events'>
            {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
              <EventCard key={similarEvent._id as unknown as string} {...similarEvent} />
            ))}
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('An error occurred while fetching the event:', error)
    return notFound()
  }
}

export default EventDetailsPage
