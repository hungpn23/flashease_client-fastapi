"use server";

import { SERVER_URL } from "@/lib/constants";
import { HttpError } from "@/types/error.type";
import {
  StartLearningInput,
  StartLearningState,
} from "@/app/(home)/_types/start-learning.type";
import { cookies } from "next/headers";

export async function StartLearning(
  setId: string,
  previousState: StartLearningState,
  formData: FormData,
) {
  const input: StartLearningInput = {
    passcode: formData.get("passcode") as string,
  };
  const accessToken = (await cookies()).get("access_token")?.value;
  const response = await fetch(`${SERVER_URL}/set/start-learning/${setId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken || "nothing"}`,
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok)
    return {
      input: previousState.input,
      error: data as HttpError,
    } as StartLearningState;

  return {
    success: true,
    redirectUrl: `/library/${data.id as string}`,
  } as StartLearningState;
}
