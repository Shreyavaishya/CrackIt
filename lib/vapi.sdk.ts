"use client";
import { useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { getAuth } from "firebase/auth";

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);

export default function CallComponent() {
  useEffect(() => {
    const startVapi = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return console.error("User not authenticated");

      const userId = user.uid;
      const userName = user.displayName || user.email || "Guest";

      console.log("WORKFLOW ID", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID)

      await vapi.start(undefined, undefined, undefined, process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {

        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    };

    startVapi();
  }, []);

}
