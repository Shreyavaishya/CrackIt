import Agent from '@/components/Agent'
import React from 'react'

function page () {
  return (
    <>
    <h3>
        Interview Generation
        <Agent 
        userName="You"
        userId="user1"
        type="generate">

        </Agent>
    </h3>
    </>
  )
}

export default page
