import { NextRequest, NextResponse } from 'next/server';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

const PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_SITE_CAPTCHA_KEY;

/**
 * Create an assessment to analyze the risk of a UI action.
 */
async function createRecaptchaAssessment({
  token,
  recaptchaAction,
}: {
  token: string;
  recaptchaAction: string;
}) {
  if (!PROJECT_ID || !RECAPTCHA_SITE_KEY) {
    console.error("reCAPTCHA Project ID or Site Key is not configured in environment variables.");
    // Do not expose detailed error messages to the client in production
    throw new Error("Server configuration error for reCAPTCHA.");
  }

  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(PROJECT_ID);

  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: RECAPTCHA_SITE_KEY,
      },
    },
    parent: projectPath,
  };

  try {
    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties?.valid) {
      console.log(`CreateAssessment call failed: token was ${response.tokenProperties?.invalidReason}`);
      return { success: false, error: `Token invalid: ${response.tokenProperties?.invalidReason}`, score: null };
    }

    if (response.tokenProperties?.action === recaptchaAction) {
      console.log(`reCAPTCHA score: ${response.riskAnalysis?.score}`);
      response.riskAnalysis?.reasons?.forEach((reason) => {
        console.log(reason);
      });
      // You can implement more sophisticated logic based on the score and reasons
      // For example, require MFA for low scores or block very low scores.
      return { success: true, score: response.riskAnalysis?.score, error: null };
    } else {
      console.log(`Action mismatch: Expected ${recaptchaAction}, got ${response.tokenProperties?.action}`);
      return { success: false, error: "Action mismatch.", score: null };
    }
  } catch (error) {
    console.error("Error creating reCAPTCHA assessment:", error);
    // Do not expose detailed error messages to the client in production
    throw new Error("Failed to verify reCAPTCHA token due to a server-side issue.");
  } finally {
    // Closing the client is important, especially in serverless environments.
    // Consider caching the client in high-traffic scenarios if appropriate for your deployment.
    await client.close();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, recaptchaAction } = await req.json();

    if (!token || !recaptchaAction) {
      return NextResponse.json({ success: false, error: 'Missing token or action.' }, { status: 400 });
    }

    // Ensure your environment is configured for Google Cloud authentication
    // e.g., GOOGLE_APPLICATION_CREDENTIALS environment variable is set.
    const assessmentResult = await createRecaptchaAssessment({ token, recaptchaAction });

    if (assessmentResult.success) {
      // Example: Check if the score is above a certain threshold
      // if (assessmentResult.score !== null && assessmentResult.score < 0.5) {
      //   return NextResponse.json({ success: false, error: 'Low reCAPTCHA score.', score: assessmentResult.score }, { status: 403 });
      // }
      return NextResponse.json({ success: true, score: assessmentResult.score });
    } else {
      return NextResponse.json({ success: false, error: assessmentResult.error || 'reCAPTCHA verification failed.' }, { status: 400 });
    }
  } catch (error) {
    console.error('reCAPTCHA verification API error:', error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error during reCAPTCHA verification.";
    // Avoid sending detailed internal error messages to the client in production
    return NextResponse.json({ success: false, error: "An unexpected error occurred during verification." }, { status: 500 });
  }
}