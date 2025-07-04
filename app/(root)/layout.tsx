import { isAuthenticated } from "@/lib/actions/auth.action"
import Link from "next/link"
import { redirect } from "next/navigation";
import React, {ReactNode} from "react"

const RootLayout = async ({children} : {children: ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();

    // if(!isUserAuthenticated) redirect('/signin');
    
    return(
        <div className="root-layout">
            <nav>
                <Link 
                href= "/" 
                className="flex gap-2 items-center">
                <img 
                src="/logo.svg" 
                alt="Logo" 
                width={38} 
                height={32} />
                <h2 className="text-primary-100">CrackIt</h2>
                </Link>
            </nav>
            {children}
        </div>
    )
}

export default RootLayout