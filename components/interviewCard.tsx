import dayjs from 'dayjs';
import React from 'react'
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';


const InterviewCard = ({ interviewId, userid, role, type, techstack, createdAt }: InterviewCardProps) => {
  const feedback = null as Feedback | null;
  const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
  const formattedDate = dayjs(createdAt).format("MMM D, YYYY");

  // const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now().format('MMM D, YYYY'));

  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
      <div className='card-interview'>
        <div>
          <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
            <p className='badge-text'>{normalizedType}</p>
          </div>
          <Image 
          className='rounded-full object-fit size-[90]'
          src={getRandomInterviewCover()} alt="cover image" width={90} height={90}></Image>
        
          <h3 className='mt-5 capitalize'>
            {role} interview
          </h3>
          <div className='flex flex-row gap-5 mt-3'>
            <div className='flex flex-row gap-2'>
              <Image
              width={22}  height={22}
              src="/calender.svg" alt='calender'></Image>
              <p>{formattedDate}</p>
            </div>
            <div className='flex flex-row gap-2 items-center'>
              <Image src="/star.svg" alt="star" width={22} height={22}/>
              <p>{feedback?.totalScore || '---'}/100</p>
            </div>
          </div>
          <p className='line-clamp-2 mt-5'> 
            {feedback?.finalAssessment || "You havn't taken the interview yet."}
          </p>
        </div>
        <div className='flex flex-row justify-between'>
          <DisplayTechIcons techstack={techstack}></DisplayTechIcons>
          <Button className='btn-primary'>
            <Link href={feedback
              ? `/interview/${interviewId}/feedback`
              : `/interview/${interviewId}`
            }>
              {feedback ? 'Check Feedback' : 'View Interview'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}



export default InterviewCard;
