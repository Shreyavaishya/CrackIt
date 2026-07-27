import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import DisplayTechIcons from "./DisplayTechIcons";
import { Button } from "./ui/button";
import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  id,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  // 1. Safe Feedback Fetching
  let Feedback = null;
  if (userId && id) {
    try {
      Feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId,
        id,
      });
    } catch (error) {
      // Catch empty feedback for new interviews silently
      Feedback = null;
    }
  }

  // 2. Safe Date Parsing (Handles Firestore Timestamps)
  const rawDate = Feedback?.createdAt || createdAt;

let parsedDate: Date | string | number = Date.now();

if (rawDate) {
  // Cast rawDate to unknown/any to inspect .toDate() without TS complaining about 'never'
  const dateObj = rawDate as any;
  
  if (typeof dateObj?.toDate === "function") {
    parsedDate = dateObj.toDate();
  } else {
    parsedDate = rawDate as string | number | Date;
  }
}
  const formattedDate = dayjs(parsedDate).format("MMM D, YYYY");

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <Image
            src={getRandomInterviewCover()}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          {/* Interview Role */}
          <h3 className="mt-5 capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>{Feedback?.totalScore ? `${Feedback.totalScore}/100` : "---/100"}</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5">
            {Feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />

          <Button className="btn-primary" asChild>
            <Link
              href={
                Feedback
                  ? `/interview/${id}/feedback`
                  : `/interview/${id}`
              }
            >
              {Feedback ? "Check Feedback" : "View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;