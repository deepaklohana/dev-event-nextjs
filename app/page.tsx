import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { events } from '@/lib/constants'
import React from 'react'


const page = () => {
  return (
    <section className=''>
      <h1 className='text-center'>The Hub for Every de <br /> Event You Can't Miss</h1>
      <p className='text-center mt-5'>Hackathons, Meetups, and Conference, All in One Place</p>
      <ExploreBtn/>
      <div className='mt-20 space-y-7'>
        <h3>Featured Events</h3>
        <ul className='events list-none'>
          {events.map((event)=>(
            <li key={event.title}>
              <EventCard {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default page
