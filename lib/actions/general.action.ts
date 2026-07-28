"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { revalidatePath } from "next/cache";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

// Helper to clean invalid trailing commas in JSON strings if needed
function cleanJSON(text: string) {
  return text.replace(/,\s*([}\]])/g, "$1");
}

// ==========================================
// 1. CREATE INTERVIEW (NEWLY ADDED)
// ==========================================
export async function createInterview(params: CreateInterviewParams) {
  const { userId, role, type, techstack, questions, transcript } = params;

  try {
    const interviewData = {
      userId,
      role: role || "Software Engineer",
      type: type || "Technical",
      techstack: techstack || [],
      questions: questions || [],
      transcript: transcript || [],
      finalized: true,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interviewData);

    // CRITICAL: Tells Next.js to clear cache and render new cards on dashboard
    revalidatePath("/");

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating interview:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ==========================================
// 2. CREATE FEEDBACK
// ==========================================
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
      .join("");

    let object;

    try {
      // Primary Attempt: Gemini 2.0 Flash
      const result = await generateObject({
        model: google("gemini-2.0-flash"),
        schema: feedbackSchema,
        prompt: `...`,
      });
      object = result.object;
    } catch (rateLimitErr) {
      console.warn("Primary model throttled, retrying with fallback model...");
      // Fallback Attempt: Gemini 1.5 Flash
      const fallbackResult = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: feedbackSchema,
        prompt: `...`,
      });
      object = fallbackResult.object;
    }

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    revalidatePath(`/interview/${interviewId}`);
    revalidatePath("/");

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}


// ==========================================
// 3. GET INTERVIEW BY ID
// ==========================================
export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const interview = await db.collection("interviews").doc(id).get();
    if (!interview.exists) return null;

    return { id: interview.id, ...interview.data() } as Interview;
  } catch (error) {
    console.error("Error fetching interview by ID:", error);
    return null;
  }
}

// ==========================================
// 4. GET FEEDBACK BY INTERVIEW ID
// ==========================================
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  try {
    const feedback = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (feedback.empty) return null;

    const feedbackDoc = feedback.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

// ==========================================
// 5. GET LATEST INTERVIEWS (COMMUNITY / DISCOVER)
// ==========================================
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  try {
    const interviews = await db
      .collection("interviews")
      .where("finalized", "==", true)
      .limit(limit)
      .get();

    return interviews.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Interview))
      .filter((interview) => interview.userId !== userId);
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return [];
  }
}

// ==========================================
// 6. GET INTERVIEWS BY USER ID
// ==========================================
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) {
    throw new Error("userId is required to fetch interviews.");
  }

  try {
    // Basic query to avoid mandatory Firestore composite index requirement
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .get();

    const result = interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];

    // Sort in JS runtime to avoid missing index exceptions
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
}