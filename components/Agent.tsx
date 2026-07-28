"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback, createInterview } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type = "interview",
  questions = [],
  role = "",
  techstack = [],
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep a reference to messages to avoid stale closures inside Vapi handlers
  const messagesRef = useRef<SavedMessage[]>([]);
  messagesRef.current = messages;

  // 1. Setup Vapi Event Listeners
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage: SavedMessage = {
          role: message.role,
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.error("Vapi Error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  // 2. Save Data & Navigate when Call Status reaches FINISHED
  useEffect(() => {
    const handleCallFinished = async () => {
      if (callStatus !== CallStatus.FINISHED || isProcessing) return;

      setIsProcessing(true);

      try {
        if (type === "generate") {
          // ✅ FIX: Write newly generated interview details to Firestore BEFORE navigating!
          await createInterview({
            userId: userId!,
            role,
            type,
            techstack,
            questions,
            transcript: messagesRef.current,
          });

          router.push("/");
          router.refresh();
        } else {
          // Process feedback for an active interview
          const { success, feedbackId: id } = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messagesRef.current,
            feedbackId,
          });

          if (success && id) {
            router.push(`/interview/${interviewId}/feedback`);
          } else {
            console.error("Error saving feedback");
            router.push("/");
            router.refresh();
          }
        }
      } catch (error) {
        console.error("Error processing completion:", error);
        router.push("/");
        router.refresh();
      }
    };

    handleCallFinished();
  }, [callStatus, feedbackId, interviewId, isProcessing, role, router, techstack, type, userId, questions]);

  // 3. Initiate Call
  const handleCall = async () => {
  setCallStatus(CallStatus.CONNECTING);

  try {
    if (type === "generate") {
      await vapi.start(
        undefined,
        undefined,
        undefined,
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
        {
          variableValues: {
            username: userName,
            userid: userId,
            role: role || "Software Engineer", // 👈 NOW PASSED TO VAPI WORKFLOW
            techstack: Array.isArray(techstack) ? techstack.join(", ") : techstack, // 👈 NOW PASSED TO VAPI WORKFLOW
          },
        }
      );
    } else {
      let formattedQuestions = "";
      if (questions && questions.length > 0) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  } catch (error) {
    console.error("Failed to start Vapi call:", error);
    setCallStatus(CallStatus.INACTIVE);
  }
};

  // 4. Disconnect Gracefully
  const handleDisconnect = () => {
    try {
      setCallStatus(CallStatus.FINISHED);
      vapi.stop();
    } catch (err) {
      console.log("Call disconnected cleanly");
    }
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Live Transcript Display */}
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={messages.length}
              className="transition-opacity duration-500 opacity-0 animate-fadeIn"
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            className="relative btn-call"
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING || isProcessing}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />

            <span className="relative">
              {isProcessing
                ? "Saving..."
                : isCallInactiveOrFinished
                ? "Start Call"
                : "Connecting..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End Call
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;