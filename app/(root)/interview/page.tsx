import Agent from '@/components/Agent'
import { getCurrentUser } from '@/lib/actions/auth.action';
import React from 'react'

async function page () {
  const user = await getCurrentUser();

  return (
    <>
    <h3>
        Interview Generation
        <Agent 
        userName={user?.name}
        userId={user?.id}
        type="generate">

        </Agent>
    </h3>
    </>
  )
}

export default page
